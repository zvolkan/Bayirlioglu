import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'İade Politikası | Bayırlıoğlu Grup',
  description: 'Bayırlıoğlu Grup iade ve değişim koşulları hakkında bilgi alın.',
}

const sections = [
  {
    title: '1. İade Süresi',
    content:
      'Ürünü teslim aldığınız tarihten itibaren 14 gün içinde, herhangi bir gerekçe göstermeksizin iade hakkınızı kullanabilirsiniz. İade talebi için müşteri hizmetlerimizle iletişime geçmeniz yeterlidir.',
  },
  {
    title: '2. İade Koşulları',
    content:
      'İade edilecek ürünlerin kullanılmamış, orijinal ambalajında ve faturasıyla birlikte gönderilmesi gerekmektedir. Tarım ilaçları ve kimyasallar, açılmış filtre ve sarf malzemeleri hijyen gerekçesiyle iade alınmamaktadır.',
  },
  {
    title: '3. İade Süreci',
    content:
      'Onaylanan iade taleplerinde ürün firmamıza ulaştıktan sonra 5 iş günü içinde ödeme iadesi yapılır. Kredi kartı iadeleri bankanıza bağlı olarak 3–10 iş günü içinde hesabınıza yansır. Havale/EFT iadeleri doğrudan banka hesabınıza aktarılır.',
  },
  {
    title: '4. Değişim Talebi',
    content:
      'Yanlış veya hasarlı ürün teslimi durumunda, teslimat tarihinden itibaren 3 gün içinde müşteri hizmetlerimizi arayarak değişim talebinde bulunabilirsiniz. Kargo ücreti tarafımızca karşılanır.',
  },
  {
    title: '5. Garanti Kapsamındaki Arızalar',
    content:
      'Garanti kapsamındaki arızalarda ürün, yetkili servisimize gönderilir. Onarım süresi ortalama 10–15 iş günüdür. Onarım mümkün değilse ürün değişimi veya bedel iadesi yapılır.',
  },
  {
    title: '6. İade ve Değişim İletişimi',
    content:
      'İade veya değişim talepleriniz için aşağıdaki kanallardan bize ulaşabilirsiniz:\n\nE-posta: iade@bayirlioglu.com\nTelefon: +90 507 178 16 33\nMesai saatleri: Pazartesi – Cumartesi, 08:30 – 19:00',
  },
]

export default function IadePolitikasiPage() {
  return (
    <main className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="mb-10">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Bayırlıoğlu Grup
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">İade Politikası</h1>
          <p className="text-gray-500 text-sm mt-2">Son güncelleme: Ocak 2026</p>
        </div>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link
            href="/iletisim"
            className="flex-1 text-center bg-gray-900 text-white py-3 px-6 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
          >
            İletişime Geç
          </Link>
          <Link
            href="/"
            className="flex-1 text-center border border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  )
}
