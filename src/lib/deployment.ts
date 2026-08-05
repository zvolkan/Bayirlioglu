/**
 * Hangi build'in çalıştığını gösteren kısa etiket.
 *
 * Bir uç nokta ortam değişkenlerini görürken diğerinin görmemesi neredeyse her
 * zaman iki isteğin FARKLI deployment'lara gitmesinden kaynaklanır: değişken
 * eklendikten sonra alınan yeni build ile, iyzico'nun geri döndüğü eski build
 * aynı olmayabiliyor. Hata notlarına bu etiketi de yazınca hangi build'in
 * yazdığı tartışmasız oluyor.
 */
export function deploymentTag(): string {
  const env = process.env.VERCEL_ENV ?? 'local'
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)
  const host = process.env.VERCEL_URL

  return [env, commit, host].filter(Boolean).join(' · ')
}
