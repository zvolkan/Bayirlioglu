import Image from 'next/image'

/**
 * Bayırlıoğlu grup logosu — marka logosundan AYRI.
 *
 * `BrandLogo` iki iş kolunu (ALB Tarım / Alb Su) temsil ediyor; bu bileşen ise
 * çatı şirketi. Header, footer ve ana sayfa hero'su zaten aynı görseli
 * kullanıyordu, ama kimlik doğrulama sayfalarında (giriş, kayıt, şifremi
 * unuttum, şifre yenile) logo yerine "BG" harfleri yazılıydı — dört dosyada
 * birebir kopyalanmış hâlde. Müşterinin logoyu ilk gördüğü yerlerden biri
 * giriş ekranı olduğu için orada baş harf göstermek zayıf duruyordu.
 *
 * Görsel beyaz olduğundan koyu bir kutunun içinde çiziliyor; kutu, eski
 * tasarımdaki koyu kareyle aynı ölçü ve köşe yarıçapında.
 */

interface Props {
  /** Logonun yanına "Bayırlıoğlu" yazısı da gelsin mi? */
  yaziliMi?: boolean
  className?: string
}

export default function GrupLogo({ yaziliMi = true, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
        <Image
          src="/images/logo-mark-white.svg"
          alt="Bayırlıoğlu"
          width={24}
          height={24}
          className="w-6 h-6 object-contain"
        />
      </span>
      {yaziliMi && <span className="font-bold text-xl text-gray-900">Bayırlıoğlu</span>}
    </span>
  )
}
