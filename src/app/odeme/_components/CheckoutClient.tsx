'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'

const KARGO_LIMIT = 500
const KARGO_UCRETI = 29.90

type SavedAddress = {
  id: string
  label: string
  fullName: string
  phone: string
  line1: string
  line2: string | null
  district: string
  city: string
  postalCode: string | null
  isDefault: boolean
}

type Props = {
  addresses: SavedAddress[]
}

function formatPrice(n: number) {
  return n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
}

const INPUT = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition'
const LABEL = 'block text-sm font-medium text-gray-700 mb-1'

export default function CheckoutClient({ addresses }: Props) {
  const items = useCartStore((s: { items: import('@/lib/types').CartItem[] }) => s.items)
  const clearCart = useCartStore((s: { clearCart: () => void }) => s.clearCart)

  const subtotal = items.reduce(
    (sum: number, item: import('@/lib/types').CartItem) =>
      sum + (item.product.salePrice ?? item.product.price) * item.quantity,
    0
  )
  const cargoFee = subtotal >= KARGO_LIMIT ? 0 : KARGO_UCRETI
  const total = parseFloat((subtotal + cargoFee).toFixed(2))

  // Address mode
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>(
    addresses.length > 0 ? 'saved' : 'new'
  )
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ''
  )

  // New address form
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    district: '',
    city: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [iyzicoHtml, setIyzicoHtml] = useState<string | null>(null)
  const scriptContainerRef = useRef<HTMLDivElement>(null)

  // Inject İyzico script when HTML is ready
  useEffect(() => {
    if (!iyzicoHtml || !scriptContainerRef.current) return

    const container = scriptContainerRef.current
    container.innerHTML = iyzicoHtml

    // Re-execute scripts (React doesn't run innerHTML scripts)
    container.querySelectorAll('script').forEach((oldScript: HTMLScriptElement) => {
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach((attr: Attr) =>
        newScript.setAttribute(attr.name, attr.value)
      )
      newScript.textContent = oldScript.textContent
      oldScript.parentNode?.replaceChild(newScript, oldScript)
    })
  }, [iyzicoHtml])

  // Empty cart guard
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🛒</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sepetiniz boş</h1>
          <p className="text-gray-500 text-sm mb-6">
            Ödeme yapabilmek için sepetinize ürün ekleyin.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    )
  }

  const brandKey = items[0]?.product.brand ?? 'alb-tarim'

  const getAddressData = () => {
    if (addressMode === 'saved') {
      const addr = addresses.find((a) => a.id === selectedAddressId)
      if (!addr) return null
      return {
        savedAddressId: addr.id,
        fullName: addr.fullName,
        line1: addr.line1,
        line2: addr.line2 ?? undefined,
        district: addr.district,
        city: addr.city,
      }
    }
    return {
      savedAddressId: undefined,
      fullName: newAddr.fullName,
      line1: newAddr.line1,
      line2: newAddr.line2 || undefined,
      district: newAddr.district,
      city: newAddr.city,
    }
  }

  const handleSubmit = async () => {
    setError(null)

    const addressData = getAddressData()
    if (!addressData) {
      setError('Lütfen bir teslimat adresi seçin.')
      return
    }

    if (addressMode === 'new') {
      if (!newAddr.fullName.trim()) { setError('Ad Soyad zorunludur.'); return }
      if (!newAddr.line1.trim()) { setError('Adres zorunludur.'); return }
      if (!newAddr.district.trim()) { setError('İlçe zorunludur.'); return }
      if (!newAddr.city.trim()) { setError('Şehir zorunludur.'); return }
    }

    setLoading(true)

    try {
      const cartItems = items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.salePrice ?? item.product.price,
        quantity: item.quantity,
      }))

      const res = await fetch('/api/odeme/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, addressData, brandKey }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Ödeme başlatılamadı.')
        setLoading(false)
        return
      }

      // Clear cart now — İyzico takes over from here
      clearCart()

      // Inject İyzico checkout form
      setIyzicoHtml(data.checkoutFormContent)
    } catch {
      setError('Bir hata oluştu, lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  // If İyzico HTML is injected, show loading overlay
  if (iyzicoHtml) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Güvenli ödeme penceresi açılıyor…</p>
          <p className="text-gray-400 text-sm mt-1">Lütfen bekleyin</p>
        </div>
        {/* İyzico injects its overlay via the script */}
        <div ref={scriptContainerRef} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Ödeme</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Teslimat adresinizi seçin, ardından güvenli ödeme ekranına geçin.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* SOL — Adres */}
          <div className="lg:col-span-2 space-y-5">

            {/* Adres Seçimi */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Teslimat Adresi</h2>

              {addresses.length > 0 && (
                <div className="flex gap-3 mb-5">
                  <button
                    onClick={() => setAddressMode('saved')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      addressMode === 'saved'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    Kayıtlı Adresim
                  </button>
                  <button
                    onClick={() => setAddressMode('new')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      addressMode === 'new'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    Yeni Adres Gir
                  </button>
                </div>
              )}

              {/* Saved addresses */}
              {addressMode === 'saved' && (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        selectedAddressId === addr.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-0.5 accent-gray-900"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-gray-900 text-sm">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Varsayılan</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{addr.fullName}</p>
                        <p className="text-sm text-gray-500">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.district} / {addr.city}
                        </p>
                        <p className="text-sm text-gray-400">{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                  <Link
                    href="/hesabim/adres-ekle"
                    className="inline-block text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                  >
                    + Yeni adres ekle
                  </Link>
                </div>
              )}

              {/* New address form */}
              {addressMode === 'new' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={LABEL}>Ad Soyad</label>
                    <input
                      className={INPUT}
                      placeholder="Adınız Soyadınız"
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr((p) => ({ ...p, fullName: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL}>Adres</label>
                    <input
                      className={INPUT}
                      placeholder="Mahalle, sokak, bina no, daire..."
                      value={newAddr.line1}
                      onChange={(e) => setNewAddr((p) => ({ ...p, line1: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL}>Adres 2 <span className="text-gray-400 font-normal">(isteğe bağlı)</span></label>
                    <input
                      className={INPUT}
                      placeholder="Apartman, site, kat..."
                      value={newAddr.line2}
                      onChange={(e) => setNewAddr((p) => ({ ...p, line2: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>İlçe</label>
                    <input
                      className={INPUT}
                      placeholder="İlçe"
                      value={newAddr.district}
                      onChange={(e) => setNewAddr((p) => ({ ...p, district: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Şehir</label>
                    <input
                      className={INPUT}
                      placeholder="Şehir"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr((p) => ({ ...p, city: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Güvenlik notu */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
              <span className="text-xl flex-shrink-0">🔒</span>
              <span>
                Ödemeniz İyzico güvencesiyle SSL şifreli bağlantı üzerinden gerçekleşir.
                Kart bilgileriniz sitemizde saklanmaz.
              </span>
            </div>

          </div>

          {/* SAĞ — Özet */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>

              {/* Ürünler */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => {
                  const price = item.product.salePrice ?? item.product.price
                  return (
                    <div key={item.product.id} className="flex justify-between text-sm gap-2">
                      <span className="text-gray-600 truncate flex-1">
                        {item.product.name}
                        <span className="text-gray-400 ml-1">×{item.quantity}</span>
                      </span>
                      <span className="font-medium text-gray-900 whitespace-nowrap flex-shrink-0">
                        {formatPrice(price * item.quantity)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span className={cargoFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {cargoFee === 0 ? 'Ücretsiz' : formatPrice(cargoFee)}
                  </span>
                </div>
                {subtotal < KARGO_LIMIT && (
                  <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-2.5 py-1.5">
                    {formatPrice(KARGO_LIMIT - subtotal)} daha ekleyin, kargo ücretsiz!
                  </p>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Toplam</span>
                  <span className="font-bold text-lg text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ödeme Başlatılıyor…
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    Güvenli Ödemeye Geç
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                İyzico güvencesiyle korunan ödeme
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
