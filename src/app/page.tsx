import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Reveal from '@/components/ui/Reveal'
import Icon, { type IconName } from '@/components/ui/Icon'
import RevealGroup from '@/components/ui/RevealGroup'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { KURULUS_YILI } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Bayırlıoğlu — ALB Tarım & Alb Su Teknolojileri',
  description:
    "Bayırlıoğlu bünyesindeki ALB Tarım ve Alb Su Teknolojileri markaları ile tarım, su arıtma ve teknoloji alanlarında Türkiye'ye hizmet veriyoruz.",
  keywords: ['Bayırlıoğlu', 'ALB Tarım', 'Alb Su Teknolojileri', 'su arıtma', 'tarım ürünleri'],
}

// ─── İstatistikler ───────────────────────────────────────────────────────────
// Doğrulanamayan rakamlar kaldırıldı.
const STATS = [
  { value: 'Anamur', label: 'Merkez' },
  { value: '2', label: 'Marka' },
  { value: '81 İl', label: 'Teslimat Ağı' },
  { value: '11', label: 'Tedarik Markası' },
]

// ─── Değerlerimiz ─────────────────────────────────────────────────────────────
const VALUES: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: 'garanti',
    title: 'Güven',
    desc: 'Sattığımız ürünün arkasında dururuz. Verdiğimiz teslimat ve servis sözünü tutarız.',
  },
  {
    icon: 'fikir',
    title: 'İnovasyon',
    desc: 'En güncel teknoloji ve ürünleri Türk tüketicisiyle buluşturuyoruz.',
  },
  {
    icon: 'filiz',
    title: 'Sürdürülebilirlik',
    desc: 'Doğayı koruyarak üretmek, gelecek nesillere sağlıklı bir dünya bırakmak önceliğimizdir.',
  },
  {
    icon: 'yildiz',
    title: 'Kalite',
    desc: 'Sattığımız her ürün titizlikle seçilir, satış sonrası desteğimiz kesintisiz sürer.',
  },
]

