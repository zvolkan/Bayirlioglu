import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BRANDS } from '@/lib/constants'
import type { BrandKey } from '@/lib/types'
import Reveal from '@/components/ui/Reveal'
import RevealGroup from '@/components/ui/RevealGroup'

const VALID_BRANDS: BrandKey[] = ['alb-tarim', 'alb-su-aritma']

interface Props {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  if (!VALID_BRANDS.includes(brand as BrandKey)) return {}
  const cfg = BRANDS[brand as BrandKey]
  return {
    title: `Hakkımızda | ${cfg.name}`,
    description: `${cfg.name} hakkında: tarihçemiz, ekibimiz ve değerlerimiz.`,
  }
}

const TARIM_TIMELINE = [
  { year: '2000', event: 'ALB Tarım kuruldu. İlk depomuz Anamur\'da açıldı.' },
  { year: '2005', event: 'Ulusal dağıtım ağımızı kurarak 50 ile ulaştık.' },
  { year: '2010', event: 'Organik tarım sertifikası alındı, 5.000 çiftçi milini geçtik.' },
  { year: '2015', event: 'Online satış platformumuz devreye girdi.' },
  { year: '2020', event: '15.000 çiftçi müşteri eşiği aşıldı, 81 il hedefi gerçekleşti.' },
  { year: '2025', event: 'Dijital tarım danışmanlık platformumuz hayata geçirildi.' },
]

const ALBSU_TIMELINE = [
  { year: '2003', event: 'Albsu, su arıtma alanında yolculuğuna başladı.' },
  { year: '2008', event: 'İlk klima ve iklimlendirme ürünleri portföye eklendi.' },
  { year: '2013', event: 'ISO 9001 Kalite Yönetim Sistemi sertifikası alındı.' },
  { year: '2017', event: 'Akıllı ev elektroniği ürünleri satışa sunuldu.' },
  { year: '2021', event: '1.000 başarılı montaj hedefi aşıldı.' },
  { year: '2025', event: 'Türkiye\'nin önde gelen su teknolojileri markası konumuna yükseldi.' },
]

export default async function HakkimizdaPage({ params }: Props) {
  const { brand } = await params
  if (!VALID_BRANDS.includes(brand as BrandKey)) notFound()

  const brandKey = brand as BrandKey
  const isAlbSu = brandKey === 'alb-su-aritma'
  const cfg = BRANDS[brandKey]
  const timeline = isAlbSu ? ALBSU_TIMELINE : TARIM_TIMELINE

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="brand-surface py-20">
        <div className="container-main">
          <nav className="text-sm text-white/50 mb-8">
            <Link href={`/${brandKey}`} className="hover:text-white">{cfg.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">Hakkımızda</span>
          </nav>
          <div className="max-w-2xl">
            <p className="font-bold uppercase text-sm tracking-widest mb-3 text-brand-400">Biz Kimiz</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              {cfg.name} Hakkında
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">{cfg.description}</p>
          </div>
        </div>
      </section>

      {/* Misyon & Vizyon */}
      <section className="py-16 container-main">
        <div className="grid md:grid-cols-2 gap-8">
          <RevealGroup itemClassName="h-full">
          <div className="h-full bg-white rounded-2xl border border-gray-100 p-4 sm:p-8 hover-lift">
            <div className="text-3xl mb-4">🎯</div>
            <h2 className="text-xl font-black text-gray-900 mb-3">Misyonumuz</h2>
            <p className="text-gray-600 leading-relaxed">
              {isAlbSu
                ? 'Her haneye temiz, güvenli ve lezzetli su ulaştırmak; enerji verimliliği yüksek klima ve elektronik ürünlerle yaşam kalitesini artırmak.'
                : 'Türk çiftçisine en kaliteli tarım girdilerini ve teknolojiyi ulaştırarak üretim verimliliğini artırmak ve sürdürülebilir tarımı yaygınlaştırmak.'}
            </p>
          </div>
          <div className="h-full bg-white rounded-2xl border border-gray-100 p-4 sm:p-8 hover-lift">
            <div className="text-3xl mb-4">🔭</div>
            <h2 className="text-xl font-black text-gray-900 mb-3">Vizyonumuz</h2>
            <p className="text-gray-600 leading-relaxed">
              {isAlbSu
                ? 'Türkiye\'nin lider su teknolojileri ve akıllı yaşam çözümleri şirketi olmak; yenilikçi ürün ve hizmetlerle bölge ülkelerine ihracat yapmak.'
                : 'Bölgenin lider tarım teknolojileri şirketi olmak; dijital tarım çözümleriyle Türk çiftçisini geleceğe taşımak.'}
            </p>
          </div>
          </RevealGroup>
        </div>
      </section>

      {/* Tarihçe */}
      <section className="py-16 bg-white">
        <div className="container-main">
          <Reveal>
            <div className="text-center mb-12">
              <p className="font-bold uppercase text-sm tracking-widest mb-2 text-brand-600">Tarihçe</p>
              <h2 className="text-3xl font-black text-gray-900">Yolculuğumuz</h2>
            </div>
          </Reveal>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-8">
                <RevealGroup variant="left">
                {timeline.map((item, i) => (
                  <div key={i} className="relative flex gap-6 pl-16">
                    <div className="absolute left-4 top-1 w-4 h-4 rounded-full ring-4 ring-white bg-brand-500 ring-brand-200" style={{ transform: 'translateX(-50%)' }} />
                    <div>
                      <p className="text-sm font-black text-brand-600 mb-1">{item.year}</p>
                      <p className="text-gray-700 leading-relaxed">{item.event}</p>
                    </div>
                  </div>
                ))}
                </RevealGroup>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="py-16 bg-gray-50">
        <div className="container-main">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <RevealGroup variant="scale" itemClassName="h-full">
            {cfg.stats.map((s) => (
              <div key={s.label} className="h-full text-center bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-4xl font-black text-brand-600 mb-2">{s.value}</p>
                <p className="text-gray-500 text-sm font-medium">{s.label}</p>
              </div>
            ))}
            <div className="h-full text-center bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-4xl font-black text-brand-600 mb-2">20+</p>
              <p className="text-gray-500 text-sm font-medium">Yıl Deneyim</p>
            </div>
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* Ekip Placeholder */}
      <section className="py-16 bg-white">
        <div className="container-main text-center">
          <Reveal>
            <p className="font-bold uppercase text-sm tracking-widest mb-3 text-brand-600">Ekibimiz</p>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Uzman Kadromuz</h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-10">
              {isAlbSu
                ? 'Su teknolojileri, klima sistemleri ve elektronik alanlarında 50+ uzman çalışanımız hizmetinizde.'
                : 'Agronomi, sulama mühendisliği ve tarım teknolojileri alanlarında 100+ uzman ekibimiz ile yanınızdayız.'}
            </p>
          </Reveal>
          {/* GÖRSEL: /public/images/team-group.jpg */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <RevealGroup variant="scale">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-3xl">
                👤
              </div>
            ))}
            </RevealGroup>
          </div>
          <Link
            href={`/${brandKey}/iletisim`}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors btn-press"
          >
            Bizimle İletişime Geçin
          </Link>
        </div>
      </section>
    </div>
  )
}
