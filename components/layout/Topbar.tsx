'use client'
import Link from 'next/link'
import { getWeekNumber } from '@/lib/dates'
import type { Profile } from '@/types/database.types'

interface TopbarProps {
  title: string
  profile: Profile | null
}

export default function Topbar({ title, profile }: TopbarProps) {
  const weekNum = getWeekNumber()
  const year = new Date().getFullYear()

  const plan = profile?.plan ?? 'trial'
  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  const isOnTrial = plan === 'trial'

  return (
    <header className="sticky top-0 z-40 bg-os-bg/90 backdrop-blur-md border-b border-os-border px-8 py-3.5 flex items-center justify-between">
      <h1 className="font-syne text-[13px] font-bold tracking-[0.1em] uppercase text-os-text">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-[9px] px-2.5 py-1 bg-os-accent-glow border border-os-accent-dim text-os-accent rounded-sm tracking-[0.12em] uppercase">
          Week {weekNum} · {year}
        </span>

        {isOnTrial ? (
          <>
            <span className="text-[9px] px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-os-red rounded-sm tracking-wider uppercase">
              Trial · {trialDaysLeft}d left
            </span>
            <Link href="/pricing">
              <button className="os-btn os-btn-accent os-btn-sm">Upgrade →</button>
            </Link>
          </>
        ) : (
          <span className="text-[9px] px-2.5 py-1 bg-green-500/10 border border-green-500/30 text-os-green rounded-sm tracking-wider uppercase">
            {plan.toUpperCase()}
          </span>
        )}
      </div>
    </header>
  )
}
