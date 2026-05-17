'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today, formatDate, getPast7Days, formatDateShort } from '@/lib/dates'
import toast from 'react-hot-toast'

interface DietLog {
  id: string
  log_date: string
  meal_name: string
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  water_liters: number | null
  notes: string | null
}

interface DayTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
}

export default function DietModule() {
  const supabase = createClient()
  const [logs, setLogs] = useState<DietLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(today())
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<DietLog | null>(null)
  const [calorieGoal, setCalorieGoal] = useState(2500)
  const [proteinGoal, setProteinGoal] = useState(180)

  const [form, setForm] = useState({
    meal_name: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    water_liters: '',
    notes: '',
  })

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const sevenDaysAgo = getPast7Days()[0]
    const { data } = await supabase
      .from('diet_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', sevenDaysAgo)
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: true })

    if (data) setLogs(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const resetForm = () => setForm({
    meal_name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '', water_liters: '', notes: '',
  })

  async function saveLog() {
    if (!form.meal_name.trim()) { toast.error('Meal name required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      log_date: selectedDate,
      meal_name: form.meal_name,
      calories: form.calories ? parseInt(form.calories) : null,
      protein_g: form.protein_g ? parseFloat(form.protein_g) : null,
      carbs_g: form.carbs_g ? parseFloat(form.carbs_g) : null,
      fat_g: form.fat_g ? parseFloat(form.fat_g) : null,
      water_liters: form.water_liters ? parseFloat(form.water_liters) : null,
      notes: form.notes || null,
    }

    let error
    if (editingLog) {
      ({ error } = await supabase.from('diet_logs').update(payload).eq('id', editingLog.id))
    } else {
      ({ error } = await supabase.from('diet_logs').insert(payload))
    }

    if (error) { toast.error('Failed to save'); return }
    toast.success(editingLog ? 'Entry updated' : 'Meal logged')
    setShowForm(false)
    setEditingLog(null)
    resetForm()
    fetchLogs()
  }

  async function deleteLog(id: string) {
    const { error } = await supabase.from('diet_logs').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Entry deleted')
    fetchLogs()
  }

  function openEdit(log: DietLog) {
    setForm({
      meal_name: log.meal_name,
      calories: log.calories?.toString() || '',
      protein_g: log.protein_g?.toString() || '',
      carbs_g: log.carbs_g?.toString() || '',
      fat_g: log.fat_g?.toString() || '',
      water_liters: log.water_liters?.toString() || '',
      notes: log.notes || '',
    })
    setEditingLog(log)
    setShowForm(true)
  }

  const todayLogs = logs.filter(l => l.log_date === selectedDate)

  const todayTotals: DayTotals = todayLogs.reduce((acc, log) => ({
    calories: acc.calories + (log.calories || 0),
    protein: acc.protein + (log.protein_g || 0),
    carbs: acc.carbs + (log.carbs_g || 0),
    fat: acc.fat + (log.fat_g || 0),
    water: acc.water + (log.water_liters || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 })

  const weekDays = getPast7Days()
  const calPct = Math.min(100, Math.round((todayTotals.calories / calorieGoal) * 100))
  const proteinPct = Math.min(100, Math.round((todayTotals.protein / proteinGoal) * 100))

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[var(--text-muted)] text-xs tracking-widest">LOADING NUTRITION DATA...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Date selector strip */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weekDays.map(day => {
          const dayLogs = logs.filter(l => l.log_date === day)
          const dayCals = dayLogs.reduce((a, l) => a + (l.calories || 0), 0)
          const isSelected = day === selectedDate
          return (
            <button
              key={day}
              onClick={() => setSelectedDate(day)}
              className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg border transition-all min-w-[52px] ${
                isSelected
                  ? 'border-[var(--accent)] bg-[var(--accent-glow)]'
                  : 'border-[var(--border)] hover:border-[var(--border-bright)]'
              }`}
            >
              <div className={`text-[9px] tracking-widest ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                {formatDateShort(day).split(' ')[0].toUpperCase()}
              </div>
              <div className={`text-sm font-bold ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                {new Date(day + 'T00:00:00').getDate()}
              </div>
              <div className={`text-[8px] ${dayCals > 0 ? 'text-[var(--green)]' : 'text-[var(--text-dim)]'}`}>
                {dayCals > 0 ? `${dayCals}` : '-'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Today's Totals */}
      <div className="os-card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] text-[var(--text-muted)] tracking-widest">DAILY TOTALS - {formatDate(selectedDate)}</div>
          <div className="flex gap-2 text-[9px] text-[var(--text-dim)]">
            <span>Goal: {calorieGoal}kcal / {proteinGoal}g protein</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {[
            { label: 'CALORIES', value: todayTotals.calories, unit: 'kcal', color: '#c8a97e' },
            { label: 'PROTEIN', value: Math.round(todayTotals.protein), unit: 'g', color: '#5c8fd4' },
            { label: 'CARBS', value: Math.round(todayTotals.carbs), unit: 'g', color: '#d4a044' },
            { label: 'FAT', value: Math.round(todayTotals.fat), unit: 'g', color: '#d47c3a' },
            { label: 'WATER', value: todayTotals.water.toFixed(1), unit: 'L', color: '#5cb88a' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-1">{s.label}</div>
              <div className="text-xl font-bold font-['Syne']" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[9px] text-[var(--text-dim)]">{s.unit}</div>
            </div>
          ))}
        </div>
        {/* Progress bars */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[9px] text-[var(--text-muted)] mb-1">
              <span>CALORIES</span><span>{calPct}%</span>
            </div>
            <div className="h-1.5 bg-[var(--surface2)] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${calPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[9px] text-[var(--text-muted)] mb-1">
              <span>PROTEIN</span><span>{proteinPct}%</span>
            </div>
            <div className="h-1.5 bg-[var(--surface2)] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[var(--blue)] transition-all" style={{ width: `${proteinPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Meal Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="os-section-title">MEALS - {formatDate(selectedDate)}</h2>
          <button onClick={() => { resetForm(); setEditingLog(null); setShowForm(true) }} className="os-btn">
            + ADD MEAL
          </button>
        </div>

        {showForm && (
          <div className="os-card border border-[var(--accent)] border-opacity-30 space-y-4">
            <div className="text-[10px] text-[var(--accent)] tracking-widest font-bold">
              {editingLog ? 'EDIT MEAL' : 'LOG MEAL'}
            </div>
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">MEAL NAME *</label>
              <input type="text" value={form.meal_name}
                onChange={e => setForm(p => ({ ...p, meal_name: e.target.value }))}
                placeholder="e.g. Chicken & Rice, Breakfast, Snack..." className="os-input w-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">CALORIES</label>
                <input type="number" value={form.calories}
                  onChange={e => setForm(p => ({ ...p, calories: e.target.value }))}
                  placeholder="500" className="os-input w-full" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">PROTEIN (G)</label>
                <input type="number" step="0.1" value={form.protein_g}
                  onChange={e => setForm(p => ({ ...p, protein_g: e.target.value }))}
                  placeholder="40" className="os-input w-full" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">CARBS (G)</label>
                <input type="number" step="0.1" value={form.carbs_g}
                  onChange={e => setForm(p => ({ ...p, carbs_g: e.target.value }))}
                  placeholder="60" className="os-input w-full" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">FAT (G)</label>
                <input type="number" step="0.1" value={form.fat_g}
                  onChange={e => setForm(p => ({ ...p, fat_g: e.target.value }))}
                  placeholder="15" className="os-input w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">WATER (LITERS)</label>
                <input type="number" step="0.1" value={form.water_liters}
                  onChange={e => setForm(p => ({ ...p, water_liters: e.target.value }))}
                  placeholder="0.5" className="os-input w-full" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">NOTES</label>
                <input type="text" value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Optional notes" className="os-input w-full" />
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
            <div className="text-3xl mb-3">🥗</div>
            <div className="text-[var(--text-muted)] text-xs">No meals logged for {formatDate(selectedDate)}</div>
          </div>
        ) : (
          <div className="space-y-2">
            {todayLogs.map(log => (
              <div key={log.id} className="os-card group hover:border-[var(--border-bright)] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-xs text-[var(--text)] mb-1">{log.meal_name}</div>
                    <div className="flex gap-4 text-[9px] text-[var(--text-muted)]">
                      {log.calories && <span className="text-[var(--accent)]">{log.calories} kcal</span>}
                      {log.protein_g && <span className="text-[var(--blue)]">{log.protein_g}g protein</span>}
                      {log.carbs_g && <span className="text-[var(--gold)]">{log.carbs_g}g carbs</span>}
                      {log.fat_g && <span className="text-[var(--warn)]">{log.fat_g}g fat</span>}
                      {log.water_liters && <span className="text-[var(--green)]">{log.water_liters}L water</span>}
                    </div>
                    {log.notes && <div className="text-[10px] text-[var(--text-dim)] mt-1">{log.notes}</div>}
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
