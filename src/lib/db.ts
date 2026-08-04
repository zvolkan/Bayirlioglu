import { PrismaClient } from '@prisma/client'

// Next.js geliştirme ortamında hot-reload sırasında
// birden fazla PrismaClient örneği oluşmasını önler
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * `prisma.$transaction(async (tx) => …)` içindeki istemcinin tipi.
 *
 * Prisma'nın kendi `Prisma.TransactionClient` tipi yerine bunu kullanıyoruz;
 * böylece `prisma generate` henüz çalıştırılmamış bir ortamda da derleme
 * bozulmaz.
 */
export type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>
