'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today, formatDate, getPast7Days, formatDateShort } from '@/lib/dates'
import toast from 'react-hot-toast'

interface LearningLog {
  id: string
  log_date: string
  topic: string
  resource: string | null
  minutes: number | null
  pages_read: number | null
  notes: string | null
}

export default function LearningModule() {
  const supabase = createClient()
  const [logs, setLogs] = useState<LearningLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(today())
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<LearningLog | null>(null)

  const [form, setForm] = useState({
    topic: '',
    resource: '',
    minutes: '',
    pages_read: '',
    notes: '',
  })

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('learning_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', getPast7Days()[0])
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) setLogs(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const resetForm = () => setForm({ topic: '', resource: '', minutes: '', pages_read: '', notes: '' })

  async function saveLog() {
    if (!form.topic.trim()) { toast.error('Topic required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      log_date: selectedDate,
      topic: form.topic,
      resource: form.resource || null,
      minutes: form.minutes ? parseInt(form.minutes) : null,
      pages_read: form.pages_read ? parseInt(form.pages_read) : null,
      notes: form.notes || null,
    }

    let error
    if (editingLog) {
      ({ error } = await supabase.from('learning_logs').update(payload).eq('id', editingLog.id))
    } else {
      ({ error } = await supabase.from('learning_logs').insert(payload))
    }

    if (error) { toast.error('Failed to save'); return }
    toast.success(editingLog ? 'Entry updated' : 'Learning logged')
    setShowForm(false)
    setEditingLog(null)
    resetForm()
    fetchLogs()
  }

  async function deleteLog(id: string) {
    const { error } = await supabase.from('learning_logs').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Entry deleted')
    fetchLogs()
  }

  function openEdit(log: LearningLog) {
    setForm({
      topic: log.topic,
      resource: log.resource || '',
      minutes: log.minutes?.toString() || '',
      pages_read: log.pages_read?.toString() || '',
      notes: log.notes || '',
    })
    setEditingLog(log)
    setShowForm(true)
  }

  const weekDays = getPast7Days()
  const todayLogs = logs.filter(l => l.log_date === selectedDate)

  const weekTotals = logs.reduce((acc, l) => ({
    minutes: acc.minutes + (l.minutes || 0),
    pages: acc.pages + (l.pages_read || 0),
    sessions: acc.sessions + 1,
  }), { minutes: 0, pages: 0, sessions: 0 })

  const todayTotals = todayLogs.reduce((acc, l) => ({
    minutes: acc.minutes + (l.minutes || 0),
    pages: acc.pages + (l.pages_read || 0),
  }), { minutes: 0, pages: 0 })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[var(--text-muted)] text-xs tracking-widest">LOADING LEARNING DATA...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Week Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'WEEK MINUTES', value: weekTotals.minutes, unit: 'min', color: 'var(--accent)' },
          { label: 'PAGES READ', value: weekTotals.pages, unit: 'pages', color: 'var(--blue)' },
          { label: 'SESSIONS', value: weekTotals.sessions, unit: 'logs', color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} className="os-card text-center">
            <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">{s.label}</div>
            <div className="text-2xl font-bold font-['Syne']" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[9px] text-[var(--text-dim)] mt-1">{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Date selector */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weekDays.map(day => {
          const dayLogs = logs.filter(l => l.log_date === day)
          const dayMins = dayLogs.reduce((a, l) => a + (l.minutes || 0), 0)
          const isSelected = day === selectedDate
          return (
            <button key={day} onClick={() => setSelectedDate(day)}
              className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg border transition-all min-w-[52px] ${
                isSelected ? 'border-[var(--accent)] bg-[var(--accent-glow)]' : 'border-[var(--border)] hover:border-[var(--border-bright)]'
              }`}>
              <div className={`text-[9px] tracking-widest ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                {new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 2)}
              </div>
              <div className={`text-sm font-bold ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                {new Date(day + 'T00:00:00').getDate()}
              </div>
              <div className={`text-[8px] ${dayMins > 0 ? 'text-[var(--green)]' : 'text-[var(--text-dim)]'}`}>
                {dayMins > 0 ? `${dayMins}m` : '-'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Today header */}
      {(todayTotals.minutes > 0 || todayTotals.pages > 0) && (
        <div className="os-card flex gap-6 flex-wrap">
          <div>
            <span className="text-[9px] text-[var(--text-muted)] tracking-widest">TODAY </span>
            <span className="text-[var(--accent)] font-bold">{todayTotals.minutes} min</span>
          </div>
          <div>
            <span className="text-[9px] text-[var(--text-muted)] tracking-widest">PAGES </span>
            <span className="text-[var(--blue)] font-bold">{todayTotals.pages}</span>
          </div>
          <div>
            <span className="text-[9px] text-[var(--text-muted)] tracking-widest">SESSIONS </span>
            <span className="text-[var(--green)] font-bold">{todayLogs.length}</span>
          </div>
        </div>
      )}

      {/* Log section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="os-section-title">LOG - {formatDate(selectedDate)}</h2>
          <button onClick={() => { resetForm(); setEditingLog(null); setShowForm(true) }} className="os-btn">
            + LOG LEARNING
          </button>
        </div>

        {showForm && (
          <div className="os-card border border-[var(--accent)] border-opacity-30 space-y-4">
            <div className="text-[10px] text-[var(--accent)] tracking-widest font-bold">
              {editingLog ? 'EDIT ENTRY' : 'LOG LEARNING SESSION'}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">TOPIC *</label>
                <input type="text" value={form.topic}
                  onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
                  placeholder="e.g. React hooks, Sales psychology, Quran tafsir..." className="os-input w-full" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">RESOURCE / SOURCE</label>
                <input type="text" value={form.resource}
                  onChange={e => setForm(p => ({ ...p, resource: e.target.value }))}
                  placeholder="Book, course, podcast, video..." className="os-input w-full" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">MINUTES STUDIED</label>
                <input type="number" value={form.minutes}
                  onChange={e => setForm(p => ({ ...p, minutes: e.target.value }))}
                  placeholder="30" className="os-input w-full" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">PAGES READ</label>
                <input type="number" value={form.pages_read}
                  onChange={e => setForm(p => ({ ...p, pages_read: e.target.value }))}
                  placeholder="20" className="os-input w-full" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">NOTES / KEY TAKEAWAY</label>
                <input type="text" value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="What did you learn?" className="os-input w-full" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveLog} className="os-btn">SAVE</button>
              <button onClick={() => { setShowForm(false); setEditingLog(null); resetForm() }}
                className="os-btn opacity-50">CANCEL</button>
            </div>
          </div>
        )}

        {todayLogs.length === 0 ? (
          <div className="os-card text-center py-12">
            <div className="text-3xl mb-3">📚</div>
            <div className="text-[var(--text-muted)] text-xs">No learning logged for {formatDate(selectedDate)}</div>
          </div>
        ) : (
          <div className="space-y-2">
            {todayLogs.map(log => (
              <div key={log.id} className="os-card group hover:border-[var(--border-bright)] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-xs text-[var(--accent)] mb-1">{log.topic}</div>
                    {log.resource && (
                      <div className="text-[10px] text-[var(--text-muted)] mb-1">📖 {log.resource}</div>
                    )}
                    <div className="flex gap-4 text-[9px] text-[var(--text-dim)]">
                      {log.minutes && <span>⏱ {log.minutes} min</span>}
                      {log.pages_read && <span>📄 {log.pages_read} pages</span>}
                    </div>
                    {log.notes && <div className="text-[10px] text-[var(--text-dim)] mt-2 italic">{log.notes}</div>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(log)}
                      className="text-[9px] text-[var(--text-muted)] hover:text-[var(--accent)] px-2 py-1 border border-[var(--border)] rounded">EDIT</button>
                    <button onClick={() => deleteLog(log.id)}
                      className="text-[9px] text-[var(--text-muted)] hover:text-[var(--red)] px-2 py-1 border border-[var(--border)] rounded">DEL</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
