'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today, formatDate, daysClean } from '@/lib/dates'
import toast from 'react-hot-toast'

interface QuitTracker {
  id: string
  name: string
  start_date: string
  last_reset_date: string | null
  notes: string | null
}

export default function QuittingModule() {
  const supabase = createClient()
  const [trackers, setTrackers] = useState<QuitTracker[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTracker, setEditingTracker] = useState<QuitTracker | null>(null)
  const [confirmReset, setConfirmReset] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    start_date: today(),
    notes: '',
  })

  const fetchTrackers = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('quitting_trackers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at')

    if (data) setTrackers(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchTrackers() }, [fetchTrackers])

  const resetForm = () => setForm({ name: '', start_date: today(), notes: '' })

  async function saveTracker() {
    if (!form.name.trim()) { toast.error('Name required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      name: form.name,
      start_date: form.start_date,
      last_reset_date: null,
      notes: form.notes || null,
    }

    let error
    if (editingTracker) {
      ({ error } = await supabase.from('quitting_trackers').update({ name: form.name, notes: form.notes || null }).eq('id', editingTracker.id))
    } else {
      ({ error } = await supabase.from('quitting_trackers').insert(payload))
    }

    if (error) { toast.error('Failed to save'); return }
    toast.success(editingTracker ? 'Updated' : 'Tracker created')
    setShowForm(false)
    setEditingTracker(null)
    resetForm()
    fetchTrackers()
  }

  async function resetStreak(id: string) {
    const { error } = await supabase
      .from('quitting_trackers')
      .update({ last_reset_date: today() })
      .eq('id', id)

    if (error) { toast.error('Failed to reset'); return }
    toast.success('Streak reset. You can do this.')
    setConfirmReset(null)
    fetchTrackers()
  }

  async function deleteTracker(id: string) {
    const { error } = await supabase.from('quitting_trackers').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Tracker deleted')
    fetchTrackers()
  }

  function openEdit(t: QuitTracker) {
    setForm({ name: t.name, start_date: t.start_date, notes: t.notes || '' })
    setEditingTracker(t)
    setShowForm(true)
  }

  function getStreakColor(days: number): string {
    if (days >= 90) return '#c8a97e'
    if (days >= 30) return '#5cb88a'
    if (days >= 7) return '#5c8fd4'
    if (days >= 3) return '#d47c3a'
    return '#d45c5c'
  }

  function getStreakLabel(days: number): string {
    if (days >= 365) return 'LEGENDARY'
    if (days >= 90) return 'ELITE'
    if (days >= 30) return 'STRONG'
    if (days >= 14) return 'BUILDING'
    if (days >= 7) return 'ONE WEEK'
    if (days >= 3) return 'HOLD IT'
    if (days >= 1) return 'STARTING'
    return 'BEGIN NOW'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[var(--text-muted)] text-xs tracking-widest">LOADING...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Trackers Grid */}
      <div className="flex items-center justify-between">
        <h2 className="os-section-title">QUITTING TRACKERS</h2>
        <button onClick={() => { resetForm(); setEditingTracker(null); setShowForm(true) }} className="os-btn">
          + NEW TRACKER
        </button>
      </div>

      {showForm && (
        <div className="os-card border border-[var(--accent)] border-opacity-30 space-y-4">
          <div className="text-[10px] text-[var(--accent)] tracking-widest font-bold">
            {editingTracker ? 'EDIT TRACKER' : 'CREATE TRACKER'}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">WHAT ARE YOU QUITTING? *</label>
              <input type="text" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Smoking, Social media, Junk food, Porn..." className="os-input w-full" />
            </div>
            {!editingTracker && (
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">START DATE</label>
                <input type="date" value={form.start_date}
                  onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                  className="os-input w-full" />
              </div>
            )}
            <div className={editingTracker ? 'col-span-2' : ''}>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">NOTES / WHY QUITTING</label>
              <input type="text" value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Your reason, triggers to watch, etc." className="os-input w-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveTracker} className="os-btn">SAVE</button>
            <button onClick={() => { setShowForm(false); setEditingTracker(null); resetForm() }}
              className="os-btn opacity-50">CANCEL</button>
          </div>
        </div>
      )}

      {trackers.length === 0 ? (
        <div className="os-card text-center py-16">
          <div className="text-4xl mb-4">🚫</div>
          <div className="text-[var(--text-muted)] text-xs mb-2">No quitting trackers yet</div>
          <div className="text-[var(--text-dim)] text-[10px]">Track what you're eliminating from your life</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trackers.map(tracker => {
            const days = daysClean(tracker.start_date, tracker.last_reset_date)
            const color = getStreakColor(days)
            const label = getStreakLabel(days)

            return (
              <div key={tracker.id} className="os-card group relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{ background: `radial-gradient(circle at top right, ${color}, transparent 70%)` }} />

                {/* Content */}
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-bold text-sm text-[var(--text)] font-['Syne'] mb-1">{tracker.name}</div>
                      <div className="text-[9px] text-[var(--text-muted)]">
                        Started {formatDate(tracker.start_date)}
                        {tracker.last_reset_date && ` · Last reset ${formatDate(tracker.last_reset_date)}`}
                      </div>
                    </div>
                    <div className="text-[8px] px-2 py-0.5 rounded-full font-bold border"
                      style={{ color, borderColor: color + '40', backgroundColor: color + '10' }}>
                      {label}
                    </div>
                  </div>

                  {/* Big counter */}
                  <div className="text-center py-4">
                    <div className="text-6xl font-bold font-['Syne'] mb-1" style={{ color }}>
                      {days}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] tracking-widest">
                      DAY{days !== 1 ? 'S' : ''} CLEAN
                    </div>
                  </div>

                  {/* Week indicators */}
                  <div className="flex justify-center gap-1 mb-4">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: i < Math.min(days, 7) ? color : 'var(--border)' }} />
                    ))}
                  </div>

                  {tracker.notes && (
                    <div className="text-[10px] text-[var(--text-dim)] italic mb-4">"{tracker.notes}"</div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-[var(--border)] pt-3">
                    {confirmReset === tracker.id ? (
                      <>
                        <button onClick={() => resetStreak(tracker.id)}
                          className="flex-1 text-[9px] text-[var(--red)] border border-[var(--red)] border-opacity-50 rounded py-1.5 hover:bg-red-500 hover:bg-opacity-10 transition-all">
                          CONFIRM RESET
                        </button>
                        <button onClick={() => setConfirmReset(null)}
                          className="flex-1 text-[9px] text-[var(--text-muted)] border border-[var(--border)] rounded py-1.5">
                          CANCEL
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setConfirmReset(tracker.id)}
                          className="flex-1 text-[9px] text-[var(--text-muted)] hover:text-[var(--warn)] border border-[var(--border)] rounded py-1.5 transition-all">
                          RESET STREAK
                        </button>
                        <button onClick={() => openEdit(tracker)}
                          className="text-[9px] text-[var(--text-muted)] hover:text-[var(--accent)] px-3 py-1.5 border border-[var(--border)] rounded transition-all">
                          EDIT
                        </button>
                        <button onClick={() => deleteTracker(tracker.id)}
                          className="text-[9px] text-[var(--text-muted)] hover:text-[var(--red)] px-3 py-1.5 border border-[var(--border)] rounded transition-all">
                          DEL
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Motivation quote */}
      {trackers.length > 0 && (
        <div className="os-card text-center py-4 border-[var(--border-bright)]">
          <div className="text-[10px] text-[var(--text-dim)] italic font-['Fraunces']">
            "Every day you don't give in is a vote for the person you're becoming."
          </div>
        </div>
      )}
    </div>
  )
}
