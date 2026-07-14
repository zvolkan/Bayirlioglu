import { redirect } from 'next/navigation'

// Eski URL — artık marka bazlı sayfalara yönlendirildi.
export default function YeniUrunPage() {
  redirect('/admin')
}
