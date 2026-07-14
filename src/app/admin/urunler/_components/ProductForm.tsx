'use client'

import { useState, useRef, useTransition, useMemo } from 'react'
import { createSignedUploadUrl } from '@/app/actions/admin'

type Brand = { id: number; key: string; name: string }
type Category = { id: number; name: string; parentId?: number | null; brand: Brand }
type Spec = { name: string; value: string; unit: string }
type ImageRecord = { id: number; url: string; isPrimary: boolean }

interface ProductFormProps {
  brands: Brand[]
  categories: Category[]
  action: (formData: FormData) => Promise<void>
  defaultValues?: {
    id?: string
    name?: string
    slug?: string
    description?: string
    shortDescription?: string
    price?: number
    salePrice?: number | null
    stock?: number
    unit?: string
    sku?: string
    brandId?: number
    categoryId?: number
    isActive?: boolean
    isFeatured?: boolean
    specs?: Spec[]
    images?: ImageRecord[]
  }
  submitLabel?: string
}

export default function ProductForm({
  brands,
  categories,
  action,
  defaultValues = {},
  submitLabel = 'Kaydet',
}: ProductFormProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedBrandId, setSelectedBrandId] = useState<number>(
    defaultValues.brandId ?? brands[0]?.id ?? 0,
  )
  const [specs, setSpecs] = useState<Spec[]>(
    defaultValues.specs?.map((s) => ({ name: s.name, value: s.value, unit: s.unit ?? '' })) ?? [
      { name: '', value: '', unit: '' },
    ],
  )

  const existingImageUrl = defaultValues.images?.find((i) => i.isPrimary)?.url ?? null

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(existingImageUrl)
  const [imagePreview, setImagePreview]         = useState<string | null>(existingImageUrl)
  const [replaceImage, setReplaceImage]         = useState(false)
  const [uploading, setUploading]               = useState(false)
  const [uploadError, setUploadError]           = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Kategori hiyerarşisi ─────────────────────────────────────────────────
  // parentCategories: parentId === null olan ana kategoriler (seçilen marka için)
  // allChildren: parentId !== null olan alt kategoriler (seçilen marka için)
  // hasHierarchy: her iki seviye de varsa true → 2 kademeli UI göster

  const parentCategories = useMemo(
    () => categories.filter((c) => c.brand.id === selectedBrandId && c.parentId == null),
    [categories, selectedBrandId],
  )

  const allChildren = useMemo(
    () => categories.filter((c) => c.brand.id === selectedBrandId && c.parentId != null),
    [categories, selectedBrandId],
  )

  const hasHierarchy = parentCategories.length > 0 && allChildren.length > 0

  // Düzenleme modunda mevcut categoryId'nin parent'ını bul
  function resolveInitialParentId(brandId: number): number {
    if (defaultValues.categoryId) {
      const currentCat = categories.find((c) => c.id === defaultValues.categoryId)
      if (currentCat?.parentId != null) return currentCat.parentId
    }
    return categories.find((c) => c.brand.id === brandId && c.parentId == null)?.id ?? 0
  }

  const [selectedParentId, setSelectedParentId] = useState<number>(() =>
    resolveInitialParentId(selectedBrandId),
  )

  // Seçilen parent'a göre filtrelenmiş çocuk kategoriler
  const filteredChildren = useMemo(
    () => allChildren.filter((c) => c.parentId === selectedParentId),
    [allChildren, selectedParentId],
  )

  // Flat kategoriler (hiyerarşi yoksa)
  const flatCategories = useMemo(
    () => (!hasHierarchy ? categories.filter((c) => c.brand.id === selectedBrandId) : []),
    [categories, selectedBrandId, hasHierarchy],
  )

  // Seçili alt kategori (controlled)
  function resolveInitialCategoryId(): number {
    if (defaultValues.categoryId) return defaultValues.categoryId
    return 0
  }
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(resolveInitialCategoryId)

  // ── Yardımcılar ──────────────────────────────────────────────────────────

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  function addSpec() { setSpecs((prev) => [...prev, { name: '', value: '', unit: '' }]) }
  function removeSpec(idx: number) { setSpecs((prev) => prev.filter((_, i) => i !== idx)) }
  function updateSpec(idx: number, field: keyof Spec, val: string) {
    setSpecs((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)))
  }

  // ── Marka değişince parent/child sıfırla ─────────────────────────────────
  function handleBrandChange(newBrandId: number) {
    setSelectedBrandId(newBrandId)
    const firstParent = categories.find((c) => c.brand.id === newBrandId && c.parentId == null)
    setSelectedParentId(firstParent?.id ?? 0)
    setSelectedCategoryId(0)
  }

  // ── Görsel yükleme (Supabase Storage → signed URL) ───────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImagePreview(URL.createObjectURL(file))
    setUploading(true)
    setUploadError(null)

    try {
      const slugInput = document.getElementById('slug-input') as HTMLInputElement
      const slug = slugInput?.value?.trim() || `urun-${Date.now()}`
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `${slug}.${ext}`

      const { signedUrl, publicUrl } = await createSignedUploadUrl(fileName)

      const res = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      setUploadedImageUrl(publicUrl)
      setReplaceImage(true)
    } catch (err) {
      console.error('[ProductForm] upload error:', err)
      setUploadError('Görsel yüklenemedi. Lütfen tekrar deneyin.')
      setImagePreview(existingImageUrl)
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }

  // ── Form gönderimi ────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (uploading) return

    const formData = new FormData(e.currentTarget)
    formData.set('specs', JSON.stringify(specs))

    // Dosya asla sunucuya gönderilmez — zaten Supabase'e yüklendi
    formData.delete('imageFile')

    if (replaceImage && uploadedImageUrl) {
      formData.set('imageUrl', uploadedImageUrl)
      formData.set('replaceImage', 'true')
    } else {
      const manualUrl = (formData.get('imageUrl') as string)?.trim()
      formData.set('replaceImage', manualUrl ? 'true' : 'false')
    }

    startTransition(async () => {
      await action(formData)
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Temel Bilgiler ── */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-gray-800 text-base border-b pb-3">Temel Bilgiler</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Marka */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marka *</label>
            <select
              name="brandId"
              required
              value={selectedBrandId}
              onChange={(e) => handleBrandChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* ── Kategori: Hiyerarşik ── */}
          {hasHierarchy ? (
            <>
              {/* Ana Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ana Kategori *</label>
                <select
                  required
                  value={selectedParentId || ''}
                  onChange={(e) => {
                    const newParentId = Number(e.target.value)
                    setSelectedParentId(newParentId)
                    setSelectedCategoryId(0)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seçiniz</option>
                  {parentCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Alt Kategori — categoryId burada gönderilir */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Kategori *
                  {selectedParentId > 0 && filteredChildren.length === 0 && (
                    <span className="ml-2 text-xs text-amber-600 font-normal">
                      Bu ana kategoride alt kategori bulunamadı
                    </span>
                  )}
                </label>
                <select
                  name="categoryId"
                  required
                  value={selectedCategoryId || ''}
                  onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seçiniz</option>
                  {filteredChildren.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            /* ── Kategori: Flat ── */
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
              <select
                name="categoryId"
                required
                defaultValue={defaultValues.categoryId ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seçiniz</option>
                {flatCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Ürün Adı */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı *</label>
            <input
              name="name"
              required
              defaultValue={defaultValues.name ?? ''}
              onChange={(e) => {
                const slugInput = document.getElementById('slug-input') as HTMLInputElement
                if (slugInput && !defaultValues.id) slugInput.value = slugify(e.target.value)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: Husqvarna 135 Mark II"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input
              id="slug-input"
              name="slug"
              required
              defaultValue={defaultValues.slug ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="urun-adi"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Ürün Kodu</label>
            <input
              name="sku"
              defaultValue={defaultValues.sku ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="HUS-135-MK2"
            />
          </div>
        </div>

        {/* Kısa Açıklama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kısa Açıklama</label>
          <textarea
            name="shortDescription"
            rows={2}
            defaultValue={defaultValues.shortDescription ?? ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ürünün kısa özeti (kart ve liste sayfasında görünür)"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tam Açıklama</label>
          <textarea
            name="description"
            rows={5}
            defaultValue={defaultValues.description ?? ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Detaylı ürün açıklaması"
          />
        </div>
      </section>

      {/* ── Fiyat & Stok ── */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-gray-800 text-base border-b pb-3">Fiyat & Stok</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺) *</label>
            <input
              name="price" type="number" step="0.01" min="0" required
              defaultValue={defaultValues.price ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İndirimli Fiyat (₺)</label>
            <input
              name="salePrice" type="number" step="0.01" min="0"
              defaultValue={defaultValues.salePrice ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stok Adedi *</label>
            <input
              name="stockQuantity" type="number" min="0" required
              defaultValue={defaultValues.stock ?? 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Birim</label>
            <select
              name="unit"
              defaultValue={defaultValues.unit ?? 'adet'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="adet">adet</option>
              <option value="kg">kg</option>
              <option value="lt">lt</option>
              <option value="litre">litre</option>
              <option value="m">m</option>
              <option value="m²">m²</option>
              <option value="çift">çift</option>
              <option value="paket">paket</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Görsel ── */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-base border-b pb-3">Ürün Görseli</h2>

        {/* Önizleme */}
        {imagePreview && (
          <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Önizleme" className="w-full h-full object-contain" />
            {uploading && (
              <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Yükleme durumu / hata */}
        {uploading && (
          <p className="text-sm text-blue-600 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
            Görsel Supabase Storage&apos;a yükleniyor…
          </p>
        )}
        {uploadError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            {uploadError}
          </p>
        )}
        {!uploading && replaceImage && uploadedImageUrl && !uploadError && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
            ✓ Görsel başarıyla yüklendi
          </p>
        )}

        <div className="flex flex-col gap-3">
          {/* Dosya yükle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosya Yükle
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                (Supabase&apos;e doğrudan yüklenir — boyut sınırı yok)
              </span>
            </label>
            <input
              ref={fileRef}
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="block text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
          </div>

          {/* Manuel URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              veya Görsel URL&apos;si <span className="text-xs font-normal text-gray-400">(public/ dizini)</span>
            </label>
            <input
              name="imageUrl"
              type="text"
              defaultValue={
                existingImageUrl && !existingImageUrl.includes('supabase')
                  ? existingImageUrl
                  : ''
              }
              onChange={(e) => {
                const val = e.target.value.trim()
                if (val) {
                  setImagePreview(val)
                  setUploadedImageUrl(val)
                  setReplaceImage(true)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="/images/urun-adi.jpg"
            />
          </div>
        </div>
      </section>

      {/* ── Teknik Özellikler ── */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-semibold text-gray-800 text-base">Teknik Özellikler</h2>
          <button
            type="button"
            onClick={addSpec}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Özellik Ekle
          </button>
        </div>

        {specs.map((spec, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-3 items-center">
            <input
              value={spec.name}
              onChange={(e) => updateSpec(idx, 'name', e.target.value)}
              placeholder="Özellik adı"
              className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              value={spec.value}
              onChange={(e) => updateSpec(idx, 'value', e.target.value)}
              placeholder="Değer"
              className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              value={spec.unit}
              onChange={(e) => updateSpec(idx, 'unit', e.target.value)}
              placeholder="Birim"
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => removeSpec(idx)}
              className="col-span-1 text-gray-400 hover:text-red-500 text-xl leading-none"
              title="Sil"
            >
              ×
            </button>
          </div>
        ))}

        {specs.length === 0 && (
          <p className="text-sm text-gray-400 italic">Henüz özellik eklenmedi.</p>
        )}
      </section>

      {/* ── Yayın Durumu ── */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 text-base border-b pb-3 mb-4">Yayın Durumu</h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="hidden" name="isActive" value="false" />
            <input
              type="checkbox"
              name="isActive"
              value="true"
              defaultChecked={defaultValues.isActive ?? true}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Aktif (sitede görünsün)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="hidden" name="isFeatured" value="false" />
            <input
              type="checkbox"
              name="isFeatured"
              value="true"
              defaultChecked={defaultValues.isFeatured ?? false}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Öne Çıkan (anasayfada görünsün)</span>
          </label>
        </div>
      </section>

      {/* ── Submit ── */}
      <div className="flex items-center justify-end gap-4">
        <a
          href="/admin/urunler"
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          İptal
        </a>
        <button
          type="submit"
          disabled={isPending || uploading}
          className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Görsel yükleniyor…' : isPending ? 'Kaydediliyor...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
