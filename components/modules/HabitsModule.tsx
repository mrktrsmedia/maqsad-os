'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today, getWeekDays, getWeekStart, formatDateShort } from '@/lib/dates'
import toast from 'react-hot-toast'

interface Habit {
  id: string
  name: string
  color: string
  target_frequency: string
  is_active: boolean
}

interface HabitCompletion {
  habit_id: string
  completion_date: string
}

const COLORS = [
  '#c8a97e', '#5cb88a', '#5c8fd4', '#9b6fd4',
  '#d4a044', '#d47c3a', '#d45c5c', '#5cd4c8'
]

const FREQUENCIES = ['Daily', '5x/week', '3x/week', 'Weekdays', 'Weekends', 'Weekly']

export default function HabitsModule() {
  const supabase = createClient()
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [weekStart, setWeekStart] = useState(getWeekStart())

  const [form, setForm] = useState({
    name: '',
    color: COLORS[0],
    target_frequency: 'Daily',
  })

  const weekDays = getWeekDays(weekStart)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const weekEnd = weekDays[6]

    const [habitsRes, completionsRes] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at'),
      supabase.from('habit_completions').select('habit_id, completion_date')
        .eq('user_id', user.id)
        .gte('completion_date', weekDays[0])
        .lte('completion_date', weekEnd),
    ])

    if (habitsRes.data) setHabits(habitsRes.data)
    if (completionsRes.data) setCompletions(completionsRes.data)
    setLoading(false)
  }, [supabase, weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData() }, [fetchData])

  function isCompleted(habitId: string, date: string): boolean {
    return completions.some(c => c.habit_id === habitId && c.completion_date === date)
  }

  async function toggleCompletion(habitId: string, date: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isCompleted(habitId, date)) {
      const { error } = await supabase.from('habit_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('habit_id', habitId)
        .eq('completion_date', date)
      if (!error) {
        setCompletions(prev => prev.filter(c => !(c.habit_id === habitId && c.completion_date === date)))
      }
    } else {
      const { error } = await supabase.from('habit_completions')
        .insert({ user_id: user.id, habit_id: habitId, completion_date: date })
      if (!error) {
        setCompletions(prev => [...prev, { habit_id: habitId, completion_date: date }])
      }
    }
  }

  async function saveHabit() {
    if (!form.name.trim()) { toast.error('Habit name required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      name: form.name,
      color: form.color,
      target_frequency: form.target_frequency,
      is_active: true,
    }

    let error
    if (editingHabit) {
      ({ error } = await supabase.from('habits').update(payload).eq('id', editingHabit.id))
    } else {
      ({ error } = await supabase.from('habits').insert(payload))
    }

    if (error) { toast.error('Failed to save habit'); return }
    toast.success(editingHabit ? 'Habit updated' : 'Habit created')
    setShowForm(false)
    setEditingHabit(null)
    setForm({ name: '', color: COLORS[0], target_frequency: 'Daily' })
    fetchData()
  }

  async function archiveHabit(id: string) {
    const { error } = await supabase.from('habits').update({ is_active: false }).eq('id', id)
    if (error) { toast.error('Failed to archive'); return }
    toast.success('Habit archived')
    fetchData()
  }

  function openEdit(habit: Habit) {
    setForm({ name: habit.name, color: habit.color, target_frequency: habit.target_frequency })
    setEditingHabit(habit)
    setShowForm(true)
  }

  function getWeekScore(habitId: string): number {
    const done = weekDays.filter(d => isCompleted(habitId, d)).length
    return Math.round((done / 7) * 100)
  }

  function prevWeek() {
    const d = new Date(weekStart + 'T00:00:00')
    d.setDate(d.getDate() - 7)
    setWeekStart(d.toISOString().split('T')[0])
  }

  function nextWeek() {
    const d = new Date(weekStart + 'T00:00:00')
    d.setDate(d.getDate() + 7)
    const next = d.toISOString().split('T')[0]
    if (next <= today()) setWeekStart(next)
  }

  const totalDone = completions.length
  const maxPossible = habits.length * 7
  const weekPct = maxPossible > 0 ? Math.round((totalDone / maxPossible) * 100) : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[var(--text-muted)] text-xs tracking-widest">LOADING HABITS...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Week Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="os-card text-center">
          <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">HABITS ACTIVE</div>
          <div className="text-2xl font-bold text-[var(--accent)] font-['Syne']">{habits.length}</div>
        </div>
        <div className="os-card text-center">
          <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">COMPLETIONS</div>
          <div className="text-2xl font-bold text-[var(--green)] font-['Syne']">{totalDone}</div>
        </div>
        <div className="os-card text-center">
          <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">WEEK SCORE</div>
          <div className="text-2xl font-bold font-['Syne']" style={{ color: weekPct > 70 ? '#5cb88a' : weekPct > 40 ? '#d4a044' : '#d45c5c' }}>
            {weekPct}%
          </div>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between">
        <button onClick={prevWeek} className="text-[9px] text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-1.5 border border-[var(--border)] rounded">← PREV</button>
        <div className="text-[10px] text-[var(--text-muted)] tracking-widest">
          {formatDateShort(weekDays[0])} - {formatDateShort(weekDays[6])}
        </div>
        <button onClick={nextWeek} className="text-[9px] text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-1.5 border border-[var(--border)] rounded">NEXT →</button>
      </div>

      {/* Habit Grid */}
      <div className="os-card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] text-[var(--text-muted)] tracking-widest">HABIT TRACKER</div>
          <button onClick={() => { setEditingHabit(null); setForm({ name: '', color: COLORS[0], target_frequency: 'Daily' }); setShowForm(true) }}
            className="os-btn text-[9px]">+ NEW HABIT</button>
        </div>

        {showForm && (
          <div className="border border-[var(--accent)] border-opacity-30 rounded-lg p-4 mb-4 space-y-3">
            <div className="text-[10px] text-[var(--accent)] tracking-widest font-bold">
              {editingHabit ? 'EDIT HABIT' : 'CREATE HABIT'}
            </div>
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">NAME</label>
              <input type="text" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Morning workout, Read 30 min..." className="os-input w-full" />
            </div>
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">FREQUENCY</label>
              <select value={form.target_frequency}
                onChange={e => setForm(p => ({ ...p, target_frequency: e.target.value }))}
                className="os-input w-full">
                {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-2">COLOR</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveHabit} className="os-btn">SAVE</button>
              <button onClick={() => { setShowForm(false); setEditingHabit(null) }} className="os-btn opacity-50">CANCEL</button>
            </div>
          </div>
        )}

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">✅</div>
            <div className="text-[var(--text-muted)] text-xs">No habits created yet</div>
            <div className="text-[var(--text-dim)] text-[10px] mt-1">Create your first habit above</div>
          </div>
        ) : (
          <div className="min-w-max">
            {/* Header */}
            <div className="flex items-center mb-2">
              <div className="w-40 text-[9px] text-[var(--text-muted)] tracking-widest">HABIT</div>
              {weekDays.map(day => (
                <div key={day} className={`w-10 text-center text-[8px] tracking-widest ${day === today() ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                  <div>{new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 2)}</div>
                  <div className="font-bold">{new Date(day + 'T00:00:00').getDate()}</div>
                </div>
              ))}
              <div className="w-16 text-center text-[9px] text-[var(--text-muted)] tracking-widest">SCORE</div>
              <div className="w-16 text-[9px] text-[var(--text-muted)] tracking-widest">ACTIONS</div>
            </div>

            {/* Habit Rows */}
            {habits.map(habit => {
              const score = getWeekScore(habit.id)
              return (
                <div key={habit.id} className="flex items-center py-2 border-t border-[var(--border)] group">
                  <div className="w-40 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                    <span className="text-xs text-[var(--text)] truncate">{habit.name}</span>
                  </div>
                  {weekDays.map(day => {
                    const done = isCompleted(habit.id, day)
                    const isFutureDay = day > today()
                    return (
                      <div key={day} className="w-10 flex justify-center">
                        <button
                          onClick={() => !isFutureDay && toggleCompletion(habit.id, day)}
                          disabled={isFutureDay}
                          className={`w-6 h-6 rounded border transition-all ${
                            done
                              ? 'border-transparent'
                              : day === today()
                              ? 'border-[var(--border-bright)] hover:border-[var(--accent)]'
                              : 'border-[var(--border)] opacity-50'
                          } ${isFutureDay ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          style={done ? { backgroundColor: habit.color + '30', borderColor: habit.color } : {}}
                          title={done ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {done && (
                            <span className="text-[10px] font-bold" style={{ color: habit.color }}>✓</span>
                          )}
                        </button>
                      </div>
                    )
                  })}
                  <div className="w-16 text-center">
                    <span className={`text-[10px] font-bold ${score > 70 ? 'text-[var(--green)]' : score > 40 ? 'text-[var(--warn)]' : 'text-[var(--red)]'}`}>
                      {score}%
                    </span>
                  </div>
                  <div className="w-16 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(habit)}
                      className="text-[8px] text-[var(--text-muted)] hover:text-[var(--accent)] px-1.5 py-0.5 border border-[var(--border)] rounded">
                      EDIT
                    </button>
                    <button onClick={() => archiveHabit(habit.id)}
                      className="text-[8px] text-[var(--text-muted)] hover:text-[var(--red)] px-1.5 py-0.5 border border-[var(--border)] rounded">
                      DEL
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
