'use client'

export const dynamic = 'force-dynamic'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-os-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <Image src="/logo.jpeg" alt="Maqsad" width={32} height={32}
            className="rounded-sm" style={{ background: '#0f1a30' }} />
          <div>
            <div className="font-syne text-sm font-bold tracking-widest text-os-accent uppercase">Maqsad OS</div>
            <div className="text-[9px] text-os-text-muted tracking-[0.2em] uppercase">Your Life Operating System</div>
          </div>
        </div>

        <div className="os-card">
          <h1 className="font-syne text-base font-bold tracking-wider uppercase text-os-text mb-1">Sign In</h1>
          <p className="text-[10px] text-os-text-muted mb-6 tracking-wider">Enter your credentials to access your OS.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[9px] text-os-text-muted tracking-widest uppercase mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="os-input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[9px] text-os-text-muted tracking-widest uppercase mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="os-input"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="os-btn os-btn-accent w-full mt-6 py-2.5 text-[11px]"
            >
              {loading ? 'Signing in...' : 'Access OS →'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-os-border text-center">
            <span className="text-[10px] text-os-text-muted">
              No account?{' '}
              <Link href="/signup" className="text-os-accent hover:underline">Start trial →</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
