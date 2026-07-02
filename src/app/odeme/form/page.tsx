import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

type Props = {
  searchParams: Promise<{ token?: string }>
}

export default async function OdemeFormPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) notFound()

  const order = await prisma.order.findFirst({
    where: { paymentToken: token, status: 'PENDING' },
    select: { formContent: true },
  })

  if (!order?.formContent) notFound()

  return (
    <div
      style={{ minHeight: '100vh', background: '#f9fafb' }}
      dangerouslySetInnerHTML={{ __html: order.formContent }}
    />
  )
}
