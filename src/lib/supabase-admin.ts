import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service role client — yalnızca sunucu tarafında kullanılır
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

const BUCKET = 'product-images'

/** Dosyayı Supabase Storage'a yükler, public URL döner */
export async function uploadProductImage(
  file: File,
  fileName: string,
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(`Upload hatası: ${error.message}`)

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}

/** Storage'dan dosya siler */
export async function deleteProductImage(fileName: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([fileName])
  if (error) console.error('Silme hatası:', error.message)
}
