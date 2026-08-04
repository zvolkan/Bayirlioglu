/**
 * Admin oturum token'ı — HMAC-SHA256 ile imzalanır.
 *
 * Eskiden cookie sabit 'authenticated' metnini tutuyordu; bu değeri elle
 * tanımlayan herkes admin olabiliyordu. Artık token sunucu sırrıyla imzalı ve
 * son kullanma tarihli.
 *
 * Web Crypto API kullanır → hem Node (server action) hem Edge (middleware)
 * ortamında çalışır.
 */

const encoder = new TextEncoder()

/** Ortam değişkeni yoksa null döner → doğrulama her zaman başarısız olur (fail-closed) */
function getSecret(): string | null {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim()
  return secret && secret.length > 0 ? secret : null
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value: string): Uint8Array {
  const padding = value.length % 4 === 0 ? '' : '='.repeat(4 - (value.length % 4))
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + padding
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return base64UrlEncode(new Uint8Array(signature))
}

/** Sabit süreli karşılaştırma — zamanlama saldırılarına karşı */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** İmzalı oturum token'ı üretir. `maxAgeSeconds` kadar geçerlidir. */
export async function createAdminToken(maxAgeSeconds: number): Promise<string> {
  const secret = getSecret()
  if (!secret) throw new Error('ADMIN_SESSION_SECRET (veya ADMIN_PASSWORD) tanımlı değil')

  const nonce = base64UrlEncode(crypto.getRandomValues(new Uint8Array(12)))
  const payload = {
    v: 1,
    iat: Date.now(),
    exp: Date.now() + maxAgeSeconds * 1000,
    n: nonce,
  }
  const encoded = base64UrlEncode(encoder.encode(JSON.stringify(payload)))
  return `${encoded}.${await sign(encoded, secret)}`
}

/** Token geçerli ve süresi dolmamış mı? Sır tanımlı değilse daima false. */
export async function verifyAdminToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false

  const secret = getSecret()
  if (!secret) return false

  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [encoded, signature] = parts

  let expected: string
  try {
    expected = await sign(encoded, secret)
  } catch {
    return false
  }
  if (!timingSafeEqual(signature, expected)) return false

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encoded)))
    if (typeof payload?.exp !== 'number') return false
    if (Date.now() > payload.exp) return false
    return true
  } catch {
    return false
  }
}
