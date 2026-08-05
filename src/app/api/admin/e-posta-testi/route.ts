import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email/send'
import { deploymentTag } from '@/lib/deployment'
import { getSiteUrl } from '@/lib/site-url'

/**
 * E-posta yapılandırma testi (yalnızca admin).
 *
 * Sipariş e-postası gelmediğinde sorunun nerede olduğunu anlamak için her
 * seferinde gerçek bir sipariş vermek gerekiyordu. Bu uç nokta Resend'e tek
 * bir istek atıp sağlayıcının döndürdüğü ham hatayı ekrana basar.
 *
 * Kullanım:  /api/admin/e-posta-testi?to=ornek@gmail.com
 */

export const dynamic = 'force-dynamic'

const ADMIN_COOKIE = 'admin_session'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  if (!(await verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const url = new URL(request.url)
  const to = (url.searchParams.get('to') ?? '').trim()

  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim()
  const adminNotify = process.env.ADMIN_NOTIFY_EMAIL?.trim()

  const config = {
    RESEND_API_KEY: apiKey ? `tanımlı (${apiKey.slice(0, 6)}…)` : 'TANIMLI DEĞİL',
    EMAIL_FROM: from ?? 'TANIMLI DEĞİL',
    ADMIN_NOTIFY_EMAIL: adminNotify ?? 'tanımlı değil (yönetici bildirimi kapalı)',
  }

  // Bu isteği HANGİ build karşıladı ve iyzico geri dönüşü NEREYE gidiyor?
  // İkisi farklıysa ödeme callback'i başka bir deployment'a düşüyor demektir —
  // orada ortam değişkenleri tanımlı olmayabilir.
  const siteUrl = getSiteUrl()
  const dagitim = {
    buIstegiKarsilayanBuild: deploymentTag(),
    buIstegiKarsilayanAdres: url.host,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'TANIMLI DEĞİL',
    hesaplananSiteAdresi: siteUrl,
    iyzicoyaBildirilenCallback: `${siteUrl}/api/odeme/callback`,
    uyari:
      new URL(siteUrl).host === url.host
        ? null
        : `DİKKAT: Bu sayfayı "${url.host}" üzerinden açtınız ama ödeme geri dönüşü "${
            new URL(siteUrl).host
          }" adresine gidiyor. Bunlar farklıysa callback başka bir deployment'a düşer ve orada ortam değişkenleri tanımlı olmayabilir.`,
  }

  if (!to) {
    return NextResponse.json({
      config,
      dagitim,
      bilgi:
        'Test göndermek için ?to=adres@ornek.com ekleyin. ' +
        'Resend doğrulanmış alan adınız yoksa yalnızca Resend hesabınızı ' +
        'açtığınız e-posta adresine gönderim yapabilirsiniz.',
    })
  }

  if (!apiKey || !from) {
    return NextResponse.json(
      {
        config,
        dagitim,
        sonuc: 'başarısız',
        aciklama:
          'RESEND_API_KEY veya EMAIL_FROM tanımlı değil. Vercel ortam ' +
          'değişkenlerine ekleyip YENİDEN DEPLOY alın.',
      },
      { status: 500 },
    )
  }

  const result = await sendEmail({
    to,
    subject: 'Bayırlıoğlu — e-posta testi',
    html: '<p>Bu bir test e-postasıdır. Bunu görüyorsanız yapılandırma doğru.</p>',
    text: 'Bu bir test e-postasıdır. Bunu görüyorsanız yapılandırma doğru.',
  })

  if (result.ok) {
    return NextResponse.json({
      config,
      dagitim,
      sonuc: 'başarılı',
      resendId: result.id,
      aciklama: `Gönderildi. ${to} gelen kutusunu (ve spam klasörünü) kontrol edin.`,
    })
  }

  return NextResponse.json(
    {
      config,
      dagitim,
      sonuc: 'başarısız',
      detay: result.detail ?? result.reason,
      aciklama:
        'Resend isteği reddetti. Sunucu günlüklerinde (Vercel → Logs) ' +
        '"[e-posta] gönderim başarısız" satırının yanında sağlayıcının ham ' +
        'hata metni yazıyor.',
    },
    { status: 502 },
  )
}
