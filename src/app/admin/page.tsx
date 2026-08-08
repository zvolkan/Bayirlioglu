import Link from 'next/link'
import { adminLogout } from '@/app/actions/admin'
import { getOrderCountsByStatus } from '@/app/actions/admin-orders'
import { getOpenReturnCount } from '@/app/actions/returns'
import { prisma } from '@/lib/db'
import Icon from '@/components/ui/Icon'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [counts, unreadMessages, newApplications, lowStock, openReturns] = await Promise.all([
    getOrderCountsByStatus(),
    prisma.contactMessage.count({ where: { isRead: false } }).catch(() => 0),
    prisma.dealerApplication.count({ where: { status: 'new' } }).catch(() => 0),
    prisma.product
      .count({ where: { isActive: true, stockQuantity: { lte: 5 } } })
      .catch(() => 0),
    getOpenReturnCount().catch(() => 0),
  ])

  const activeOrders =
    (counts.CONFIRMED ?? 0) + (counts.PROCESSING ?? 0) + (counts.SHIPPED ?? 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
        <form action={adminLogout}>
          <button
            type="submit"
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Çıkış Yap
          </button>
        </form>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Aktif Sipariş</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{activeOrders}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Okunmamış Mesaj</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{unreadMessages}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Yeni Bayi Başvurusu</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{newApplications}</p>
        </div>
        {/* Sayı gösterip hiçbir yere gitmiyordu; hangi ürün olduğunu görmenin
            yolu yoktu. Ürün listesine bağlandı. */}
        <Link
          href="/admin/urunler/alb-tarim"
          className="bg-white rounded-2xl shadow-sm p-5 block hover:shadow-md transition-shadow"
        >
          <p className="text-xs text-gray-400 uppercase tracking-wide">Stoğu Azalan</p>
          <p className="text-2xl font-black text-orange-600 mt-1">{lowStock}</p>
          <p className="text-[11px] text-gray-400 mt-1">Ürün listesini aç →</p>
        </Link>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Bekleyen İade</p>
          <p className={`text-2xl font-black mt-1 ${openReturns > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {openReturns}
          </p>
        </div>
      </div>

      {/* Siparişler & formlar */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Yönetim
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/siparisler"
            className="block bg-white rounded-2xl shadow-sm p-6 hover-lift border border-gray-100 group"
          >
            <div className="mb-3 icon-pop"><Icon name="paket" className="w-8 h-8 text-gray-700" /></div>
            <h3 className="text-base font-bold text-gray-900">Siparişler</h3>
            <p className="text-sm text-gray-400 mt-1">
              Durum güncelle, kargo bilgisi gir, iade et
            </p>
          </Link>

          <Link
            href="/admin/blog"
            className="block bg-white rounded-2xl shadow-sm p-6 hover-lift border border-gray-100 group"
          >
            <div className="mb-3 icon-pop"><Icon name="yazar" className="w-8 h-8 text-gray-700" /></div>
            <h3 className="text-base font-bold text-gray-900">Blog Yazıları</h3>
            <p className="text-sm text-gray-400 mt-1">Yazı ekle, düzenle, yayına al</p>
          </Link>

          <Link
            href="/admin/iadeler"
            className="block bg-white rounded-2xl shadow-sm p-6 hover-lift border border-gray-100 group"
          >
            <div className="mb-3 icon-pop"><Icon name="yenile" className="w-8 h-8 text-gray-700" /></div>
            <h3 className="text-base font-bold text-gray-900">
              İade Talepleri
              {openReturns > 0 && (
                <span className="ml-2 text-[11px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full align-middle">
                  {openReturns}
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-400 mt-1">Cayma hakkı talepleri</p>
          </Link>

          <Link
            href="/admin/mesajlar"
            className="block bg-white rounded-2xl shadow-sm p-6 hover-lift border border-gray-100 group"
          >
            <div className="mb-3 icon-pop"><Icon name="eposta" className="w-8 h-8 text-gray-700" /></div>
            <h3 className="text-base font-bold text-gray-900">
              İletişim Mesajları
              {unreadMessages > 0 && (
                <span className="ml-2 text-[11px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full align-middle">
                  {unreadMessages}
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-400 mt-1">Siteden gelen mesajlar</p>
          </Link>

          <Link
            href="/admin/bayi-basvurulari"
            className="block bg-white rounded-2xl shadow-sm p-6 hover-lift border border-gray-100 group"
          >
            <div className="mb-3 icon-pop"><Icon name="garanti" className="w-8 h-8 text-gray-700" /></div>
            <h3 className="text-base font-bold text-gray-900">
              Bayi Başvuruları
              {newApplications > 0 && (
                <span className="ml-2 text-[11px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full align-middle">
                  {newApplications}
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-400 mt-1">Gelen bayilik talepleri</p>
          </Link>
        </div>
      </section>

      {/* Ürünler */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Ürün Yönetimi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/urunler/alb-tarim"
            className="block bg-white rounded-2xl shadow-sm p-6 hover-lift border border-green-100 group"
          >
            <div className="mb-3 icon-pop"><Icon name="filiz" className="w-8 h-8 text-green-600" /></div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors">
              ALB Tarım
            </h3>
            <p className="text-sm text-gray-400 mt-1">Tarım ürünleri yönetimi</p>
          </Link>

          <Link
            href="/admin/urunler/alb-su-aritma"
            className="block bg-white rounded-2xl shadow-sm p-6 hover-lift border border-blue-100 group"
          >
            <div className="mb-3 icon-pop"><Icon name="damla" className="w-8 h-8 text-blue-600" /></div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
              ALB Su Teknolojileri
            </h3>
            <p className="text-sm text-gray-400 mt-1">Su arıtma ürünleri yönetimi</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
