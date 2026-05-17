'use client'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use fallback placeholders during SSR/build when env vars aren't available.
  // Real values from process.env are used at runtime in the browser.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
  return createBrowserClient(url, key)
}
