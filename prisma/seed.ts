/**
 * prisma/seed.ts — Veritabanına başlangıç verilerini yükler
 * Çalıştır: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed başlatıldı...')

  // ─── Markalar ──────────────────────────────────────────────────────────────

  const albTarim = await prisma.brand.upsert({
    where: { key: 'alb-tarim' },
    update: {},
    create: {
      key: 'alb-tarim',
      name: 'ALB Tarım',
      description: 'Tarımsal çözümler: gübre, sulama, ilaç',
    },
  })

  const albSu = await prisma.brand.upsert({
    where: { key: 'alb-su-aritma' },
    update: {},
    create: {
      key: 'alb-su-aritma',
      name: 'Albsu Teknolojileri',
      description: 'Su arıtma, klima ve elektronik ev eşyaları',
    },
  })

  console.log('✅ Markalar oluşturuldu')

  // ─── Kategoriler — ALB Tarım ───────────────────────────────────────────────

  const catGubreler = await prisma.category.upsert({
    where: { slug: 'gubreler' },
    update: {},
    create: {
      brandId: albTarim.id, name: 'Gübreler', slug: 'gubreler',
      icon: '🌿', sortOrder: 1,
      description: 'Toprak ve yaprak gübreleri, organik çözümler',
    },
  })

  const catSulama = await prisma.category.upsert({
    where: { slug: 'sulama' },
    update: {},
    create: {
      brandId: albTarim.id, name: 'Sulama Sistemleri', slug: 'sulama',
      icon: '💧', sortOrder: 2,
      description: 'Damla sulama, sprinkler ve akıllı sulama çözümleri',
    },
  })

  const catIlac = await prisma.category.upsert({
    where: { slug: 'ilac' },
    update: {},
    create: {
      brandId: albTarim.id, name: 'Tarım İlaçları', slug: 'ilac',
      icon: '🧪', sortOrder: 3,
      description: 'Herbisitler, fungisitler, insektisitler',
    },
  })

  const catToprak = await prisma.category.upsert({
    where: { slug: 'toprak' },
    update: {},
    create: {
      brandId: albTarim.id, name: 'Toprak İyileştirici', slug: 'toprak',
      icon: '🪨', sortOrder: 6,
      description: 'pH düzenleyici, humik asit ve toprak kondisyonerleri',
    },
  })

  // ─── Eski Alb Su flat kategorilerini deaktive et ──────────────────────────
  // (su-aritma, klima, su-isitici, su-yumusatma, temizlik)
  // Bu kategoriler artık hiyerarşik yapıyla değiştirildi.
  const eskiAlbSuSluglar = ['su-aritma', 'klima', 'su-isitici', 'su-yumusatma', 'temizlik']
  await prisma.category.updateMany({
    where: { slug: { in: eskiAlbSuSluglar } },
    data: { isActive: false },
  })
  console.log('🗂️  Eski Alb Su kategorileri deaktive edildi')

  // ─── Kategoriler — Alb Su Teknolojileri — PARENT (üst) kategoriler ─────────
  // Ürünler doğrudan parent'a bağlanmaz; alt kategoriler aracılığıyla bağlanır.

  const catEv = await prisma.category.upsert({
    where: { slug: 'ev' },
    update: { name: 'Eviniz İçin', icon: '🏠', sortOrder: 1 },
    create: {
      brandId: albSu.id, name: 'Eviniz İçin', slug: 'ev',
      icon: '🏠', sortOrder: 1,
      description: 'Ev tipi su arıtma, ısıtma ve yumuşatma çözümleri',
    },
  })

  const catIsYeri = await prisma.category.upsert({
    where: { slug: 'is-yeri' },
    update: { name: 'İş Yeriniz İçin', icon: '🏢', sortOrder: 2 },
    create: {
      brandId: albSu.id, name: 'İş Yeriniz İçin', slug: 'is-yeri',
      icon: '🏢', sortOrder: 2,
      description: 'Ticari, endüstriyel ve kurumsal su teknoloji çözümleri',
    },
  })

  const catKucukEvAletleri = await prisma.category.upsert({
    where: { slug: 'kucuk-ev-aletleri' },
    update: { name: 'Küçük Ev Aletleri', icon: '🔌', sortOrder: 3 },
    create: {
      brandId: albSu.id, name: 'Küçük Ev Aletleri', slug: 'kucuk-ev-aletleri',
      icon: '🔌', sortOrder: 3,
      description: 'Klima, vantilatör, robot süpürge ve temizlik aletleri',
    },
  })

  const catYedekParca = await prisma.category.upsert({
    where: { slug: 'yedek-parca' },
    update: { name: 'Yedek Parça & Aksesuar', icon: '🔧', sortOrder: 4 },
    create: {
      brandId: albSu.id, name: 'Yedek Parça & Aksesuar', slug: 'yedek-parca',
      icon: '🔧', sortOrder: 4,
      description: 'Filtre, membran ve tüm yedek parçalar',
    },
  })

  // ─── Alt kategoriler — Eviniz İçin ────────────────────────────────────────

  const catEvSuIsitici = await prisma.category.upsert({
    where: { slug: 'ev-su-isitici' },
    update: { parentId: catEv.id, name: 'Su Isıtıcıları', icon: '🔥', sortOrder: 1 },
    create: {
      brandId: albSu.id, name: 'Su Isıtıcıları', slug: 'ev-su-isitici',
      icon: '🔥', sortOrder: 1, parentId: catEv.id,
      description: 'Elektrikli boiler, şofben ve ısı pompalı su ısıtıcıları',
    },
  })

  const catEvSuYumusatma = await prisma.category.upsert({
    where: { slug: 'ev-su-yumusatma' },
    update: { parentId: catEv.id, name: 'Su Yumuşatma', icon: '💧', sortOrder: 2 },
    create: {
      brandId: albSu.id, name: 'Su Yumuşatma', slug: 'ev-su-yumusatma',
      icon: '💧', sortOrder: 2, parentId: catEv.id,
      description: 'Ev tipi kireç önleyici ve iyon değiştirici sistemler',
    },
  })

  const catEvSuAritma = await prisma.category.upsert({
    where: { slug: 'ev-su-aritma' },
    update: { parentId: catEv.id, name: 'Su Arıtma', icon: '⚗️', sortOrder: 3 },
    create: {
      brandId: albSu.id, name: 'Su Arıtma', slug: 'ev-su-aritma',
      icon: '⚗️', sortOrder: 3, parentId: catEv.id,
      description: 'Tezgah altı RO ve alkali su arıtma sistemleri',
    },
  })

  // ─── Alt kategoriler — İş Yeriniz İçin ───────────────────────────────────

  const catSuSebili = await prisma.category.upsert({
    where: { slug: 'su-sebili' },
    update: { parentId: catIsYeri.id, name: 'Arıtmalı Su Sebili', icon: '🚿', sortOrder: 1 },
    create: {
      brandId: albSu.id, name: 'Arıtmalı Su Sebili', slug: 'su-sebili',
      icon: '🚿', sortOrder: 1, parentId: catIsYeri.id,
      description: 'Ofis ve işyeri için entegre filtreli içme suyu sebilleri',
    },
  })

  const catEndustriyel = await prisma.category.upsert({
    where: { slug: 'endustriyel' },
    update: { parentId: catIsYeri.id, name: 'Endüstriyel Sistemler', icon: '🏭', sortOrder: 2 },
    create: {
      brandId: albSu.id, name: 'Endüstriyel Sistemler', slug: 'endustriyel',
      icon: '🏭', sortOrder: 2, parentId: catIsYeri.id,
      description: 'Yüksek kapasiteli endüstriyel RO, yumuşatma ve saf su sistemleri',
    },
  })

  const catTicariBoiler = await prisma.category.upsert({
    where: { slug: 'ticari-boiler' },
    update: { parentId: catIsYeri.id, name: 'Ticari Su Isıtıcıları', icon: '♨️', sortOrder: 3 },
    create: {
      brandId: albSu.id, name: 'Ticari Su Isıtıcıları', slug: 'ticari-boiler',
      icon: '♨️', sortOrder: 3, parentId: catIsYeri.id,
      description: 'Büyük kapasiteli otel, tesis ve endüstri tipi boilerler',
    },
  })

  const catIsYeriYumusatma = await prisma.category.upsert({
    where: { slug: 'is-yeri-yumusatma' },
    update: { parentId: catIsYeri.id, name: 'Su Yumuşatma Sistemleri', icon: '💧', sortOrder: 4 },
    create: {
      brandId: albSu.id, name: 'Su Yumuşatma Sistemleri', slug: 'is-yeri-yumusatma',
      icon: '💧', sortOrder: 4, parentId: catIsYeri.id,
      description: 'Yüksek kapasiteli ticari ve endüstriyel su yumuşatma',
    },
  })

  // ─── Alt kategoriler — Küçük Ev Aletleri ─────────────────────────────────

  const catKlima = await prisma.category.upsert({
    where: { slug: 'klima' },
    update: { parentId: catKucukEvAletleri.id, name: 'Klima Sistemleri', icon: '❄️', sortOrder: 1 },
    create: {
      brandId: albSu.id, name: 'Klima Sistemleri', slug: 'klima',
      icon: '❄️', sortOrder: 1, parentId: catKucukEvAletleri.id,
      description: 'Duvar tipi, salon tipi ve kaset tipi inverter klima sistemleri',
    },
  })

  const catVantilator = await prisma.category.upsert({
    where: { slug: 'vantilator' },
    update: { parentId: catKucukEvAletleri.id, name: 'Vantilatör', icon: '🌬️', sortOrder: 2 },
    create: {
      brandId: albSu.id, name: 'Vantilatör', slug: 'vantilator',
      icon: '🌬️', sortOrder: 2, parentId: catKucukEvAletleri.id,
      description: 'Kule tipi ve masa tipi vantilatörler',
    },
  })

  const catTemizlik = await prisma.category.upsert({
    where: { slug: 'temizlik' },
    update: { parentId: catKucukEvAletleri.id, name: 'Temizlik Aletleri', icon: '🧹', sortOrder: 3 },
    create: {
      brandId: albSu.id, name: 'Temizlik Aletleri', slug: 'temizlik',
      icon: '🧹', sortOrder: 3, parentId: catKucukEvAletleri.id,
      description: 'Yüksek basınçlı yıkayıcı, elektrikli süpürge ve temizlik robotları',
    },
  })

  // ─── Alt kategoriler — Yedek Parça & Aksesuar ─────────────────────────────

  const catFiltre = await prisma.category.upsert({
    where: { slug: 'filtre' },
    update: { parentId: catYedekParca.id, name: 'Filtre & Membran', icon: '🔩', sortOrder: 1 },
    create: {
      brandId: albSu.id, name: 'Filtre & Membran', slug: 'filtre',
      icon: '🔩', sortOrder: 1, parentId: catYedekParca.id,
      description: 'RO membran, karbon filtre, sediment filtre ve yedek parçalar',
    },
  })

  console.log('✅ Kategoriler oluşturuldu')

  // ─── Yardımcı: ürün oluştur/güncelle ──────────────────────────────────────

  async function upsertProduct(data: {
    id: string
    slug: string
    brandId: number
    categoryId: number
    name: string
    description: string
    shortDescription: string
    price: number
    salePrice?: number
    sku: string
    unit: string
    stock: number
    isFeatured: boolean
    rating: number
    reviewCount: number
    images: { url: string; alt: string; isPrimary: boolean }[]
    specs: { name: string; value: string; unit?: string }[]
    tags: string[]
  }) {
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } })

    let product

    if (existing) {
      // Kategori değişikliğini uygula
      product = await prisma.product.update({
        where: { slug: data.slug },
        data: { categoryId: data.categoryId },
      })
      console.log(`  🔄 Kategori güncellendi: ${data.name}`)
    } else {
      product = await prisma.product.create({
        data: {
          id: data.id,
          slug: data.slug,
          brandId: data.brandId,
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          shortDescription: data.shortDescription,
          price: data.price,
          salePrice: data.salePrice ?? null,
          sku: data.sku,
          unit: data.unit,
          stockQuantity: data.stock,
          isFeatured: data.isFeatured,
          rating: data.rating,
          reviewCount: data.reviewCount,
          images: {
            create: data.images.map((img, i) => ({
              url: img.url,
              altText: img.alt,
              isPrimary: img.isPrimary,
              sortOrder: i,
            })),
          },
          specs: {
            create: data.specs.map((s, i) => ({
              specName: s.name,
              specValue: s.value,
              specUnit: s.unit ?? null,
              sortOrder: i,
            })),
          },
        },
      })
      console.log(`  ✅ ${data.name}`)
    }

    // Etiketler
    for (const tagName of data.tags) {
      const tagSlug = tagName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9ğüşıöçğüşıöç-]/g, '')
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName, slug: tagSlug },
      })
      await prisma.productTag.upsert({
        where: { productId_tagId: { productId: product.id, tagId: tag.id } },
        update: {},
        create: { productId: product.id, tagId: tag.id },
      })
    }

    return product
  }

  console.log('\n📦 ALB Tarım ürünleri yükleniyor...')

  // ─── ALB Tarım Ürünleri ────────────────────────────────────────────────────

  await upsertProduct({
    id: 'tarim-001', slug: 'baroute', brandId: albTarim.id, categoryId: catGubreler.id,
    name: 'Baroute', sku: 'TARIM-BAR-001', unit: 'adet', stock: 150,
    isFeatured: true, rating: 4.7, reviewCount: 42,
    price: 280,
    shortDescription: 'Bitkisel gelişimi destekleyen özel formüllü yaprak gübresi.',
    description: 'Baroute, bitki büyümesini hızlandıran ve stres koşullarında dayanıklılığı artıran özel formüllü bir yaprak gübresidir. Sebze, meyve ve tarla bitkilerinde etkin şekilde kullanılır. Yapraktan veya damla sulama yöntemiyle uygulanabilir.',
    images: [{ url: '/images/tarim-baroute.jpg', alt: 'Baroute', isPrimary: true }],
    specs: [
      { name: 'Uygulama Yöntemi', value: 'Yapraktan / Damla sulama' },
      { name: 'Ürün Tipi', value: 'Sıvı gübre' },
    ],
    tags: ['gübre', 'yaprak', 'bitki gelişimi'],
  })

  await upsertProduct({
    id: 'tarim-002', slug: 'cloud', brandId: albTarim.id, categoryId: catIlac.id,
    name: 'Cloud', sku: 'TARIM-CLD-001', unit: 'adet', stock: 200,
    isFeatured: false, rating: 4.6, reviewCount: 28,
    price: 185,
    shortDescription: 'Yayıcı yapıştırıcı etkisiyle ilaç ve gübre verimliliğini artırır.',
    description: 'Cloud, tarımsal ilaçlama ve gübreleme uygulamalarında kullanılan özel formüllü bir yayıcı yapıştırıcıdır. Yaprak yüzeyine tutunmayı iyileştirerek ürünlerin etkinliğini ve kalıcılığını maksimize eder.',
    images: [{ url: '/images/tarim-cloud.jpg', alt: 'Cloud', isPrimary: true }],
    specs: [
      { name: 'Ürün Tipi', value: 'Yayıcı yapıştırıcı' },
      { name: 'Uygulama', value: 'İlaçlama suyu ile karıştır' },
    ],
    tags: ['yayıcı', 'yapıştırıcı', 'ilaçlama'],
  })

  await upsertProduct({
    id: 'tarim-003', slug: 'phoska', brandId: albTarim.id, categoryId: catGubreler.id,
    name: 'Phoska', sku: 'TARIM-PHO-001', unit: 'çuval', stock: 320,
    isFeatured: true, rating: 4.8, reviewCount: 95,
    price: 650, salePrice: 580,
    shortDescription: 'Fosfor ve potasyum içerikli dengeli NPK gübresi, meyve ve sebze için ideal.',
    description: 'Phoska, bitkilerin çiçeklenme ve meyve tutma dönemlerinde ihtiyaç duyduğu fosfor ve potasyumu optimal oranlarda sunan dengeli bir bileşik gübredir. Granül formuyla toprağa kolayca karıştırılır ve uzun süreli etki gösterir.',
    images: [{ url: '/images/tarim-phoska.jpg', alt: 'Phoska', isPrimary: true }],
    specs: [
      { name: 'İçerik', value: 'N-P-K bileşik gübre' },
      { name: 'Form', value: 'Granül' },
      { name: 'Uygulama', value: 'Topraktan' },
    ],
    tags: ['gübre', 'NPK', 'fosfor', 'potasyum'],
  })

  await upsertProduct({
    id: 'tarim-004', slug: 'stamin', brandId: albTarim.id, categoryId: catToprak.id,
    name: 'Stamin', sku: 'TARIM-STM-001', unit: 'litre', stock: 90,
    isFeatured: false, rating: 4.7, reviewCount: 35,
    price: 420,
    shortDescription: 'Bitki aktivatörü ve biyostimülant, stres koşullarına karşı dayanıklılığı artırır.',
    description: 'Stamin, bitkilerin kuraklık, don ve hastalık gibi stres etkenlerine karşı direncini güçlendiren özel formüllü bir biyostimülanttır. Amino asitler ve deniz yosunu ekstraktı içeriğiyle bitki metabolizmasını destekler.',
    images: [{ url: '/images/tarim-stamin.jpg', alt: 'Stamin', isPrimary: true }],
    specs: [
      { name: 'Uygulama Yöntemi', value: 'Yapraktan / topraktan' },
      { name: 'İçerik', value: 'Amino asit + deniz yosunu ekstrakt' },
    ],
    tags: ['biyostimülant', 'stres dayanıklılığı', 'amino asit'],
  })

  await upsertProduct({
    id: 'tarim-005', slug: 'calm', brandId: albTarim.id, categoryId: catGubreler.id,
    name: 'CalM', sku: 'TARIM-CAM-001', unit: 'litre', stock: 175,
    isFeatured: false, rating: 4.9, reviewCount: 67,
    price: 340, salePrice: 295,
    shortDescription: 'Kalsiyum ve magnezyum içerikli sıvı gübre, çatlama ve sararma önler.',
    description: 'CalM, kalsiyum eksikliğine bağlı çatlama, sararma ve çürüme gibi fizyolojik bozuklukları önleyen Ca+Mg formüllü bir sıvı gübredir. Domates, biber, çilek ve bağda ideal kullanım alanı bulur.',
    images: [{ url: '/images/tarim-calm.jpg', alt: 'CalM', isPrimary: true }],
    specs: [
      { name: 'Kalsiyum (Ca)', value: '%15' },
      { name: 'Magnezyum (Mg)', value: '%2' },
      { name: 'Uygulama', value: 'Yapraktan / damlama' },
    ],
    tags: ['kalsiyum', 'magnezyum', 'gübre', 'Ca+Mg'],
  })

  await upsertProduct({
    id: 'tarim-006', slug: 'tracer', brandId: albTarim.id, categoryId: catIlac.id,
    name: 'Tracer', sku: 'TARIM-TRC-001', unit: 'adet', stock: 80,
    isFeatured: true, rating: 4.8, reviewCount: 58,
    price: 520,
    shortDescription: 'Spinosad içerikli organik kökenli insektisit, geniş spektrumlu zararlı kontrolü.',
    description: 'Tracer, doğal fermentasyon yoluyla üretilen Spinosad aktif maddesini içeren biyolojik kökenli bir insektisittir. Trips, tırtıl, yaprak galeri güvesi ve diğer böcek zararlılarına karşı etkilidir ve organik tarımda kullanılabilir.',
    images: [{ url: '/images/tarim-tracer.jpg', alt: 'Tracer', isPrimary: true }],
    specs: [
      { name: 'Aktif Madde', value: 'Spinosad' },
      { name: 'Hedef Zararlı', value: 'Trips, tırtıl, yaprak galeri güvesi' },
      { name: 'Uygulama', value: 'Yapraktan ilaçlama' },
    ],
    tags: ['insektisit', 'spinosad', 'organik', 'zararlı kontrolü'],
  })

  await upsertProduct({
    id: 'tarim-007', slug: '25-5-5-npk-gubre', brandId: albTarim.id, categoryId: catGubreler.id,
    name: '25-5-5 NPK Gübre', sku: 'TARIM-255-001', unit: 'çuval', stock: 420,
    isFeatured: true, rating: 4.7, reviewCount: 112,
    price: 780, salePrice: 690,
    shortDescription: 'Yüksek azot içerikli 25-5-5 formüllü gübre, vejetatif gelişim dönemi için.',
    description: '25-5-5 formülü, özellikle bitkilerin güçlü vejetatif gelişim göstermesi istenen dönemlerde uygulanan yüksek azotlu NPK gübresidir. Çim, mısır, şeker pancarı, tahıl ve sebzelerde yüksek verim artışı sağlar.',
    images: [{ url: '/images/tarim-25-5-5.jpg', alt: '25-5-5 NPK Gübre', isPrimary: true }],
    specs: [
      { name: 'N-P-K Oranı', value: '25-5-5' },
      { name: 'Toplam Azot (N)', value: '%25' },
      { name: 'Fosfor (P₂O₅)', value: '%5' },
      { name: 'Potasyum (K₂O)', value: '%5' },
      { name: 'Form', value: 'Granül' },
    ],
    tags: ['NPK', 'azot', 'gübre', 'vejetatif gelişim'],
  })

  await upsertProduct({
    id: 'tarim-008', slug: 'potassio', brandId: albTarim.id, categoryId: catGubreler.id,
    name: 'Potassio', sku: 'TARIM-POT-001', unit: 'kg', stock: 260,
    isFeatured: false, rating: 4.6, reviewCount: 44,
    price: 450,
    shortDescription: 'Yüksek saflıkta potasyum kaynağı, meyve kalitesini ve renk gelişimini artırır.',
    description: 'Potassio, bitkiler için yüksek saflıkta potasyum sağlayan kristal formda suda çözünür bir gübredir. Meyve büyümesi, renk gelişimi ve sofralık kalite üzerinde kritik öneme sahiptir; hasattan önce uygulamak kaliteyi belirgin şekilde artırır.',
    images: [{ url: '/images/tarim-potassio.jpg', alt: 'Potassio', isPrimary: true }],
    specs: [
      { name: 'Potasyum (K₂O)', value: '%50' },
      { name: 'Form', value: 'Kristal / suda çözünür' },
      { name: 'Uygulama', value: 'Damlama / yapraktan' },
    ],
    tags: ['potasyum', 'gübre', 'meyve kalitesi'],
  })

  await upsertProduct({
    id: 'tarim-009', slug: 'pre-feed', brandId: albTarim.id, categoryId: catToprak.id,
    name: 'Pre Feed', sku: 'TARIM-PRF-001', unit: 'kg', stock: 310,
    isFeatured: false, rating: 4.8, reviewCount: 73,
    price: 390, salePrice: 345,
    shortDescription: 'Ekim öncesi toprağa uygulanan özel formüllü başlangıç gübresi.',
    description: 'Pre Feed, ekim ve dikim öncesinde toprağa uygulanarak köklerin güçlü tutunmasını sağlayan, besin depolu bir başlangıç gübresidir. Filiz çıkışını hızlandırır, erken dönem gelişimi destekler ve toprak canlılığını artırır.',
    images: [{ url: '/images/tarim-pre-feed.jpg', alt: 'Pre Feed', isPrimary: true }],
    specs: [
      { name: 'Uygulama Zamanı', value: 'Ekim / dikim öncesi' },
      { name: 'Uygulama Yöntemi', value: 'Topraktan karıştırarak' },
      { name: 'İçerik', value: 'NPK + mikro besinler' },
    ],
    tags: ['başlangıç gübresi', 'ekim öncesi', 'kök gelişimi', 'toprak hazırlığı'],
  })

  console.log('\n💧 Albsu Teknolojileri ürünleri yükleniyor...')

  // ─── Albsu Ürünleri — Eviniz İçin › Su Isıtıcıları ───────────────────────

  await upsertProduct({
    id: 'albsu-001', slug: 'ao-smith-daisy', brandId: albSu.id, categoryId: catEvSuIsitici.id,
    name: 'AO Smith DAISY', sku: 'ALBSU-AOS-DAISY', unit: 'adet', stock: 25,
    isFeatured: true, rating: 4.8, reviewCount: 88,
    price: 4500, salePrice: 3990,
    shortDescription: 'AO Smith DAISY elektrikli su ısıtıcısı, kompakt tasarım ve yüksek verim.',
    description: 'AO Smith DAISY, küçük mekânlar için ideal kompakt boyutlu elektrikli su ısıtıcısıdır. Yüksek verimli ısıtma elemanı ve takviyeli emaye tank yapısıyla uzun ömürlü ve güvenilir sıcak su sağlar.',
    images: [{ url: '/images/albsu-ao-smith-daisy.jpg', alt: 'AO Smith DAISY', isPrimary: true }],
    specs: [
      { name: 'Marka', value: 'AO Smith' },
      { name: 'Model', value: 'DAISY' },
      { name: 'Tip', value: 'Elektrikli su ısıtıcısı' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['AO Smith', 'su ısıtıcı', 'elektrikli boiler', 'DAISY', 'ev'],
  })

  await upsertProduct({
    id: 'albsu-002', slug: 'ao-smith-lotus-75-tc', brandId: albSu.id, categoryId: catEvSuIsitici.id,
    name: 'AO Smith LOTUS 75 TC', sku: 'ALBSU-AOS-LOTUS75TC', unit: 'adet', stock: 15,
    isFeatured: true, rating: 4.9, reviewCount: 64,
    price: 12500, salePrice: 10900,
    shortDescription: '75 litre çift serpantinli AO Smith LOTUS TC, merkezi ısıtma sistemlerine uygun.',
    description: 'AO Smith LOTUS 75 TC, 75 litre kapasitesiyle geniş aileler için ideal olan yüksek verimli depolama tipi su ısıtıcısıdır. TC serisi çift serpantin tasarımıyla merkezi ısıtma sistemi veya güneş enerjisi kolektörlerine de bağlanabilir.',
    images: [{ url: '/images/albsu-lotus-75tc.jpg', alt: 'AO Smith LOTUS 75 TC', isPrimary: true }],
    specs: [
      { name: 'Kapasite', value: '75', unit: 'litre' },
      { name: 'Seri', value: 'LOTUS TC' },
      { name: 'Serpantin', value: 'Çift serpantin' },
      { name: 'Garanti', value: '5 yıl tank, 2 yıl elektrik' },
    ],
    tags: ['AO Smith', 'LOTUS', 'boiler', '75 litre', 'merkezi sistem', 'ev'],
  })

  await upsertProduct({
    id: 'albsu-003', slug: 'ao-smith-lts-75-lx', brandId: albSu.id, categoryId: catEvSuIsitici.id,
    name: 'AO Smith LTS 75 LX', sku: 'ALBSU-AOS-LTS75LX', unit: 'adet', stock: 10,
    isFeatured: false, rating: 4.8, reviewCount: 41,
    price: 15800,
    shortDescription: 'AO Smith LTS 75 LX premium seri elektrikli boiler, dijital sıcaklık kontrolü.',
    description: 'AO Smith LTS 75 LX, premium seriden 75 litrelik kapasiteli elektrikli su ısıtıcısıdır. Dijital kontrol paneli, takviyeli emaye tank ve uzun ömürlü magnezyum anot çubuğuyla üstün performans ve dayanıklılık sunar.',
    images: [{ url: '/images/albsu-lts75lx.jpg', alt: 'AO Smith LTS 75 LX', isPrimary: true }],
    specs: [
      { name: 'Kapasite', value: '75', unit: 'litre' },
      { name: 'Seri', value: 'LTS LX' },
      { name: 'Kontrol', value: 'Dijital panel' },
      { name: 'Garanti', value: '5 yıl tank' },
    ],
    tags: ['AO Smith', 'LTS', 'premium', 'boiler', '75 litre', 'ev'],
  })

  await upsertProduct({
    id: 'albsu-004', slug: 'ao-smith-lts-75-sx', brandId: albSu.id, categoryId: catEvSuIsitici.id,
    name: 'AO Smith LTS 75 SX', sku: 'ALBSU-AOS-LTS75SX', unit: 'adet', stock: 12,
    isFeatured: false, rating: 4.7, reviewCount: 53,
    price: 13200, salePrice: 11500,
    shortDescription: 'AO Smith LTS 75 SX standart seri, ekonomik ve güvenilir 75 lt elektrikli boiler.',
    description: 'AO Smith LTS 75 SX, geniş ailelerin ihtiyacını karşılayacak 75 litrelik hacmiyle güvenilir ve ekonomik bir elektrikli su ısıtıcısıdır. Paslanmaz çelik ısıtma elemanı ve emaye tank ile uzun ömürlü kullanım sunar.',
    images: [{ url: '/images/albsu-lts75sx.jpg', alt: 'AO Smith LTS 75 SX', isPrimary: true }],
    specs: [
      { name: 'Kapasite', value: '75', unit: 'litre' },
      { name: 'Seri', value: 'LTS SX' },
      { name: 'Isıtma Elemanı', value: 'Paslanmaz çelik' },
      { name: 'Garanti', value: '3 yıl' },
    ],
    tags: ['AO Smith', 'LTS', 'boiler', '75 litre', 'ev'],
  })

  await upsertProduct({
    id: 'albsu-012', slug: 'ao-smith-merkur-ecostar', brandId: albSu.id, categoryId: catEvSuIsitici.id,
    name: 'AO Smith Merkür Ecostar', sku: 'ALBSU-MERKUR-ECO', unit: 'adet', stock: 12,
    isFeatured: true, rating: 4.9, reviewCount: 45,
    price: 19800, salePrice: 17500,
    shortDescription: "Merkür Ecostar serisi ısı pompalı su ısıtıcısı, %70'e kadar enerji tasarrufu.",
    description: "AO Smith Merkür Ecostar, ısı pompası teknolojisini kullanan yüksek verimli bir su ısıtma sistemidir. Geleneksel elektrikli boylerlerle kıyaslandığında %70'e kadar enerji tasarrufu sağlar ve uzun vadede büyük maliyet avantajı sunar.",
    images: [{ url: '/images/albsu-merkur-ecostar.jpg', alt: 'AO Smith Merkür Ecostar', isPrimary: true }],
    specs: [
      { name: 'Teknoloji', value: 'Isı pompası' },
      { name: 'Enerji Tasarrufu', value: "%70'e kadar" },
      { name: 'COP', value: '3.5' },
      { name: 'Garanti', value: '3 yıl' },
    ],
    tags: ['Merkür', 'Ecostar', 'ısı pompası', 'enerji tasarrufu', 'AO Smith', 'ev'],
  })

  await upsertProduct({
    id: 'albsu-018', slug: 'ihlas-sofben', brandId: albSu.id, categoryId: catEvSuIsitici.id,
    name: 'İhlas Şofben', sku: 'ALBSU-IHL-SOFB', unit: 'adet', stock: 35,
    isFeatured: false, rating: 4.6, reviewCount: 78,
    price: 3800, salePrice: 3200,
    shortDescription: "Doğalgaz / LPG'li anlık su ısıtıcısı, yüksek debi ve enerji tasarrufu.",
    description: 'İhlas Şofben, doğalgaz veya LPG yakıtlı anlık su ısıtma sistemidir. Depolama tankına ihtiyaç duymadan anında sıcak su üretir; dijital kontrol paneli, alev hata güvenliği ve donma koruma özelliğiyle donatılmıştır.',
    images: [{ url: '/images/albsu-ihlas-sofben.jpg', alt: 'İhlas Şofben', isPrimary: true }],
    specs: [
      { name: 'Yakıt Tipi', value: 'Doğalgaz / LPG' },
      { name: 'Tip', value: 'Anlık su ısıtıcısı' },
      { name: 'Kontrol', value: 'Dijital panel' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['şofben', 'İhlas', 'doğalgaz', 'LPG', 'anlık su ısıtıcı', 'ev'],
  })

  // ─── Albsu Ürünleri — Eviniz İçin › Su Yumuşatma ─────────────────────────

  await upsertProduct({
    id: 'albsu-008', slug: 'ao-smith-maxim-su-yumusatma', brandId: albSu.id, categoryId: catEvSuYumusatma.id,
    name: 'AO Smith Maxim Su Yumuşatma Sistemi', sku: 'ALBSU-MAX-001', unit: 'adet', stock: 20,
    isFeatured: true, rating: 4.8, reviewCount: 76,
    price: 8900, salePrice: 7800,
    shortDescription: 'Maxim serisi ev ve işyeri tipi iyon değiştirici su yumuşatma sistemi.',
    description: 'AO Smith Maxim Su Yumuşatma, kireç ve sertliği yüksek sulara karşı boru, cihaz ve çamaşır makinesi hasarını önleyen iyon değiştiricili bir sistemdir. Otomatik rejenerasyon özelliğiyle bakım gerektirmez, tuz tüketimi düşüktür.',
    images: [{ url: '/images/albsu-maxim.jpg', alt: 'AO Smith Maxim Su Yumuşatma', isPrimary: true }],
    specs: [
      { name: 'Teknoloji', value: 'İyon değiştirici' },
      { name: 'Rejenerasyon', value: 'Otomatik zamanlayıcılı' },
      { name: 'Kullanım', value: 'Ev / küçük işyeri' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['su yumuşatma', 'kireç önleme', 'Maxim', 'iyon değiştirici', 'ev'],
  })

  await upsertProduct({
    id: 'albsu-009', slug: 'triasoft-mini-su-yumusatma', brandId: albSu.id, categoryId: catEvSuYumusatma.id,
    name: 'TRIASOFT Mini Su Yumuşatma', sku: 'ALBSU-TRIAS-MINI', unit: 'adet', stock: 18,
    isFeatured: false, rating: 4.7, reviewCount: 52,
    price: 11500,
    shortDescription: 'Kompakt TRIASOFT Mini, küçük daire ve ofisler için kireç önleyici sistem.',
    description: 'TRIASOFT Mini, sınırlı montaj alanlarında rahatlıkla kurulabilen kompakt su yumuşatma sistemidir. Düşük tuz ve su tüketimiyle ekonomik çalışır, dijital kontrol paneli ve otomatik yenileme döngüsüne sahiptir.',
    images: [{ url: '/images/albsu-triasoft-mini.jpg', alt: 'TRIASOFT Mini', isPrimary: true }],
    specs: [
      { name: 'Model', value: 'TRIASOFT Mini' },
      { name: 'Boyut', value: 'Kompakt' },
      { name: 'Kontrol', value: 'Dijital panel' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['TRIASOFT', 'su yumuşatma', 'mini', 'kompakt', 'ev'],
  })

  await upsertProduct({
    id: 'albsu-010', slug: 'triasoft-midi-su-yumusatma', brandId: albSu.id, categoryId: catEvSuYumusatma.id,
    name: 'TRIASOFT Midi Su Yumuşatma', sku: 'ALBSU-TRIAS-MIDI', unit: 'adet', stock: 14,
    isFeatured: true, rating: 4.9, reviewCount: 38,
    price: 15800, salePrice: 13900,
    shortDescription: 'TRIASOFT Midi orta kapasite, 3-8 kişilik hane için ideal su yumuşatma sistemi.',
    description: 'TRIASOFT Midi, 3-8 kişilik hanelerde yoğun su kullanımını karşılayan orta kapasiteli su yumuşatma sistemidir. Ayarlanabilir yenileme döngüsü ve yüksek reçine kapasitesiyle uzun süreli verimli çalışır.',
    images: [{ url: '/images/albsu-triasoft-midi.jpg', alt: 'TRIASOFT Midi', isPrimary: true }],
    specs: [
      { name: 'Model', value: 'TRIASOFT Midi' },
      { name: 'Uygun Hane Büyüklüğü', value: '3-8 kişi' },
      { name: 'Rejenerasyon', value: 'Otomatik' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['TRIASOFT', 'su yumuşatma', 'midi', 'orta kapasite', 'ev'],
  })

  // ─── Albsu Ürünleri — İş Yeriniz İçin › Arıtmalı Su Sebili ──────────────

  await upsertProduct({
    id: 'albsu-013', slug: 'ortimax-aritma-sebil-siyah', brandId: albSu.id, categoryId: catSuSebili.id,
    name: 'Ortimax Arıtmalı Sebil — Siyah', sku: 'ALBSU-ORT-SBL-SYH', unit: 'adet', stock: 30,
    isFeatured: true, rating: 4.8, reviewCount: 118,
    price: 5800, salePrice: 4990,
    shortDescription: 'Entegre filtrasyon sistemli Ortimax arıtmalı içme suyu sebili, siyah.',
    description: 'Ortimax Arıtmalı Sebil (Siyah), soğuk, oda ısısı ve sıcak su seçeneğiyle gelişmiş filtrasyon sistemini bünyesinde barındıran şık tasarımlı bir içme suyu sebilidir. Yerleşik filtresiyle şişe su kullanımını ortadan kaldırır ve ekonomik çözüm sunar.',
    images: [{ url: '/images/albsu-ortimax-siyah.jpg', alt: 'Ortimax Arıtmalı Sebil Siyah', isPrimary: true }],
    specs: [
      { name: 'Renk', value: 'Siyah' },
      { name: 'Su Sıcaklığı', value: 'Soğuk / Oda ısısı / Sıcak' },
      { name: 'Filtrasyon', value: 'Entegre filtre sistemi' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['sebil', 'arıtmalı', 'Ortimax', 'içme suyu', 'siyah', 'is-yeri'],
  })

  await upsertProduct({
    id: 'albsu-014', slug: 'ortimax-aritma-sebil-kisa', brandId: albSu.id, categoryId: catSuSebili.id,
    name: 'Ortimax Arıtmalı Sebil — Kısa', sku: 'ALBSU-ORT-SBL-KIS', unit: 'adet', stock: 22,
    isFeatured: false, rating: 4.7, reviewCount: 84,
    price: 4500,
    shortDescription: 'Kompakt boyutlu Ortimax arıtmalı sebil, tezgah üstü ve küçük ofisler için.',
    description: 'Ortimax Arıtmalı Sebil (Kısa), tezgah üstüne veya sınırlı alana yerleştirilebilen kompakt boyutlu arıtmalı içme suyu sebildir. Temiz ve lezzetli su için entegre filtrasyon sistemiyle donatılmıştır.',
    images: [{ url: '/images/albsu-ortimax-kisa.jpg', alt: 'Ortimax Arıtmalı Sebil Kısa', isPrimary: true }],
    specs: [
      { name: 'Boyut', value: 'Kompakt / kısa' },
      { name: 'Montaj', value: 'Tezgah üstü veya yer' },
      { name: 'Filtrasyon', value: 'Entegre filtre sistemi' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['sebil', 'arıtmalı', 'Ortimax', 'kompakt', 'tezgah üstü', 'is-yeri'],
  })

  // ─── Albsu Ürünleri — İş Yeriniz İçin › Ticari Su Isıtıcıları ───────────

  await upsertProduct({
    id: 'albsu-005', slug: 'ao-smith-frezya-300-s', brandId: albSu.id, categoryId: catTicariBoiler.id,
    name: 'AO Smith Frezya 300 S', sku: 'ALBSU-FRZ-300S', unit: 'adet', stock: 8,
    isFeatured: true, rating: 4.9, reviewCount: 32,
    price: 28500,
    shortDescription: '300 litre kapasiteli Frezya S serisi ticari tip su ısıtıcısı.',
    description: 'AO Smith Frezya 300 S, otel, işyeri ve apartmanlar için tasarlanmış 300 litrelik büyük kapasiteli ticari su ısıtıcısıdır. Güçlü ısıtma kapasitesi ve dayanıklı emaye tank yapısıyla kesintisiz sıcak su sağlar.',
    images: [{ url: '/images/albsu-frezya-300s.jpg', alt: 'AO Smith Frezya 300 S', isPrimary: true }],
    specs: [
      { name: 'Kapasite', value: '300', unit: 'litre' },
      { name: 'Seri', value: 'Frezya S' },
      { name: 'Kullanım Alanı', value: 'Ticari / endüstriyel' },
      { name: 'Garanti', value: '5 yıl tank' },
    ],
    tags: ['Frezya', 'AO Smith', 'ticari', '300 litre', 'boiler', 'is-yeri'],
  })

  await upsertProduct({
    id: 'albsu-006', slug: 'ao-smith-frezya-300-tu', brandId: albSu.id, categoryId: catTicariBoiler.id,
    name: 'AO Smith Frezya 300 TU', sku: 'ALBSU-FRZ-300TU', unit: 'adet', stock: 6,
    isFeatured: false, rating: 4.8, reviewCount: 21,
    price: 32000, salePrice: 28800,
    shortDescription: '300 litre TU serisi, serpantinli merkezi sistem entegrasyonu destekli boiler.',
    description: 'AO Smith Frezya 300 TU, merkezi ısıtma sistemi veya güneş enerjisi kolektörleriyle entegre çalışabilen 300 litrelik TU serisi su ısıtıcısıdır. Çift serpantin desteği enerji verimliliğini maksimize eder.',
    images: [{ url: '/images/albsu-frezya-300tu.jpg', alt: 'AO Smith Frezya 300 TU', isPrimary: true }],
    specs: [
      { name: 'Kapasite', value: '300', unit: 'litre' },
      { name: 'Seri', value: 'Frezya TU' },
      { name: 'Serpantin', value: 'Var (merkezi sistem / güneş enerjisi)' },
      { name: 'Garanti', value: '5 yıl tank' },
    ],
    tags: ['Frezya', 'AO Smith', '300 litre', 'merkezi sistem', 'güneş enerjisi', 'is-yeri'],
  })

  await upsertProduct({
    id: 'albsu-007', slug: 'ao-smith-frezya-600-s', brandId: albSu.id, categoryId: catTicariBoiler.id,
    name: 'AO Smith Frezya 600 S', sku: 'ALBSU-FRZ-600S', unit: 'adet', stock: 4,
    isFeatured: false, rating: 5.0, reviewCount: 9,
    price: 52000,
    shortDescription: '600 litre büyük kapasiteli Frezya S serisi endüstriyel boiler.',
    description: 'AO Smith Frezya 600 S, büyük ölçekli tesisler için 600 litrelik hacmiyle endüstriyel sınıf bir su ısıtıcısıdır. Oteller, spor tesisleri ve fabrikalarda yüksek sıcak su talebi için idealdir.',
    images: [{ url: '/images/albsu-frezya-600s.jpg', alt: 'AO Smith Frezya 600 S', isPrimary: true }],
    specs: [
      { name: 'Kapasite', value: '600', unit: 'litre' },
      { name: 'Seri', value: 'Frezya S' },
      { name: 'Kullanım Alanı', value: 'Endüstriyel / otel' },
      { name: 'Garanti', value: '5 yıl tank' },
    ],
    tags: ['Frezya', 'AO Smith', '600 litre', 'endüstriyel', 'otel', 'is-yeri'],
  })

  // ─── Albsu Ürünleri — İş Yeriniz İçin › Su Yumuşatma Sistemleri ──────────

  await upsertProduct({
    id: 'albsu-011', slug: 'opal-nw-su-yumusatma', brandId: albSu.id, categoryId: catIsYeriYumusatma.id,
    name: 'OPAL NW Su Yumuşatma Sistemi', sku: 'ALBSU-OPAL-NW', unit: 'adet', stock: 10,
    isFeatured: false, rating: 4.8, reviewCount: 27,
    price: 22000,
    shortDescription: 'OPAL NW çift tanklı, kesintisiz yumuşak su sağlayan yüksek kapasiteli sistem.',
    description: 'OPAL NW Serisi, çift reçine tanklı tasarımıyla kesintisiz yumuşak su temin eden yüksek kapasiteli su yumuşatma sistemidir. Bir tank yenileme yaparken diğeri aktif çalıştığından hiçbir zaman sert su gelme riski yoktur.',
    images: [{ url: '/images/albsu-opal-nw.jpg', alt: 'OPAL NW Su Yumuşatma', isPrimary: true }],
    specs: [
      { name: 'Seri', value: 'OPAL NW' },
      { name: 'Tank Sayısı', value: 'Çift tank' },
      { name: 'Çalışma', value: 'Kesintisiz yumuşak su' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['OPAL', 'su yumuşatma', 'çift tank', 'kesintisiz', 'is-yeri'],
  })

  // ─── Albsu Ürünleri — Küçük Ev Aletleri › Klima Sistemleri ──────────────

  await upsertProduct({
    id: 'albsu-015', slug: 'ihlas-aura-18000-btu-klima', brandId: albSu.id, categoryId: catKlima.id,
    name: 'İhlas Aura 18.000 BTU Klima', sku: 'ALBSU-AURA-18S', unit: 'adet', stock: 20,
    isFeatured: true, rating: 4.7, reviewCount: 95,
    price: 14500, salePrice: 12800,
    shortDescription: 'İhlas Aura 18.000 BTU duvar tipi inverter klima, A++ enerji sınıfı.',
    description: 'İhlas Aura 18.000 BTU, orta büyüklükteki yatak odası ve oturma odaları için ideal inverter teknolojili split klimadır. Sessiz çalışma modunda 19 dB(A) ses seviyesiyle konfor sağlar, WiFi entegrasyonu ile uygulamanızdan kontrol edilebilir.',
    images: [{ url: '/images/albsu-ihlas-aura-18.jpg', alt: 'İhlas Aura 18000 BTU', isPrimary: true }],
    specs: [
      { name: 'Soğutma Kapasitesi', value: '18.000', unit: 'BTU' },
      { name: 'Enerji Sınıfı', value: 'A++' },
      { name: 'Ses Seviyesi (iç)', value: '19', unit: 'dB(A)' },
      { name: 'WiFi', value: 'Var' },
      { name: 'Garanti', value: '3 yıl' },
    ],
    tags: ['İhlas', 'Aura', 'klima', '18000 BTU', 'inverter', 'A++', 'kucuk-ev-aleti'],
  })

  await upsertProduct({
    id: 'albsu-016', slug: 'ihlas-aura-12000-btu-klima', brandId: albSu.id, categoryId: catKlima.id,
    name: 'İhlas Aura 12.000 BTU Klima', sku: 'ALBSU-AURA-12S', unit: 'adet', stock: 25,
    isFeatured: true, rating: 4.8, reviewCount: 142,
    price: 11200, salePrice: 9800,
    shortDescription: 'İhlas Aura 12.000 BTU küçük oda kliması, inverter ve A++ enerji sınıfı.',
    description: 'İhlas Aura 12.000 BTU, küçük ve orta büyüklükteki odalar için tasarlanmış ekonomik ve sessiz inverter klimadır. Yüksek enerji verimliliği ile işletme maliyetlerini minimize eder; soğutma ve ısıtma modunda çalışır.',
    images: [{ url: '/images/albsu-ihlas-aura-12.jpg', alt: 'İhlas Aura 12000 BTU', isPrimary: true }],
    specs: [
      { name: 'Soğutma Kapasitesi', value: '12.000', unit: 'BTU' },
      { name: 'Enerji Sınıfı', value: 'A++' },
      { name: 'WiFi', value: 'Var' },
      { name: 'Garanti', value: '3 yıl' },
    ],
    tags: ['İhlas', 'Aura', 'klima', '12000 BTU', 'inverter', 'A++', 'kucuk-ev-aleti'],
  })

  await upsertProduct({
    id: 'albsu-017', slug: 'ihlas-aura-24000-btu-salon-klima', brandId: albSu.id, categoryId: catKlima.id,
    name: 'İhlas Aura 24.000 BTU Salon Tipi Klima', sku: 'ALBSU-AURA-24SAL', unit: 'adet', stock: 14,
    isFeatured: false, rating: 4.9, reviewCount: 67,
    price: 22000,
    shortDescription: 'İhlas Aura 24.000 BTU salon tipi güçlü klima, büyük alan soğutma ve ısıtma.',
    description: 'İhlas Aura 24.000 BTU Salon Tipi Klima, geniş salonlar, restoran ve toplantı salonları için ideal güçlü inverter klimadır. Çoklu yön hava dağılımı ile her köşeye eşit soğutma ve ısıtma sağlar.',
    images: [{ url: '/images/albsu-ihlas-aura-24.jpg', alt: 'İhlas Aura 24000 BTU Salon', isPrimary: true }],
    specs: [
      { name: 'Soğutma Kapasitesi', value: '24.000', unit: 'BTU' },
      { name: 'Tip', value: 'Salon tipi' },
      { name: 'Enerji Sınıfı', value: 'A+' },
      { name: 'Hava Dağılımı', value: '4 yönlü' },
      { name: 'Garanti', value: '3 yıl' },
    ],
    tags: ['İhlas', 'Aura', 'klima', '24000 BTU', 'salon tipi', 'kucuk-ev-aleti'],
  })

  // ─── Albsu Ürünleri — Küçük Ev Aletleri › Vantilatör ────────────────────

  await upsertProduct({
    id: 'albsu-019', slug: 'ihlas-au3502-new-vantilator', brandId: albSu.id, categoryId: catVantilator.id,
    name: 'İhlas AU3502 New Vantilatör', sku: 'ALBSU-IHL-AU3502', unit: 'adet', stock: 50,
    isFeatured: false, rating: 4.5, reviewCount: 63,
    price: 1850, salePrice: 1550,
    shortDescription: 'İhlas AU3502 New kule tipi vantilatör, 3 hız kademesi ve 70° titreşim.',
    description: 'İhlas AU3502 New, kule tipi tasarımıyla geniş alan hava sirkülasyonu sağlayan modern vantilatördür. 3 hız kademesi, 70° otomatik titreşim ve gece modu özelliğiyle sessiz konfor sunar; uzaktan kumandası ile kolay kullanım sağlar.',
    images: [{ url: '/images/albsu-ihlas-au3502.jpg', alt: 'İhlas AU3502 Vantilatör', isPrimary: true }],
    specs: [
      { name: 'Model', value: 'AU3502 New' },
      { name: 'Tip', value: 'Kule tipi' },
      { name: 'Hız Kademesi', value: '3' },
      { name: 'Titreşim Açısı', value: '70°' },
      { name: 'Gece Modu', value: 'Var' },
      { name: 'Uzaktan Kumanda', value: 'Var' },
    ],
    tags: ['vantilatör', 'İhlas', 'AU3502', 'kule tipi', 'uzaktan kumanda', 'kucuk-ev-aleti'],
  })

  // ─── Albsu Ürünleri — Küçük Ev Aletleri › Temizlik Aletleri ─────────────

  await upsertProduct({
    id: 'albsu-020', slug: 'karcher-k2-compact', brandId: albSu.id, categoryId: catTemizlik.id,
    name: 'Kärcher K2 Compact Yüksek Basınçlı Yıkayıcı', sku: 'ALBSU-KARCH-K2', unit: 'adet', stock: 40,
    isFeatured: true, rating: 4.7, reviewCount: 201,
    price: 4200, salePrice: 3650,
    shortDescription: 'Kärcher K2 Compact, araç ve balkon temizliği için giriş seviye basınçlı yıkayıcı.',
    description: 'Kärcher K2 Compact, araç, balkon, bahçe mobilyası ve dış cephe temizliğinde kullanılan 110 bar basınçlı elektrikli yüksek basınçlı yıkayıcıdır. Kompakt depolama özelliği ve tam aksesuar seti ile pratik kullanım sunar.',
    images: [{ url: '/images/albsu-karcher-k2.jpg', alt: 'Kärcher K2 Compact', isPrimary: true }],
    specs: [
      { name: 'Basınç', value: '110', unit: 'bar' },
      { name: 'Güç', value: '1.400', unit: 'Watt' },
      { name: 'Debi', value: '360', unit: 'L/saat' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['Kärcher', 'yüksek basınçlı yıkayıcı', 'temizlik', 'K2', 'kucuk-ev-aleti'],
  })

  await upsertProduct({
    id: 'albsu-021', slug: 'karcher-k5-premium-full-control', brandId: albSu.id, categoryId: catTemizlik.id,
    name: 'Kärcher K5 Premium Full Control', sku: 'ALBSU-KARCH-K5', unit: 'adet', stock: 18,
    isFeatured: false, rating: 4.9, reviewCount: 134,
    price: 9800,
    shortDescription: 'Kärcher K5 Premium Full Control, 145 bar ve dijital tetik kontrollü profesyonel yıkayıcı.',
    description: 'Kärcher K5 Premium Full Control, 145 bar çalışma basıncı ve dijital basınç göstergeli tetik tabancasıyla profesyonel düzeyde temizlik yapan güçlü yüksek basınçlı yıkayıcıdır. Su soğutmalı motor ve su çekimli deterjan emişiyle yüksek performans sunar.',
    images: [{ url: '/images/albsu-karcher-k5.jpg', alt: 'Kärcher K5 Premium Full Control', isPrimary: true }],
    specs: [
      { name: 'Basınç', value: '145', unit: 'bar' },
      { name: 'Güç', value: '2.100', unit: 'Watt' },
      { name: 'Debi', value: '500', unit: 'L/saat' },
      { name: 'Kontrol', value: 'Full Control dijital basınç' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['Kärcher', 'yüksek basınçlı yıkayıcı', 'K5', 'profesyonel', 'kucuk-ev-aleti'],
  })

  await upsertProduct({
    id: 'albsu-022', slug: 'karcher-vc5-cordless-elektrikli-supurge', brandId: albSu.id, categoryId: catTemizlik.id,
    name: 'Kärcher VC 5 Cordless Elektrikli Süpürge', sku: 'ALBSU-KARCH-VC5', unit: 'adet', stock: 30,
    isFeatured: true, rating: 4.6, reviewCount: 87,
    price: 4900, salePrice: 4200,
    shortDescription: 'Kärcher VC 5 Cordless, şarjlı dikey elektrikli süpürge, güçlü emişli.',
    description: 'Kärcher VC 5 Cordless, kablo bağımsız 18V şarjlı motoru ve geniş emme başlığıyla sert zemin ve halıda üstün performans sunan dikey elektrikli süpürgedir. Hafif yapısı, esnek başlığı ve uzun pil ömrüyle ev temizliğini kolaylaştırır.',
    images: [{ url: '/images/albsu-karcher-vc5.jpg', alt: 'Kärcher VC 5 Cordless', isPrimary: true }],
    specs: [
      { name: 'Model', value: 'VC 5 Cordless' },
      { name: 'Güç Kaynağı', value: 'Şarjlı (18V Li-ion)' },
      { name: 'Pil Ömrü', value: '40 dk' },
      { name: 'Ağırlık', value: '2.6', unit: 'kg' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['Kärcher', 'elektrikli süpürge', 'şarjlı', 'VC 5', 'cordless', 'kucuk-ev-aleti'],
  })

  await upsertProduct({
    id: 'albsu-023', slug: 'karcher-rcv5-robot-supurge', brandId: albSu.id, categoryId: catTemizlik.id,
    name: 'Kärcher RCV 5 Robot Süpürge', sku: 'ALBSU-KARCH-RCV5', unit: 'adet', stock: 20,
    isFeatured: true, rating: 4.7, reviewCount: 112,
    price: 8500, salePrice: 7200,
    shortDescription: 'Kärcher RCV 5 akıllı navigasyonlu robot süpürge, uygulama kontrolü.',
    description: 'Kärcher RCV 5, lazer navigasyon sistemi ve akıllı haritalama özelliğiyle evin tüm köşelerini sistematik biçimde temizleyen robot süpürgedir. Uygulama üzerinden bölge seçimi, zamanlama ve temizlik geçmişi takibi yapılabilir.',
    images: [{ url: '/images/albsu-karcher-rcv5.jpg', alt: 'Kärcher RCV 5 Robot Süpürge', isPrimary: true }],
    specs: [
      { name: 'Model', value: 'RCV 5' },
      { name: 'Navigasyon', value: 'Lazer + akıllı haritalama' },
      { name: 'Pil Ömrü', value: '120 dk' },
      { name: 'Uygulama Kontrolü', value: 'Var (iOS / Android)' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['Kärcher', 'robot süpürge', 'RCV 5', 'akıllı', 'lazer navigasyon', 'kucuk-ev-aleti'],
  })

  await upsertProduct({
    id: 'albsu-024', slug: 'karcher-rcw2-extra-pencere-temizleme-robotu', brandId: albSu.id, categoryId: catTemizlik.id,
    name: 'Kärcher RCW 2 Extra+ Pencere Temizleme Robotu', sku: 'ALBSU-KARCH-RCW2', unit: 'adet', stock: 15,
    isFeatured: false, rating: 4.5, reviewCount: 54,
    price: 6800, salePrice: 5900,
    shortDescription: 'RCW 2 Extra+ büyük ve ulaşılması zor pencereleri zahmetsizce temizler, iz bırakmaz.',
    description: 'Kärcher RCW 2 Extra+, güçlü vakum teknolojisiyle cam yüzeye yapışarak sistematik navigasyon ve nesne algılama sensörleriyle otomatik temizlik yapan pencere temizleme robotudur. Mikrofiber silme bezleri ve iki püskürtme başlığıyla her seferinde pırıl pırıl, iz bırakmayan sonuçlar sunar.',
    images: [{ url: '/images/albsu-karcher-wvr40.jpg', alt: 'Kärcher RCW 2 Extra+ Pencere Temizleme Robotu', isPrimary: true }],
    specs: [
      { name: 'Model', value: 'RCW 2 Extra+' },
      { name: 'Emiş Gücü', value: '3.300 Pa (maks. 5.000 Pa)' },
      { name: 'Deterjan Tankı', value: '70', unit: 'ml' },
      { name: 'Kablo Uzunluğu', value: '5', unit: 'm' },
      { name: 'Ses Seviyesi', value: '62', unit: 'dB(A)' },
      { name: 'Ağırlık', value: '1,1', unit: 'kg' },
      { name: 'Voltaj', value: '100-240', unit: 'V' },
      { name: 'Garanti', value: '2 yıl' },
    ],
    tags: ['Kärcher', 'cam temizleme robotu', 'RCW 2', 'pencere', 'robot', 'kucuk-ev-aleti'],
  })

  // Kullanılmayan eski değişkenleri Prisma'nın şikayet etmemesi için void
  void catEvSuAritma
  void catEndustriyel
  void catFiltre

  console.log('\n🎉 Seed tamamlandı!')
  const total = await prisma.product.count()
  console.log(`   Toplam ürün: ${total}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
