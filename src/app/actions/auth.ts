'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

// ─── E-posta / Şifre ile Kayıt ───────────────────────────────────────────────

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  })

  if (error) {
    redirect(`/kayit?error=${encodeURIComponent(error.message)}`)
  }

  if (data.user) {
    // Kullanıcıyı kendi DB'ye kaydet
    await prisma.user.upsert({
      where: { id: data.user.id },
      update: { email, name },
      create: { id: data.user.id, email, name },
    })
  }

  redirect('/giris?mesaj=email-dogrulama')
}

// ─── E-posta / Şifre ile Giriş ───────────────────────────────────────────────

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirect') as string) || '/hesabim'

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/giris?error=${encodeURIComponent(error.message)}`)
  }

  redirect(redirectTo)
}

// ─── Google ile Giriş ────────────────────────────────────────────────────────

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${redirectTo ?? '/hesabim'}`,
    },
  })

  if (error || !data.url) {
    redirect('/giris?error=google')
  }

  redirect(data.url)
}

// ─── Çıkış ───────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
