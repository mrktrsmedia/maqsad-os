'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface SidebarProps { profile: Profile | null }

const navGroups = [
  {
    label: 'Core',
    items: [
      { label: 'Dashboard',       href: '/dashboard',                icon: '⬡' },
      { label: 'Weekly Move',     href: '/dashboard/weekly',         icon: '◈' },
      { label: 'Backsight',       href: '/dashboard/backsight',      icon: '◉' },
    ],
  },
  {
    label: 'Body',
    items: [
      { label: 'Diet & Nutrition', href: '/dashboard/diet',          icon: '▣' },
      { label: 'Gym & Fitness',   href: '/dashboard/gym',            icon: '▲' },
      { label: 'Habits & Systems',href: '/dashboard/habits',         icon: '◆' },
    ],
  },
  {
    label: 'Work',
    items: [
      { label: 'Outreach',        href: '/dashboard/outreach',       icon: '▷' },
      { label: 'Learning',        href: '/dashboard/learning',       icon: '◎' },
      { label: 'Finance',         href: '/dashboard/finance',        icon: '◇' },
    ],
  },
  {
    label: 'Self',
    items: [
      { label: 'Spirituality',    href: '/dashboard/spirituality',   icon: '✦' },
      { label: 'Relationships',   href: '/dashboard/relationships',  icon: '◯' },
      { label: 'Quitting',        href: '/dashboard/quitting',       icon: '⊘' },
      { label: 'Mirror / AI',     href: '/dashboard/mirror',         icon: '◐' },
    ],
  },
]

const QUOTES = [
  '"Discipline is the bridge between goals and accomplishment."',
  '"The cost of discipline is always less than the cost of regret."',
  '"You don\'t rise to the level of your goals - you fall to the level of your systems."',
]

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const quote = QUOTES[new Date().getDay() % QUOTES.length]
  const displayName = (profile?.username ?? profile?.full_name?.split(' ')[0] ?? 'YOUR').toUpperCase()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    toast.success('Signed out.')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-os-surface border-r border-os-border flex flex-col z-50">
      {/* Header */}
      <div className="px-5 pt-7 pb-5 border-b border-os-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm overflow-hidden flex-shrink-0" style={{ background: '#0f1a30' }}>
            <Image src="/logo.jpeg" alt="Maqsad" width={28} height={28}
              className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-syne text-sm font-extrabold text-os-accent tracking-widest">
              {displayName} OS
            </div>
            <div className="text-[8px] text-os-text-muted tracking-[0.22em] uppercase mt-0.5">Life OS</div>
          </div>
        </div>
        <div className="mt-3 text-[9px] text-os-text-muted tracking-tight">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="px-5 py-1.5 text-[8px] tracking-[0.22em] uppercase text-os-text-dim mt-2">
              {group.label}
            </div>
            {group.items.map(item => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`os-nav-item ${isActive ? 'os-nav-item-active' : ''}`}
                >
                  <span className="text-sm w-4 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-os-border">
        <p className="font-fraunces italic text-[10px] text-os-text-muted leading-relaxed mb-3">
          {quote}
        </p>
        <button
          onClick={handleLogout}
          className="os-btn os-btn-sm w-full text-center"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
