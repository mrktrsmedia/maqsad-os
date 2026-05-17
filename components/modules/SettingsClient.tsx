'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { User } from '@supabase/supabase-js'

interface Profile {
  full_name: string | null
  username: string | null
  timezone: string | null
  plan: string | null
  trial_ends_at: string | null
}

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Karachi', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
  'Australia/Sydney', 'Pacific/Auckland',
]

interface Props {
  user: User
  initialProfile: Profile | null
}

export default function SettingsClient({ user, initialProfile }: Props) {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile>(
    initialProfile || { full_name: '', username: '', timezone: 'UTC', plan: 'trial', trial_ends_at: null }
  )
  const [saving, setSaving] = useState(false)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  async function saveProfile() {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      username: profile.username,
      timezone: profile.timezone,
    }).eq('id', user.id)

    setSaving(false)
    if (error) { toast.error('Failed to save'); return }
    toast.success('Profile saved')
  }

  async function changePassword() {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setChangingPassword(false)
    if (error) { toast.error(error.message); return }
    toast.success('Password updated')
    setNewPassword('')
  }

  async function openBillingPortal() {
    setOpeningPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error ?? 'Could not open billing portal')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setOpeningPortal(false)
    }
  }

  const planColor: Record<string, string> = {
    trial: '#d47c3a', free: '#5a5865', solo: '#5c8fd4', pro: '#c8a97e'
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Plan Status */}
      <div className="os-card">
        <div className="text-[10px] text-[var(--text-muted)] tracking-widest mb-4">CURRENT PLAN</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold font-['Syne'] mb-1"
              style={{ color: planColor[profile.plan || 'free'] || '#c8a97e' }}>
              {(profile.plan || 'FREE').toUpperCase()}
            </div>
            {profile.plan === 'trial' && profile.trial_ends_at && (
              <div className="text-[9px] text-[var(--warn)]">
                Trial ends {new Date(profile.trial_ends_at).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {(profile.plan === 'trial' || profile.plan === 'free') && (
              <a href="/pricing"
                className="os-btn text-[9px]">
                UPGRADE
              </a>
            )}
            {profile.plan !== 'trial' && profile.plan !== 'free' && (
              <button onClick={openBillingPortal} disabled={openingPortal}
                className="os-btn text-[9px]">
                {openingPortal ? 'OPENING...' : 'MANAGE BILLING'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="os-card">
        <div className="text-[10px] text-[var(--text-muted)] tracking-widest mb-4">PROFILE</div>
        <div className="space-y-4">
          <div>
            <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">EMAIL</label>
            <input type="email" value={user.email || ''} disabled
              className="os-input w-full opacity-50 cursor-not-allowed" />
            <div className="text-[8px] text-[var(--text-dim)] mt-1">Email cannot be changed here</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">FULL NAME</label>
              <input type="text" value={profile.full_name || ''}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Your full name" className="os-input w-full" />
            </div>
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">USERNAME</label>
              <input type="text" value={profile.username || ''}
                onChange={e => setProfile(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                placeholder="yourname" className="os-input w-full" />
              <div className="text-[8px] text-[var(--text-dim)] mt-1">Shows as "[Username] OS" in sidebar</div>
            </div>
          </div>
          <div>
            <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">TIMEZONE</label>
            <select value={profile.timezone || 'UTC'}
              onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
              className="os-input w-full">
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <button onClick={saveProfile} disabled={saving} className="os-btn">
            {saving ? 'SAVING...' : 'SAVE PROFILE'}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="os-card">
        <div className="text-[10px] text-[var(--text-muted)] tracking-widest mb-4">CHANGE PASSWORD</div>
        <div className="flex gap-3">
          <input type="password" value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="New password (min 8 chars)" className="os-input flex-1" />
          <button onClick={changePassword} disabled={changingPassword} className="os-btn">
            {changingPassword ? 'UPDATING...' : 'UPDATE'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="os-card border-[var(--red)] border-opacity-20">
        <div className="text-[10px] text-[var(--red)] tracking-widest mb-4">DANGER ZONE</div>
        <div className="text-[10px] text-[var(--text-muted)] mb-3">
          To delete your account and all data, contact support at support@maqsados.com
        </div>
        <div className="text-[9px] text-[var(--text-dim)]">
          Account deletion is permanent and cannot be undone.
        </div>
      </div>
    </div>
  )
}
