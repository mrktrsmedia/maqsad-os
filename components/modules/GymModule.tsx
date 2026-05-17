'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today, formatDate } from '@/lib/dates'
import toast from 'react-hot-toast'

interface GymSession {
  id: string
  session_date: string
  session_type: string
  key_lifts: string
  duration_minutes: number | null
  calories_burned: number | null
  energy_level: string
  notes: string | null
}

interface PersonalRecord {
  id: string
  lift_name: string
  weight_kg: number
  reps: number
  date_achieved: string
  notes: string | null
}

const SESSION_TYPES = ['Strength', 'Hypertrophy', 'Cardio', 'HIIT', 'Mobility', 'Sports', 'Mixed']
const ENERGY_LEVELS = ['Low', 'Medium', 'High', 'Peak']

export default function GymModule() {
  const supabase = createClient()
  const [sessions, setSessions] = useState<GymSession[]>([])
  const [prs, setPrs] = useState<PersonalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'sessions' | 'prs'>('sessions')
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [showPRForm, setShowPRForm] = useState(false)
  const [editingSession, setEditingSession] = useState<GymSession | null>(null)
  const [editingPR, setEditingPR] = useState<PersonalRecord | null>(null)

  const [sessionForm, setSessionForm] = useState({
    session_date: today(),
    session_type: 'Strength',
    key_lifts: '',
    duration_minutes: '',
    calories_burned: '',
    energy_level: 'High',
    notes: '',
  })

  const [prForm, setPRForm] = useState({
    lift_name: '',
    weight_kg: '',
    reps: '',
    date_achieved: today(),
    notes: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [sessionsRes, prsRes] = await Promise.all([
      supabase
        .from('gym_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(30),
      supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date_achieved', { ascending: false }),
    ])

    if (sessionsRes.data) setSessions(sessionsRes.data)
    if (prsRes.data) setPrs(prsRes.data)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const resetSessionForm = () => setSessionForm({
    session_date: today(), session_type: 'Strength', key_lifts: '',
    duration_minutes: '', calories_burned: '', energy_level: 'High', notes: '',
  })

  const resetPRForm = () => setPRForm({
    lift_name: '', weight_kg: '', reps: '', date_achieved: today(), notes: '',
  })

  async function saveSession() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      session_date: sessionForm.session_date,
      session_type: sessionForm.session_type,
      key_lifts: sessionForm.key_lifts,
      duration_minutes: sessionForm.duration_minutes ? parseInt(sessionForm.duration_minutes) : null,
      calories_burned: sessionForm.calories_burned ? parseInt(sessionForm.calories_burned) : null,
      energy_level: sessionForm.energy_level,
      notes: sessionForm.notes || null,
    }

    let error
    if (editingSession) {
      ({ error } = await supabase.from('gym_sessions').update(payload).eq('id', editingSession.id))
    } else {
      ({ error } = await supabase.from('gym_sessions').insert(payload))
    }

    if (error) { toast.error('Failed to save session'); return }
    toast.success(editingSession ? 'Session updated' : 'Session logged')
    setShowSessionForm(false)
    setEditingSession(null)
    resetSessionForm()
    fetchData()
  }

  async function deleteSession(id: string) {
    const { error } = await supabase.from('gym_sessions').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Session deleted')
    fetchData()
  }

  async function savePR() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      lift_name: prForm.lift_name,
      weight_kg: parseFloat(prForm.weight_kg) || 0,
      reps: parseInt(prForm.reps) || 1,
      date_achieved: prForm.date_achieved,
      notes: prForm.notes || null,
    }

    let error
    if (editingPR) {
      ({ error } = await supabase.from('personal_records').update(payload).eq('id', editingPR.id))
    } else {
      ({ error } = await supabase.from('personal_records').insert(payload))
    }

    if (error) { toast.error('Failed to save PR'); return }
    toast.success(editingPR ? 'PR updated' : 'PR recorded')
    setShowPRForm(false)
    setEditingPR(null)
    resetPRForm()
    fetchData()
  }

  async function deletePR(id: string) {
    const { error } = await supabase.from('personal_records').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('PR deleted')
    fetchData()
  }

  function openEditSession(s: GymSession) {
    setSessionForm({
      session_date: s.session_date,
      session_type: s.session_type,
      key_lifts: s.key_lifts || '',
      duration_minutes: s.duration_minutes?.toString() || '',
      calories_burned: s.calories_burned?.toString() || '',
      energy_level: s.energy_level,
      notes: s.notes || '',
    })
    setEditingSession(s)
    setShowSessionForm(true)
  }

  function openEditPR(pr: PersonalRecord) {
    setPRForm({
      lift_name: pr.lift_name,
      weight_kg: pr.weight_kg.toString(),
      reps: pr.reps.toString(),
      date_achieved: pr.date_achieved,
      notes: pr.notes || '',
    })
    setEditingPR(pr)
    setShowPRForm(true)
  }

  const energyColor: Record<string, string> = {
    Low: '#d45c5c', Medium: '#d47c3a', High: '#5cb88a', Peak: '#c8a97e'
  }

  const weeklySessions = sessions.filter(s => {
    const d = new Date(s.session_date)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    return d >= weekAgo
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[var(--text-muted)] text-xs tracking-widest">LOADING GYM DATA...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'THIS WEEK', value: weeklySessions.length, unit: 'sessions' },
          { label: 'TOTAL LOGGED', value: sessions.length, unit: 'sessions' },
          { label: 'PERSONAL RECORDS', value: prs.length, unit: 'tracked' },
          {
            label: 'AVG DURATION',
            value: (() => {
              const timed = sessions.filter(s => s.duration_minutes)
              return timed.length
                ? Math.round(timed.reduce((a, s) => a + (s.duration_minutes || 0), 0) / timed.length)
                : 0
            })(),
            unit: 'min'
          },
        ].map(stat => (
          <div key={stat.label} className="os-card text-center">
            <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">{stat.label}</div>
            <div className="text-2xl font-bold text-[var(--accent)] font-['Syne']">{stat.value}</div>
            <div className="text-[9px] text-[var(--text-dim)] mt-1">{stat.unit}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--surface2)] rounded-lg w-fit">
        {(['sessions', 'prs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-[10px] tracking-widest rounded-md transition-all ${
              activeTab === tab
                ? 'bg-[var(--accent)] text-[#0a0a0b] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {tab === 'sessions' ? 'SESSIONS' : 'PERSONAL RECORDS'}
          </button>
        ))}
      </div>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="os-section-title">GYM SESSIONS</h2>
            <button
              onClick={() => { resetSessionForm(); setEditingSession(null); setShowSessionForm(true) }}
              className="os-btn"
            >
              + LOG SESSION
            </button>
          </div>

          {showSessionForm && (
            <div className="os-card border border-[var(--accent)] border-opacity-30 space-y-4">
              <div className="text-[10px] text-[var(--accent)] tracking-widest font-bold">
                {editingSession ? 'EDIT SESSION' : 'LOG NEW SESSION'}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">DATE</label>
                  <input type="date" value={sessionForm.session_date}
                    onChange={e => setSessionForm(p => ({ ...p, session_date: e.target.value }))}
                    className="os-input w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">TYPE</label>
                  <select value={sessionForm.session_type}
                    onChange={e => setSessionForm(p => ({ ...p, session_type: e.target.value }))}
                    className="os-input w-full">
                    {SESSION_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">ENERGY LEVEL</label>
                  <select value={sessionForm.energy_level}
                    onChange={e => setSessionForm(p => ({ ...p, energy_level: e.target.value }))}
                    className="os-input w-full">
                    {ENERGY_LEVELS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">DURATION (MIN)</label>
                  <input type="number" value={sessionForm.duration_minutes}
                    onChange={e => setSessionForm(p => ({ ...p, duration_minutes: e.target.value }))}
                    placeholder="60" className="os-input w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">CALORIES</label>
                  <input type="number" value={sessionForm.calories_burned}
                    onChange={e => setSessionForm(p => ({ ...p, calories_burned: e.target.value }))}
                    placeholder="400" className="os-input w-full" />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">KEY LIFTS</label>
                <input type="text" value={sessionForm.key_lifts}
                  onChange={e => setSessionForm(p => ({ ...p, key_lifts: e.target.value }))}
                  placeholder="e.g. Squat 100kg x5, Bench 80kg x8" className="os-input w-full" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">NOTES</label>
                <textarea value={sessionForm.notes}
                  onChange={e => setSessionForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="How did it feel? Any observations..." rows={2}
                  className="os-input w-full resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={saveSession} className="os-btn">SAVE</button>
                <button onClick={() => { setShowSessionForm(false); setEditingSession(null); resetSessionForm() }}
                  className="os-btn opacity-50">CANCEL</button>
              </div>
            </div>
          )}

          {sessions.length === 0 ? (
            <div className="os-card text-center py-12">
              <div className="text-3xl mb-3">🏋️</div>
              <div className="text-[var(--text-muted)] text-xs">No sessions logged yet</div>
              <div className="text-[var(--text-dim)] text-[10px] mt-1">Log your first workout above</div>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map(session => (
                <div key={session.id} className="os-card group hover:border-[var(--border-bright)] transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[var(--accent)] font-bold text-xs font-['Syne']">
                          {session.session_type.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)]">
                          {formatDate(session.session_date)}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                          style={{
                            color: energyColor[session.energy_level] || '#c8a97e',
                            backgroundColor: (energyColor[session.energy_level] || '#c8a97e') + '20'
                          }}>
                          {session.energy_level.toUpperCase()}
                        </span>
                      </div>
                      {session.key_lifts && (
                        <div className="text-xs text-[var(--text)] mb-1">{session.key_lifts}</div>
                      )}
                      <div className="flex gap-4 text-[9px] text-[var(--text-muted)]">
                        {session.duration_minutes && <span>⏱ {session.duration_minutes}min</span>}
                        {session.calories_burned && <span>🔥 {session.calories_burned}kcal</span>}
                      </div>
                      {session.notes && (
                        <div className="text-[10px] text-[var(--text-dim)] mt-2">{session.notes}</div>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditSession(session)}
                        className="text-[9px] text-[var(--text-muted)] hover:text-[var(--accent)] px-2 py-1 border border-[var(--border)] rounded">
                        EDIT
                      </button>
                      <button onClick={() => deleteSession(session.id)}
                        className="text-[9px] text-[var(--text-muted)] hover:text-[var(--red)] px-2 py-1 border border-[var(--border)] rounded">
                        DEL
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRs Tab */}
      {activeTab === 'prs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="os-section-title">PERSONAL RECORDS</h2>
            <button
              onClick={() => { resetPRForm(); setEditingPR(null); setShowPRForm(true) }}
              className="os-btn"
            >
              + ADD PR
            </button>
          </div>

          {showPRForm && (
            <div className="os-card border border-[var(--accent)] border-opacity-30 space-y-4">
              <div className="text-[10px] text-[var(--accent)] tracking-widest font-bold">
                {editingPR ? 'EDIT PR' : 'LOG PERSONAL RECORD'}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">LIFT NAME</label>
                  <input type="text" value={prForm.lift_name}
                    onChange={e => setPRForm(p => ({ ...p, lift_name: e.target.value }))}
                    placeholder="e.g. Back Squat" className="os-input w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">DATE</label>
                  <input type="date" value={prForm.date_achieved}
                    onChange={e => setPRForm(p => ({ ...p, date_achieved: e.target.value }))}
                    className="os-input w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">WEIGHT (KG)</label>
                  <input type="number" step="0.5" value={prForm.weight_kg}
                    onChange={e => setPRForm(p => ({ ...p, weight_kg: e.target.value }))}
                    placeholder="100" className="os-input w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">REPS</label>
                  <input type="number" value={prForm.reps}
                    onChange={e => setPRForm(p => ({ ...p, reps: e.target.value }))}
                    placeholder="1" className="os-input w-full" />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">NOTES</label>
                <input type="text" value={prForm.notes}
                  onChange={e => setPRForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Context, conditions, etc." className="os-input w-full" />
              </div>
              <div className="flex gap-2">
                <button onClick={savePR} className="os-btn">SAVE PR</button>
                <button onClick={() => { setShowPRForm(false); setEditingPR(null); resetPRForm() }}
                  className="os-btn opacity-50">CANCEL</button>
              </div>
            </div>
          )}

          {prs.length === 0 ? (
            <div className="os-card text-center py-12">
              <div className="text-3xl mb-3">🏆</div>
              <div className="text-[var(--text-muted)] text-xs">No PRs logged yet</div>
              <div className="text-[var(--text-dim)] text-[10px] mt-1">Record your personal bests</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {prs.map(pr => (
                <div key={pr.id} className="os-card group hover:border-[var(--border-bright)] transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[var(--accent)] font-bold text-sm font-['Syne'] mb-1">
                        {pr.lift_name}
                      </div>
                      <div className="text-2xl font-bold text-[var(--text)] mb-1">
                        {pr.weight_kg}kg
                        <span className="text-sm text-[var(--text-muted)] ml-2">× {pr.reps} rep{pr.reps !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="text-[9px] text-[var(--text-muted)]">{formatDate(pr.date_achieved)}</div>
                      {pr.notes && <div className="text-[10px] text-[var(--text-dim)] mt-1">{pr.notes}</div>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditPR(pr)}
                        className="text-[9px] text-[var(--text-muted)] hover:text-[var(--accent)] px-2 py-1 border border-[var(--border)] rounded">
                        EDIT
                      </button>
                      <button onClick={() => deletePR(pr.id)}
                        className="text-[9px] text-[var(--text-muted)] hover:text-[var(--red)] px-2 py-1 border border-[var(--border)] rounded">
                        DEL
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
