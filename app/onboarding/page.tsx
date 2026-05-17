'use client'

export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Asia/Karachi', 'Asia/Dubai',
  'Asia/Riyadh', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Kuala_Lumpur',
]

export default function OnboardingPage() {
  const [step, setStep]         = useState(1)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function completeOnboarding() {
    if (!fullName.trim() || !username.trim()) {
      toast.error('Please fill in your name and username')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('profiles').update({
      full_name: fullName.trim(),
      username: username.toLowerCase().replace(/[^a-z0-9]/g, ''),
      timezone,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (error) { toast.error('Failed to save profile: ' + error.message); setLoading(false); return }

    toast.success('OS initialized. Let\'s go.')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-os-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <Image src="/logo.jpeg" alt="Maqsad" width={36} height={36}
            className="rounded-sm" style={{ background: '#0f1a30' }} />
          <div className="font-syne text-sm font-bold tracking-widest text-os-accent uppercase">
            Setting Up Your OS
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 h-0.5 rounded-full transition-colors"
              style={{ background: s <= step ? '#c8a97e' : '#222228' }} />
          ))}
        </div>

        <div className="os-card">
          {step === 1 && (
            <div>
              <h2 className="font-syne text-base font-bold tracking-wider uppercase text-os-text mb-1">
                Who are you?
              </h2>
              <p className="text-[10px] text-os-text-muted mb-6">Your OS will be personalized with your name.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] text-os-text-muted tracking-widest uppercase mb-1.5">Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="os-input" placeholder="Arham" autoFocus />
                </div>
                <div>
                  <label className="block text-[9px] text-os-text-muted tracking-widest uppercase mb-1.5">
                    Username - appears as <span className="text-os-accent">[name] OS</span>
                  </label>
                  <input type="text" value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    className="os-input" placeholder="arham" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-syne text-base font-bold tracking-wider uppercase text-os-text mb-1">Timezone</h2>
              <p className="text-[10px] text-os-text-muted mb-6">Used for daily log dates and streaks.</p>
              <select value={timezone} onChange={e => setTimezone(e.target.value)} className="os-input">
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-syne text-base font-bold tracking-wider uppercase text-os-text mb-1">
                OS Ready
              </h2>
              <p className="text-[10px] text-os-text-muted mb-6">
                Your private Life OS has been initialized.
              </p>
              <div className="space-y-2 mb-6">
                {[
                  `Name: ${fullName}`,
                  `Username: ${username} OS`,
                  `Timezone: ${timezone}`,
                  'Plan: 7-Day Trial',
                  'AI calls: 2 per week',
                ].map(item => (
                  <div key={item} className="text-[11px] text-os-text-muted py-1.5 border-b border-os-border">
                    <span className="text-os-accent mr-2">·</span>{item}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="os-btn os-btn-sm flex-1">
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} className="os-btn os-btn-accent flex-1 py-2.5 text-[11px]">
                Continue →
              </button>
            ) : (
              <button onClick={completeOnboarding} disabled={loading}
                className="os-btn os-btn-accent flex-1 py-2.5 text-[11px]">
                {loading ? 'Initializing...' : 'Enter My OS →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
