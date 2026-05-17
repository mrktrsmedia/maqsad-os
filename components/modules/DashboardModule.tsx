'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { DailyLog, Prayer, Habit, HabitCompletion, QuickLog } from '@/types/database.types'

// Native date helpers (ISO date string → display)
function toDate(s: string) { return new Date(s + 'T00:00:00') }
function fmtEEE(s: string) { return toDate(s).toLocaleDateString('en-US', { weekday: 'short' }) }
function fmtD(s: string) { return toDate(s).getDate().toString() }
function fmtHHmm(d: Date) { return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) }

interface Props {
  userId: string
  weekDays: string[]
  dailyLogs: DailyLog[]
  todayPrayers: Prayer | null
  habits: Habit[]
  habitCompletions: HabitCompletion[]
  quickLogs: QuickLog[]
  todayStr: string
}

const PILLAR_COLORS: Record<string, string> = {
  Spirituality:   '#c8a97e',
  'Body & Fitness':'#5cb88a',
  Outreach:       '#5c8fd4',
  Learning:       '#9b6fd4',
  Finance:        '#d4a044',
}

export default function DashboardModule({
  userId, weekDays, dailyLogs, todayPrayers: initPrayers,
  habits, habitCompletions: initCompletions, quickLogs: initLogs, todayStr
}: Props) {
  const supabase = createClient()

  const [prayers, setPrayers]       = useState<Prayer | null>(initPrayers)
  const [completions, setCompletions] = useState<HabitCompletion[]>(initCompletions)
  const [logs, setLogs]             = useState<QuickLog[]>(initLogs)
  const [quickInput, setQuickInput] = useState('')
  const [selectedDay, setSelectedDay] = useState(todayStr)
  const [pillars, setPillars]       = useState([
    { label: 'Spirituality', val: 60 },
    { label: 'Body & Fitness', val: 80 },
    { label: 'Outreach', val: 40 },
    { label: 'Learning', val: 70 },
    { label: 'Finance', val: 55 },
  ])

  const logMap = Object.fromEntries(
    dailyLogs.map(l => [l.log_date, l])
  )

  const scoredLogs = dailyLogs.filter(l => l.day_score != null && l.day_score > 0)
  const weekAvg = scoredLogs.length
    ? Math.round(scoredLogs.reduce((s, l) => s + (l.day_score ?? 0), 0) / scoredLogs.length)
    : 0

  const todayLog = logMap[todayStr]
  const prayerCount = prayers
    ? [prayers.fajr, prayers.dhuhr, prayers.asr, prayers.maghrib, prayers.isha].filter(Boolean).length
    : 0

  async function togglePrayer(key: keyof Prayer) {
    if (!prayers) {
      // Create new prayer record
      const { data, error } = await supabase
        .from('prayers')
        .insert({ user_id: userId, prayer_date: todayStr, [key]: true })
        .select().single()
      if (!error && data) setPrayers(data as Prayer)
      return
    }
    const newVal = !prayers[key]
    const { error } = await supabase.from('prayers')
      .upsert({ ...prayers, [key]: newVal, updated_at: new Date().toISOString() })
    if (!error) setPrayers({ ...prayers, [key]: newVal as boolean })
  }

  async function toggleHabit(habitId: string, date: string) {
    const existing = completions.find(c => c.habit_id === habitId && c.completion_date === date)
    if (existing) {
      await supabase.from('habit_completions').delete().eq('id', existing.id)
      setCompletions(completions.filter(c => c.id !== existing.id))
    } else {
      const { data, error } = await supabase.from('habit_completions')
        .insert({ user_id: userId, habit_id: habitId, completion_date: date })
        .select().single()
      if (!error && data) setCompletions([...completions, data as HabitCompletion])
    }
  }

  async function addQuickLog() {
    if (!quickInput.trim()) return
    const { data, error } = await supabase.from('quick_logs')
      .insert({ user_id: userId, log_date: todayStr, content: quickInput.trim(), category: 'general' })
      .select().single()
    if (error) { toast.error('Failed to save log'); return }
    if (data) setLogs([data as QuickLog, ...logs])
    setQuickInput('')
    toast.success('Logged.')
  }

  const PRAYER_KEYS: Array<{ key: keyof Prayer; label: string; icon: string }> = [
    { key: 'fajr',    label: 'Fajr',    icon: '☀' },
    { key: 'dhuhr',   label: 'Dhuhr',   icon: '🌤' },
    { key: 'asr',     label: 'Asr',     icon: '⛅' },
    { key: 'maghrib', label: 'Maghrib', icon: '🌆' },
    { key: 'isha',    label: 'Isha',    icon: '🌙' },
  ]

  return (
    <div>
      {/* Week Strip */}
      <div className="grid grid-cols-7 gap-2 mb-5">
        {weekDays.map(day => {
          const dStr = day
          const log = logMap[dStr]
          const isToday = dStr === todayStr
          const isSelected = dStr === selectedDay
          return (
            <button
              key={dStr}
              onClick={() => setSelectedDay(dStr)}
              className={`rounded-sm border p-3 text-center transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-os-accent-dim bg-os-accent-glow'
                  : 'border-os-border bg-os-surface2 hover:border-os-border-bright'
              }`}
            >
              <div className="text-[8px] text-os-text-dim tracking-widest uppercase">
                {fmtEEE(day)}
              </div>
              <div className="font-syne text-xl font-extrabold text-os-text my-1">
                {fmtD(day)}
              </div>
              <div className="text-[9px]" style={{
                color: log?.day_score
                  ? log.day_score >= 80 ? '#5cb88a' : log.day_score >= 60 ? '#d47c3a' : '#d45c5c'
                  : '#3a3845'
              }}>
                {log?.day_score ?? (isToday ? '-' : '·')}
              </div>
            </button>
          )
        })}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="os-card">
          <div className="flex items-center justify-between mb-3">
            <span className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-os-text-muted">Day Score</span>
            <span>⬡</span>
          </div>
          <div className="os-stat">{todayLog?.day_score ?? '-'}</div>
          <div className="os-stat-label">Today's execution</div>
          <div className="text-[9px] mt-1 text-os-green">↑ avg {weekAvg} this week</div>
        </div>
        <div className="os-card">
          <div className="flex items-center justify-between mb-3">
            <span className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-os-text-muted">Prayers</span>
            <span>✦</span>
          </div>
          <div className="os-stat" style={{ color: prayerCount === 5 ? '#5cb88a' : '#c8a97e' }}>
            {prayerCount}/5
          </div>
          <div className="os-stat-label">today's prayers</div>
        </div>
        <div className="os-card">
          <div className="flex items-center justify-between mb-3">
            <span className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-os-text-muted">Habits Done</span>
            <span>◆</span>
          </div>
          <div className="os-stat" style={{ color: '#5cb88a' }}>
            {completions.filter(c => c.completion_date === todayStr).length}/{habits.length}
          </div>
          <div className="os-stat-label">habits completed</div>
        </div>
        <div className="os-card">
          <div className="flex items-center justify-between mb-3">
            <span className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-os-text-muted">Week Avg</span>
            <span>◉</span>
          </div>
          <div className="os-stat" style={{ color: '#5c8fd4' }}>{weekAvg || '-'}</div>
          <div className="os-stat-label">completion score</div>
        </div>
      </div>

      {/* Prayer Tracker + Life Pillars */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="os-card">
          <div className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-os-text-muted mb-3">
            Today's Prayers
          </div>
          <div className="flex justify-between gap-1.5">
            {PRAYER_KEYS.map(({ key, label, icon }) => {
              const done = prayers?.[key] as boolean | undefined
              return (
                <button
                  key={key}
                  onClick={() => togglePrayer(key)}
                  className={`flex-1 text-center py-2 px-1 rounded-sm border text-[8px] tracking-wide cursor-pointer transition-all ${
                    done
                      ? 'bg-os-accent-glow border-os-accent-dim text-os-accent'
                      : 'border-os-border text-os-text-muted hover:border-os-border-bright'
                  }`}
                >
                  <span className="text-xs block mb-1">{icon}</span>
                  {label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="os-card">
          <div className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-os-text-muted mb-3">
            Life Pillars
          </div>
          {pillars.map(p => (
            <div key={p.label} className="mb-2.5">
              <div className="flex justify-between text-[10px] text-os-text-muted mb-1">
                <span>{p.label}</span>
                <span className="text-os-text">{p.val}%</span>
              </div>
              <div className="os-progress-track">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${p.val}%`, background: PILLAR_COLORS[p.label] ?? '#c8a97e' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Log */}
      <div className="os-section-title">Quick Log</div>
      <div className="os-card mb-4">
        <div className="flex gap-2 mb-3">
          <input
            className="os-input flex-1"
            placeholder="Log something - gym session, meal, win, note..."
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addQuickLog()}
          />
          <button onClick={addQuickLog} className="os-btn os-btn-accent os-btn-sm whitespace-nowrap">
            Log
          </button>
        </div>
        <div className="space-y-1">
          {logs.map(log => (
            <div key={log.id} className="border-l-2 border-os-border hover:border-os-accent-dim pl-3 py-1.5 transition-colors">
              <div className="text-[8px] text-os-text-dim">
                {fmtHHmm(new Date(log.logged_at))}
              </div>
              <div className="text-[11px] text-os-text-muted mt-0.5">{log.content}</div>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-[10px] text-os-text-dim py-2">No logs yet today. Start tracking.</p>
          )}
        </div>
      </div>

      {/* Habits */}
      {habits.length > 0 && (
        <>
          <div className="os-section-title">Habits Today</div>
          <div className="os-card">
            {habits.map(habit => {
              const done = completions.some(
                c => c.habit_id === habit.id && c.completion_date === selectedDay
              )
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id, selectedDay)}
                  className={`flex items-center gap-2.5 py-2.5 border-b border-os-border last:border-0 cursor-pointer transition-colors ${done ? 'opacity-70' : ''}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all ${
                    done ? '' : 'border-os-border-bright'
                  }`} style={done ? { background: habit.color, borderColor: habit.color } : {}}>
                    {done && <span className="text-[8px] text-black">✓</span>}
                  </div>
                  <span className={`text-[11px] ${done ? 'line-through text-os-text-dim' : 'text-os-text-muted'}`}>
                    {habit.name}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