// ─── Galeri ──────────────────────────────────────────────────────────────────
//
// Burada dört boş gri kutu duruyordu ("Merkez Ofisimiz", "Tarım Ekibimiz"…).
// Fotoğraf konmadığı için ziyaretçiye yarım kalmış bir sayfa gibi görünüyordu.
// Gerçek fotoğraflarınızı `public/images/galeri/` altına koyup bu diziyi
// doldurun; dizi boşken bölüm hiç render edilmiyor.
const GALLERY_ITEMS: { label: string; src: string; aspect: string }[] = []

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex items-center bg-gray-900 overflow-hidden">
        {/* Arka plan gradient — Bayırlıoğlu: charcoal/stone */}
        {/* GÖRSEL: /public/images/bayirlioglu-hero.jpg */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-stone-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(82,82,82,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(120,113,108,0.2),transparent_55%)]" />

        <div className="relative z-10 container-main w-full py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo mark */}
            <div className="flex justify-center mb-6 anim-scale-in">
              <Image
                src="/images/logo-mark-white.svg"
                alt="Bayırlıoğlu"
                width={72}
                height={72}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain opacity-90 float-soft"
              />
            </div>

            {/* Kuruluş yılı rozeti */}
            <span className="anim-fade-up anim-delay-150 inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white/75 text-sm px-4 py-1.5 rounded-full mb-8 font-medium">
              <span className="w-2 h-2 rounded-full bg-stone-400 animate-pulse" />
              Anamur Merkezli, Türkiye Geneli Teslimat
            </span>

            <h1 className="anim-fade-up anim-delay-200 text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              <span className="gradient-pan block text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-200 to-stone-400">
                Bayırlıoğlu
              </span>
            </h1>
            <p className="anim-fade-up anim-delay-300 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
              Anamur&apos;daki dükkânımızda tarım girdileri ve su arıtma sistemleri satıyoruz;
              su sistemlerinin kurulumunu ve servisini kendi ekibimiz yapıyor.
            </p>

            {/* Marka seçim kartları — büyük CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Link
                href="/alb-tarim"
                className="anim-fade-up anim-delay-400 arrow-slide group relative flex flex-col items-center gap-3 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-2xl p-7 transition-all duration-300 shadow-xl hover:shadow-green-600/40 hover:-translate-y-1.5 hover:scale-[1.02]"
              >
                <Icon name="filiz" className="w-10 h-10 icon-pop" />
                <div>
                  <p className="font-black text-xl">ALB Tarım</p>
                  <p className="text-green-100/80 text-sm mt-1">Gübre · Sulama · Tarım İlaçları</p>
                </div>
                <span className="mt-2 text-sm font-semibold flex items-center gap-1.5 text-green-100">
                  Keşfet <span className="arrow">→</span>
                </span>
              </Link>

              <Link
                href="/alb-su-aritma"
                className="anim-fade-up anim-delay-500 arrow-slide group relative flex flex-col items-center gap-3 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl p-7 transition-all duration-300 shadow-xl hover:shadow-blue-600/40 hover:-translate-y-1.5 hover:scale-[1.02]"
              >
                <Icon name="damla" className="w-10 h-10 icon-pop" />
                <div>
                  <p className="font-black text-xl">Alb Su Teknolojileri</p>
                  <p className="text-blue-100/80 text-sm mt-1">Su Arıtma · Klima · Elektronik</p>
                </div>
                <span className="mt-2 text-sm font-semibold flex items-center gap-1.5 text-blue-100">
                  Keşfet <span className="arrow">→</span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Alt dalga dekorasyonu */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── İSTATİSTİKLER ── */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="container-main">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <RevealGroup stagger={110} variant="up">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <AnimatedCounter
                    value={s.value}
                    className="block text-3xl sm:text-4xl font-black text-gray-900 tabular-nums"
                  />
                  <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ── BİZ KİMİZ ── */}
      <section className="py-20 bg-gray-50">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Metin */}
            <Reveal variant="left">
              <p className="text-stone-600 font-bold uppercase text-sm tracking-widest mb-3">
                Kurumsal
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-6">
                Biz Kimiz?
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Bayırlıoğlu, {KURULUS_YILI} yılında Anamur&apos;da kurulan ve bugün iki markası
                  altında çalışan bir aile şirketidir.
                </p>
                <p>
                  <strong className="text-gray-800">ALB Tarım</strong> markamız altında organik
                  gübre, damla sulama sistemleri ve tarım ilaçlarıyla çiftçilerimize üretimlerini
                  artırma desteği verirken;{' '}
                  <strong className="text-gray-800">Alb Su Teknolojileri</strong> markamızla
                  su arıtma, klima ve akıllı ev elektroniği alanlarında evlere ve iş yerlerine
                  hizmet sunuyoruz.
                </p>
                <p>
                  Ürünlerimizi Anamur&apos;daki dükkânımızdan satıyor, siparişleri kargoyla
                  Türkiye&apos;nin 81 iline gönderiyoruz.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/alb-tarim/hakkimizda"
                  className="btn-press inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
                >
                  ALB Tarım Hakkında
                </Link>
                <Link
                  href="/alb-su-aritma/hakkimizda"
                  className="btn-press inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
                >
                  Alb Su Hakkında
                </Link>
              </div>
            </Reveal>

            {/* Fotoğraflar eklenene kadar bu bölüm hiç görünmüyor */}
            {GALLERY_ITEMS.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <RevealGroup variant="scale" stagger={100} baseDelay={120}>
                  {GALLERY_ITEMS.map((item) => (
                    <div
                      key={item.label}
                      className={`${item.aspect} img-zoom hover-lift rounded-2xl relative overflow-hidden flex items-end p-3`}
                    >
                      <Image
                        src={item.src}
                        alt={item.label}
                        fill
                        sizes="(max-width: 768px) 45vw, 22vw"
                        className="img-zoom-target object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <p className="relative text-white text-xs font-semibold">{item.label}</p>
                    </div>
                  ))}
                </RevealGroup>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MARKALARIMIZ ── */}
      <section className="py-20 bg-white">
        <div className="container-main">
          <Reveal className="text-center mb-14">
            <p className="text-stone-600 font-bold uppercase text-sm tracking-widest mb-3">
              Markalarımız
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              İki Markamız, İki İş Kolumuz
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ALB Tarım */}
            <Reveal variant="up" className="h-full">
            <div className="group h-full hover-lift rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-8 hover:shadow-xl hover:shadow-green-100">
              <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center text-3xl mb-6 icon-pop">
                <Icon name="filiz" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">ALB Tarım</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Organik gübreler, damla sulama sistemleri, tarım ilaçları ve tarım ekipmanları
                satıyoruz. Anamur&apos;daki dükkânımızdan alabilir ya da siparişinizi kargoyla
                adresinize gönderebilirsiniz.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                {['Organik & Kimyasal Gübreler', 'Damla & Yağmurlama Sulama', 'Bitki Koruma Ürünleri', 'Tarım Danışmanlık'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/alb-tarim"
                className="btn-press arrow-slide inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold"
              >
                ALB Tarım&apos;ı Keşfet <span className="arrow">→</span>
              </Link>
            </div>
            </Reveal>

            {/* Alb Su Teknolojileri */}
            <Reveal variant="up" delay={120} className="h-full">
            <div className="group h-full hover-lift rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 hover:shadow-xl hover:shadow-blue-100">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl mb-6 icon-pop">
                <Icon name="damla" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Alb Su Teknolojileri</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Su arıtma cihazları, klima sistemleri ve akıllı ev elektroniği satıyoruz.
                Kurulumu ve sonrasındaki bakımı kendi teknik ekibimiz yapıyor.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                {['RO Su Arıtma Sistemleri', 'Endüstriyel Su Arıtma & Yumuşatma', 'Inverter Klima Sistemleri', 'Akıllı Ev Elektroniği', 'Yerinde Teknik Servis'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/alb-su-aritma"
                className="btn-press arrow-slide inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Alb Su&apos;yu Keşfet <span className="arrow">→</span>
              </Link>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── DEĞERLERİMİZ ── */}
      <section className="py-20 bg-gray-900">
        <div className="container-main">
          <Reveal className="text-center mb-14">
            <p className="text-stone-400 font-bold uppercase text-sm tracking-widest mb-3">
              Felsefemiz
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Değerlerimiz</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <RevealGroup stagger={90} itemClassName="h-full">
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="group h-full bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1.5"
                >
                  <Icon name={v.icon} className="w-8 h-8 mb-4 icon-pop text-white" />
                  <h3 className="font-bold text-white text-lg mb-2">{v.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ── İLETİŞİM CTA ── */}
      <section className="py-20 bg-white">
        <Reveal className="container-main text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Bizimle İletişime Geçin
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-10">
            Hangi markamızla ilgilendiğinizi seçin ve size en iyi şekilde yardımcı olalım.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/alb-tarim/iletisim"
              className="btn-press inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold"
            >
              ALB Tarım İletişim
            </Link>
            <Link
              href="/alb-su-aritma/iletisim"
              className="btn-press inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Alb Su İletişim
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
