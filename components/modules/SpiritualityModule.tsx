'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today, getWeekDays, getWeekStart, formatDateShort, formatDate } from '@/lib/dates'
import toast from 'react-hot-toast'

interface Prayer {
  id?: string
  prayer_date: string
  fajr: boolean
  dhuhr: boolean
  asr: boolean
  maghrib: boolean
  isha: boolean
}

interface ReflectionLog {
  id: string
  log_date: string
  topic: string
  pages_read: number | null
  notes: string | null
  resource: string | null
}

const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
type PrayerName = typeof PRAYER_NAMES[number]

const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'FAJR', dhuhr: 'DHUHR', asr: 'ASR', maghrib: 'MAGHRIB', isha: 'ISHA'
}

const PRAYER_TIMES: Record<PrayerName, string> = {
  fajr: 'Pre-dawn', dhuhr: 'Midday', asr: 'Afternoon', maghrib: 'Sunset', isha: 'Night'
}

export default function SpiritualityModule() {
  const supabase = createClient()
  const [prayers, setPrayers] = useState<Record<string, Prayer>>({})
  const [reflections, setReflections] = useState<ReflectionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(today())
  const [showForm, setShowForm] = useState(false)
  const [editingRef, setEditingRef] = useState<ReflectionLog | null>(null)
  const weekDays = getWeekDays(getWeekStart())

  const [form, setForm] = useState({
    topic: '',
    resource: '',
    pages_read: '',
    notes: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const weekStart = weekDays[0]
    const weekEnd = weekDays[6]

    const [prayersRes, reflRes] = await Promise.all([
      supabase.from('prayers').select('*').eq('user_id', user.id).gte('prayer_date', weekStart).lte('prayer_date', weekEnd),
      supabase.from('learning_logs').select('*').eq('user_id', user.id)
        .gte('log_date', weekStart)
        .order('log_date', { ascending: false }),
    ])

    if (prayersRes.data) {
      const map: Record<string, Prayer> = {}
      prayersRes.data.forEach(p => { map[p.prayer_date] = p })
      setPrayers(map)
    }
    if (reflRes.data) setReflections(reflRes.data.filter(l => l.resource?.toLowerCase().includes('quran') || l.topic?.toLowerCase().includes('quran') || l.topic?.toLowerCase().includes('islamic') || l.topic?.toLowerCase().includes('dua') || l.topic?.toLowerCase().includes('reflect')))
    setLoading(false)
  }, [supabase, weekDays[0]]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData() }, [fetchData])

  async function togglePrayer(date: string, prayer: PrayerName) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const current = prayers[date] || { prayer_date: date, fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }
    const updated = { ...current, [prayer]: !current[prayer] }

    const payload = {
      user_id: user.id,
      prayer_date: date,
      fajr: updated.fajr,
      dhuhr: updated.dhuhr,
      asr: updated.asr,
      maghrib: updated.maghrib,
      isha: updated.isha,
    }

    const { error } = await supabase.from('prayers').upsert(payload, { onConflict: 'user_id,prayer_date' })
    if (!error) {
      setPrayers(prev => ({ ...prev, [date]: { ...updated, id: prev[date]?.id } }))
    }
  }

  function getPrayerCount(date: string): number {
    const p = prayers[date]
    if (!p) return 0
    return [p.fajr, p.dhuhr, p.asr, p.maghrib, p.isha].filter(Boolean).length
  }

  const weekPrayerTotal = weekDays.reduce((acc, d) => acc + getPrayerCount(d), 0)
  const weekFajrTotal = weekDays.filter(d => prayers[d]?.fajr).length

  const resetForm = () => setForm({ topic: '', resource: '', pages_read: '', notes: '' })

  async function saveReflection() {
    if (!form.topic.trim()) { toast.error('Topic required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      log_date: selectedDate,
      topic: form.topic,
      resource: form.resource || null,
      pages_read: form.pages_read ? parseInt(form.pages_read) : null,
      minutes: null,
      notes: form.notes || null,
    }

    let error
    if (editingRef) {
      ({ error } = await supabase.from('learning_logs').update(payload).eq('id', editingRef.id))
    } else {
      ({ error } = await supabase.from('learning_logs').insert(payload))
    }

    if (error) { toast.error('Failed to save'); return }
    toast.success(editingRef ? 'Updated' : 'Reflection logged')
    setShowForm(false)
    setEditingRef(null)
    resetForm()
    fetchData()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[var(--text-muted)] text-xs tracking-widest">LOADING...</div>
    </div>
  )

  const currentPrayers = prayers[selectedDate] || { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }
  const currentCount = getPrayerCount(selectedDate)

  return (
    <div className="space-y-6">
      {/* Week Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="os-card text-center">
          <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">WEEK PRAYERS</div>
          <div className="text-2xl font-bold text-[var(--accent)] font-['Syne']">{weekPrayerTotal}</div>
          <div className="text-[9px] text-[var(--text-dim)]">of 35</div>
        </div>
        <div className="os-card text-center">
          <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">FAJR STREAK</div>
          <div className="text-2xl font-bold font-['Syne']" style={{ color: weekFajrTotal >= 5 ? '#5cb88a' : '#d47c3a' }}>
            {weekFajrTotal}/7
          </div>
          <div className="text-[9px] text-[var(--text-dim)]">this week</div>
        </div>
        <div className="os-card text-center">
          <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">TODAY</div>
          <div className={`text-2xl font-bold font-['Syne'] ${currentCount === 5 ? 'text-[var(--green)]' : currentCount >= 3 ? 'text-[var(--warn)]' : 'text-[var(--red)]'}`}>
            {currentCount}/5
          </div>
          <div className="text-[9px] text-[var(--text-dim)]">prayers</div>
        </div>
      </div>

      {/* Week heatmap */}
      <div className="os-card">
        <div className="text-[10px] text-[var(--text-muted)] tracking-widest mb-4">WEEK AT A GLANCE</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weekDays.map(day => {
            const count = getPrayerCount(day)
            const isSelected = day === selectedDate
            return (
              <button key={day} onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg border transition-all min-w-[52px] ${
                  isSelected ? 'border-[var(--accent)] bg-[var(--accent-glow)]' : 'border-[var(--border)] hover:border-[var(--border-bright)]'
                }`}>
                <div className={`text-[9px] tracking-widest ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                  {new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 2)}
                </div>
                <div className={`text-sm font-bold my-1 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                  {new Date(day + 'T00:00:00').getDate()}
                </div>
                <div className={`text-xs font-bold ${count === 5 ? 'text-[var(--green)]' : count >= 3 ? 'text-[var(--warn)]' : count > 0 ? 'text-[var(--red)]' : 'text-[var(--text-dim)]'}`}>
                  {count > 0 ? `${count}/5` : '-'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Prayer Tracker for selected day */}
      <div className="os-card">
        <div className="text-[10px] text-[var(--text-muted)] tracking-widest mb-4">
          PRAYERS - {formatDate(selectedDate)}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {PRAYER_NAMES.map(prayer => {
            const done = currentPrayers[prayer] || false
            return (
              <button
                key={prayer}
                onClick={() => togglePrayer(selectedDate, prayer)}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                  done
                    ? 'border-[var(--accent)] bg-[var(--accent-glow)]'
                    : 'border-[var(--border)] hover:border-[var(--border-bright)]'
                }`}
              >
                <div className={`text-lg mb-1 ${done ? '' : 'opacity-30'}`}>
                  {prayer === 'fajr' ? '🌙' : prayer === 'dhuhr' ? '☀️' : prayer === 'asr' ? '🌤' : prayer === 'maghrib' ? '🌅' : '🌃'}
                </div>
                <div className={`text-[9px] tracking-widest font-bold ${done ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                  {PRAYER_LABELS[prayer]}
                </div>
                <div className="text-[8px] text-[var(--text-dim)] mt-0.5">{PRAYER_TIMES[prayer]}</div>
                {done && <div className="text-[var(--green)] text-xs mt-1">✓</div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Quran & Reflections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="os-section-title">QURAN & REFLECTIONS</h2>
          <button onClick={() => { resetForm(); setEditingRef(null); setShowForm(true) }} className="os-btn">
            + ADD REFLECTION
          </button>
        </div>

        {showForm && (
          <div className="os-card border border-[var(--accent)] border-opacity-30 space-y-4">
            <div className="text-[10px] text-[var(--accent)] tracking-widest font-bold">LOG REFLECTION</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">TOPIC</label>
                <input type="text" value={form.topic}
                  onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
                  placeholder="e.g. Quran recitation, Dua, Reflection, Islamic study..." className="os-input w-full" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">RESOURCE / SURAH</label>
                <input type="text" value={form.resource}
                  onChange={e => setForm(p => ({ ...p, resource: e.target.value }))}
                  placeholder="Surah Al-Baqarah, Book title..." className="os-input w-full" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">PAGES / AYAHS</label>
                <input type="number" value={form.pages_read}
                  onChange={e => setForm(p => ({ ...p, pages_read: e.target.value }))}
                  placeholder="5" className="os-input w-full" />
              </div>
              <div className="col-span-2">
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">NOTES</label>
                <textarea value={form.notes} rows={2}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Key insights, duas made, reflections..." className="os-input w-full resize-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveReflection} className="os-btn">SAVE</button>
              <button onClick={() => { setShowForm(false); setEditingRef(null); resetForm() }}
                className="os-btn opacity-50">CANCEL</button>
            </div>
          </div>
        )}

        {reflections.length === 0 ? (
          <div className="os-card text-center py-10">
            <div className="text-3xl mb-3">🕌</div>
            <div className="text-[var(--text-muted)] text-xs">No reflections logged yet</div>
          </div>
        ) : (
          <div className="space-y-2">
            {reflections.map(ref => (
              <div key={ref.id} className="os-card group hover:border-[var(--border-bright)] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-xs text-[var(--accent)] mb-1">{ref.topic}</div>
                    {ref.resource && <div className="text-[10px] text-[var(--text-muted)] mb-1">📖 {ref.resource}</div>}
                    {ref.pages_read && <div className="text-[9px] text-[var(--text-dim)]">{ref.pages_read} pages/ayahs</div>}
                    {ref.notes && <div className="text-[10px] text-[var(--text-dim)] mt-2 italic font-['Fraunces']">{ref.notes}</div>}
                    <div className="text-[8px] text-[var(--text-dim)] mt-1">{formatDate(ref.log_date)}</div>
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
