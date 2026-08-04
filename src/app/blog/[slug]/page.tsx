import { redirect } from 'next/navigation'
import { ACTIVE_BRAND_KEY } from '@/lib/constants'

/** Eski blog yazısı rotası — marka blog'una yönlendirir */
export default async function EskiBlogYaziPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/${ACTIVE_BRAND_KEY}/blog/${slug}`)
}
