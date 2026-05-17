'use client'

export const dynamic = 'force-dynamic'
import { useState, Suspense } from 'react'
import type { FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// Inner component reads search params — must be inside Suspense
function SignupInner() {
  const params = useSearchParams()
  const prefillEmail = params.get('email') ?? ''
  const redirect = params.get('redirect') ?? '/onboarding'

  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    setLoading(false)
    if (error) { toast.error(error.message); return }
    setConfirmed(true)
  }

  // ── Email Confirmation Screen ──────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#0b1a2e] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Image src="/logo.jpeg" alt="Maqsad" width={40} height={40}
              style={{ borderRadius: 4, background: '#0f1a30' }} />
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: '0.12em', color: '#c9a96e', textTransform: 'uppercase' as const }}>Maqsad</div>
              <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#888075', textTransform: 'uppercase' as const }}>Life OS</div>
            </div>
          </div>

          <div style={{ background: '#0f1f35', border: '1px solid #1e3454', padding: '48px 40px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(201,169,110,0.1)',
              border: '1px solid rgba(201,169,110,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: 28,
            }}>✉</div>

            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: '#f0ede6', textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 12 }}>
              Check Your Email
            </div>
            <div style={{ fontSize: 15, color: '#888075', lineHeight: 1.8, marginBottom: 8 }}>
              We sent a confirmation link to
            </div>
            <div style={{ fontSize: 15, color: '#c9a96e', fontWeight: 600, marginBottom: 24 }}>
              {email}
            </div>
            <div style={{ fontSize: 14, color: '#888075', lineHeight: 1.8, marginBottom: 32 }}>
              Click the link in the email from <strong style={{ color: '#f0ede6' }}>Maqsad</strong> to activate your account and start your 7-day trial.
            </div>

            <div style={{ height: 1, background: '#1e3454', marginBottom: 24 }} />
            <div style={{ fontSize: 12, color: '#888075', marginBottom: 20, letterSpacing: '0.04em' }}>
              Did not receive it? Check your spam folder or
            </div>
            <button
              onClick={() => { setConfirmed(false); setPassword('') }}
              style={{
                background: 'transparent', border: '1px solid #284266',
                color: '#888075', fontFamily: 'Barlow, sans-serif',
                fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                padding: '10px 24px', cursor: 'pointer', width: '100%',
              }}
            >
              Try a Different Email
            </button>
          </div>

          <div style={{ marginTop: 20, fontSize: 12, color: '#888075' }}>
            Already confirmed?{' '}
            <Link href="/login" style={{ color: '#c9a96e', textDecoration: 'none' }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Signup Form ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-os-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10">
          <Image src="/logo.jpeg" alt="Maqsad" width={32} height={32}
            className="rounded-sm" style={{ background: '#0f1a30' }} />
          <div>
            <div className="font-syne text-sm font-bold tracking-widest text-os-accent uppercase">Maqsad OS</div>
            <div className="text-[9px] text-os-text-muted tracking-[0.2em] uppercase">7-Day Free Trial</div>
          </div>
        </div>

        <div className="os-card">
          <div className="font-syne text-xl font-bold text-os-text mb-1">Create Account</div>
          <div className="text-[10px] text-os-text-muted mb-6 tracking-widest">NO CREDIT CARD REQUIRED</div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-[9px] text-os-text-muted tracking-widest block mb-1">FULL NAME</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Your full name" className="os-input w-full" />
            </div>
            <div>
              <label className="text-[9px] text-os-text-muted tracking-widest block mb-1">EMAIL</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com" className="os-input w-full" />
            </div>
            <div>
              <label className="text-[9px] text-os-text-muted tracking-widest block mb-1">PASSWORD</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters" className="os-input w-full" />
            </div>

            <button type="submit" disabled={loading} className="os-btn w-full mt-2">
              {loading ? 'CREATING...' : 'START FREE TRIAL'}
            </button>
          </form>

          <div className="text-center mt-4 text-[10px] text-os-text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-os-accent hover:underline">Sign in</Link>
          </div>
        </div>

        <div className="text-center mt-6 text-[9px] text-os-text-dim tracking-widest">
          BY SIGNING UP YOU AGREE TO OUR TERMS AND PRIVACY POLICY
        </div>
      </div>
    </div>
  )
}

// Outer wrapper provides the Suspense boundary Next.js requires for useSearchParams
export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-os-bg flex items-center justify-center">
        <div className="text-os-text-muted text-xs tracking-widest animate-pulse">LOADING...</div>
      </div>
    }>
      <SignupInner />
    </Suspense>
  )
}
