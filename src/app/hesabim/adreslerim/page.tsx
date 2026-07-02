'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ACTIVE_BRAND_KEY, TURKISH_CITIES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const primaryColor = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'text-green-600' : 'text-blue-600'
const primaryBg = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'bg-green-600' : 'bg-blue-600'
const primaryHoverBg = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'hover:bg-green-500' : 'hover:bg-blue-500'
const primaryLight = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
const primaryBorder = ACTIVE_BRAND_KEY === 'alb-tarim' ? 'border-green-200' : 'border-blue-200'

const MOCK_USER = { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet.yilmaz@email.com' }

interface Address {
  id: number
  label: string
  firstName: string
  lastName: string
  phone: string
  city: string
  district: string
  address: string
  isDefault: boolean
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 1,
    label: 'Ev',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    phone: '0532 123 45 67',
    city: 'Ankara',
    district: 'Çankaya',
    address: 'Atatürk Mah. Güneş Sokak No:5 D:3',
    isDefault: true,
  },
  {
    id: 2,
    label: 'İş',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    phone: '0312 456 78 90',
    city: 'Ankara',
    district: 'Kızılay',
    address: 'Atatürk Bulvarı No:121 Kat:4',
    isDefault: false,
  },
]

function AccountSidebar({ active }: { active: string }) {
  const router = useRouter()
  const links = [
    { href: '/hesabim', label: 'Hesabım', icon: '👤' },
    { href: '/hesabim/siparislerim', label: 'Siparişlerim', icon: '📦' },
    { href: '/hesabim/adreslerim', label: 'Adreslerim', icon: '📍' },
    { href: '/hesabim/favorilerim', label: 'Favorilerim', icon: '❤️' },
  ]
  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={cn('p-6', primaryBg)}>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold mb-3">
            {MOCK_USER.firstName[0]}{MOCK_USER.lastName[0]}
          </div>
          <p className="text-white font-semibold">{MOCK_USER.firstName} {MOCK_USER.lastName}</p>
          <p className="text-white/70 text-sm">{MOCK_USER.email}</p>
        </div>
        <nav className="p-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                active === link.href ? primaryLight : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => router.push('/giris')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
          >
            <span>🚪</span>
            Çıkış Yap
          </button>
        </nav>
      </div>
    </aside>
  )
}

// ─── ADDRESS FORM MODAL ────────────────────────────────────────────────────────

interface AddressFormProps {
  address?: Address | null
  onClose: () => void
  onSave: (address: Omit<Address, 'id'>) => void
}

function AddressFormModal({ address, onClose, onSave }: AddressFormProps) {
  const [form, setForm] = useState({
    label: address?.label ?? '',
    firstName: address?.firstName ?? '',
    lastName: address?.lastName ?? '',
    phone: address?.phone ?? '',
    city: address?.city ?? '',
    district: address?.district ?? '',
    address: address?.address ?? '',
    isDefault: address?.isDefault ?? false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {address ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">Adres Etiketi</label>
            <input
              className="form-input"
              placeholder="Ev, İş, Çiftlik..."
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Ad</label>
              <input
                className="form-input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Soyad</label>
              <input
                className="form-input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Telefon</label>
            <input
              type="tel"
              className="form-input"
              placeholder="0532 000 00 00"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">İl</label>
              <select
                className="form-input"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              >
                <option value="">İl seçin</option>
                {TURKISH_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">İlçe</label>
              <input
                className="form-input"
                placeholder="İlçe"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Adres</label>
            <textarea
              className="form-input resize-none"
              rows={3}
              placeholder="Mahalle, sokak, kapı no..."
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
              Varsayılan adres olarak ayarla
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className={cn('flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-colors', primaryBg, primaryHoverBg)}
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function AdreslerimPage() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const handleSave = (data: Omit<Address, 'id'>) => {
    if (editingAddress) {
      setAddresses(addresses.map((a) =>
        a.id === editingAddress.id ? { ...data, id: a.id } : (data.isDefault ? { ...a, isDefault: false } : a)
      ))
    } else {
      const newId = Math.max(...addresses.map((a) => a.id)) + 1
      setAddresses([
        ...(data.isDefault ? addresses.map((a) => ({ ...a, isDefault: false })) : addresses),
        { ...data, id: newId },
      ])
    }
    setModalOpen(false)
    setEditingAddress(null)
  }

  const handleDelete = (id: number) => {
    setAddresses(addresses.filter((a) => a.id !== id))
  }

  const handleSetDefault = (id: number) => {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })))
  }

  const openAdd = () => { setEditingAddress(null); setModalOpen(true) }
  const openEdit = (a: Address) => { setEditingAddress(a); setModalOpen(true) }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">Ana Sayfa</Link>
          <span className="mx-2">/</span>
          <Link href="/hesabim" className="hover:text-gray-900">Hesabım</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Adreslerim</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar active="/hesabim/adreslerim" />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-2xl font-bold text-gray-900">Adreslerim</h1>
              <button
                onClick={openAdd}
                className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors', primaryBg, primaryHoverBg)}
              >
                <span>+</span> Yeni Adres Ekle
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-5xl mb-4">📍</p>
                <p className="text-gray-500">Kayıtlı adresiniz bulunmuyor.</p>
                <button
                  onClick={openAdd}
                  className={cn('mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors', primaryBg, primaryHoverBg)}
                >
                  İlk Adresinizi Ekleyin
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={cn(
                      'bg-white rounded-2xl border shadow-sm p-5 relative',
                      addr.isDefault ? primaryBorder : 'border-gray-100'
                    )}
                  >
                    {addr.isDefault && (
                      <span className={cn('absolute top-4 right-4 text-xs px-2.5 py-1 rounded-full font-medium', primaryLight)}>
                        Varsayılan
                      </span>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">📍</span>
                      <h3 className="font-semibold text-gray-900">{addr.label}</h3>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium text-gray-800">{addr.firstName} {addr.lastName}</p>
                      <p>{addr.phone}</p>
                      <p>{addr.address}</p>
                      <p>{addr.district} / {addr.city}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => openEdit(addr)}
                        className="flex-1 text-sm py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                      >
                        Düzenle
                      </button>
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className={cn('flex-1 text-sm py-2 rounded-lg border font-medium transition-colors', primaryBorder, primaryColor, 'hover:bg-gray-50')}
                        >
                          Varsayılan Yap
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="text-sm py-2 px-3 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <AddressFormModal
          address={editingAddress}
          onClose={() => { setModalOpen(false); setEditingAddress(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
