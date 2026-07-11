import { createClient } from '@supabase/supabase-js'

const BUCKET = 'product-images'

function getClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY env var eksik.')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Supabase Storage'a doğrudan tarayıcıdan yükleme yapmak için signed upload URL üretir.
 * İstemci bu URL'ye PUT isteği ile dosyayı Vercel üzerinden geçirmeden yükler.
 */
export async function getSignedUploadUrl(
  fileName: string,
): Promise<{ signedUrl: string; publicUrl: string }> {
  const client = getClient()

  const { data, error } = await client.storage.from(BUCKET).createSignedUploadUrl(fileName)
  if (error) throw new Error(`Signed URL hatası: ${error.message}`)

  const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(fileName)
  return { signedUrl: data.signedUrl, publicUrl: urlData.publicUrl }
}

/** Dosyayı Supabase Storage'a yükler, public URL döner */
export async function uploadProductImage(file: File, fileName: string): Promise<string> {
  const client = getClient()
  const { error } = await client.storage
    .from(BUCKET)
    .upload(fileName, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(`Upload hatası: ${error.message}`)

  const { data } = client.storage.from(BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}

/** Storage'dan dosya siler */
export async function deleteProductImage(fileName: string): Promise<void> {
  const client = getClient()
  const { error } = await client.storage.from(BUCKET).remove([fileName])
  if (error) console.error('Silme hatası:', error.message)
}
