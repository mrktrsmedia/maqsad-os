'use client'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { WeeklyReview, DailyLog, Profile } from '@/types/database.types'
import { canUseAI, getRemainingAICalls } from '@/lib/plans'
import type { Plan } from '@/types/database.types'

// Native date helpers
function parseDate(dateStr: string) { return new Date(dateStr + 'T00:00:00') }
function addDays(date: Date, days: number) { const d = new Date(date); d.setDate(d.getDate() + days); return d }
function fmtYMD(d: Date) { return d.toISOString().split('T')[0] }
function fmtDay(d: Date) { return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) }
function fmtDayLetter(d: Date) { return d.toLocaleDateString('en-US', { weekday: 'short' })[0] }
function fmtDayNum(d: Date) { return d.getDate().toString() }
function fmtWeekNum(d: Date) {
  const jan1 = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
}

interface Props {
  userId: string
  profile: Profile | null
  weekStart: string
  weekEnd: string
  weeklyReview: WeeklyReview | null
  dailyLogs: DailyLog[]
}

export default function WeeklyMoveModule({ userId, profile, weekStart, weekEnd, weeklyReview: initReview, dailyLogs }: Props) {
  const supabase = createClient()
  const [review, setReview] = useState(initReview)
  const [intent, setIntent]     = useState(initReview?.intent ?? '')
  const [wins, setWins]         = useState(initReview?.wins ?? '')
  const [losses, setLosses]     = useState(initReview?.losses ?? '')
  const [lessons, setLessons]   = useState(initReview?.lessons ?? '')
  const [nextMove, setNextMove] = useState(initReview?.next_week_move ?? '')
  const [aiDebrief, setAiDebrief] = useState(initReview?.ai_debrief ?? '')
  const [saving, setSaving]     = useState(false)
  const [debriefLoading, setDebriefLoading] = useState(false)

  const remaining = profile ? getRemainingAICalls(profile.plan as Plan, profile.ai_calls_this_week ?? 0) : 0

  // Build heatmap from daily logs
  const weekStart_ = parseDate(weekStart)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart_, i))
  const logMap = Object.fromEntries(dailyLogs.map(l => [l.log_date, l]))

  function scoreToLevel(score?: number | null): string {
    if (!score) return 'l0'
    if (score >= 80) return 'l4'
    if (score >= 60) return 'l3'
    if (score >= 40) return 'l2'
    return 'l1'
  }

  async function saveReview() {
    setSaving(true)
    const { error } = await supabase.from('weekly_reviews').upsert({
      user_id: userId,
      week_start: weekStart,
      week_end: weekEnd,
      intent, wins, losses, lessons,
      next_week_move: nextMove,
      ai_debrief: aiDebrief,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,week_start' })
    setSaving(false)
    if (error) toast.error('Save failed: ' + error.message)
    else toast.success('Weekly review saved.')
  }

  async function generateDebrief() {
    if (remaining <= 0) { toast.error('AI limit reached. Upgrade to continue.'); return }
    setDebriefLoading(true)
    try {
      const res = await fetch('/api/ai/weekly-debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart, intent, wins, losses, lessons }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'AI error'); return }
      setAiDebrief(data.debrief)
      toast.success('AI debrief generated.')
    } finally {
      setDebriefLoading(false)
    }
  }

  return (
    <div>
      {/* Heatmap */}
      <div className="os-card mb-4">
        <div className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-os-text-muted mb-3">
          Week {fmtWeekNum(weekStart_)} · Execution Heatmap
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map(day => {
            const dStr = fmtYMD(day)
            const log = logMap[dStr]
            return (
              <div key={dStr}
                className={`aspect-square rounded-sm border cursor-pointer transition-all hm-day`}
                style={scoreToHeatStyle(log?.day_score)}
                title={`${fmtDay(day)}: ${log?.day_score ?? 'No log'}`}
              >
                <div className="h-full flex flex-col items-center justify-center">
                  <span className="text-[8px] text-os-text-dim">{fmtDayLetter(day)}</span>
                  <span className="font-syne text-xs font-bold text-os-text">{fmtDayNum(day)}</span>
                  {log?.day_score && <span className="text-[7px]" style={{ color: '#c8a97e' }}>{log.day_score}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="os-card">
          <div className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-os-text-muted mb-2">This Week's Intent</div>
          <textarea className="os-input resize-none" rows={3} value={intent} onChange={e => setIntent(e.target.value)} placeholder="What is this week's single most important move?" />
        </div>
        <div className="os-card">
          <div className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-os-text-muted mb-2">Next Week's Move</div>
          <textarea className="os-input resize-none" rows={3} value={nextMove} onChange={e => setNextMove(e.target.value)} placeholder="What will you do differently next week?" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="os-card">
          <div className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-os-text-muted mb-2">Wins</div>
          <textarea className="os-input resize-none" rows={5} value={wins} onChange={e => setWins(e.target.value)} placeholder="What worked? Be specific. Name real results." />
        </div>
        <div className="os-card">
          <div className="font-syne text-[9px] font-bold tracking-[0.18em] uppercase text-os-text-muted mb-2">Failures & Lessons</div>
          <textarea className="os-input resize-none" rows={5} value={losses} onChange={e => setLosses(e.target.value)} placeholder="What didn't work? What did you learn? Be honest." />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={saveReview} disabled={saving}
          className={`os-btn os-btn-accent flex-1 py-2.5 text-[11px] ${saving ? 'opacity-60' : ''}`}>
          {saving ? 'Saving...' : 'Save Review'}
        </button>
        <button onClick={generateDebrief} disabled={debriefLoading || remaining === 0}
          className={`os-btn flex-1 py-2.5 text-[11px] ${debriefLoading ? 'opacity-60' : ''}`}>
          {debriefLoading ? 'Generating...' : `Generate AI Debrief (${remaining} left)`}
        </button>
      </div>

      {aiDebrief && (
        <div className="os-insight-card">
          <div className="font-syne text-[8px] tracking-[0.2em] uppercase text-os-accent mb-2">AI Weekly Debrief</div>
          <p className="font-fraunces text-sm leading-relaxed text-os-text"
            dangerouslySetInnerHTML={{
              __html: aiDebrief.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c8a97e">$1</strong>')
            }}
          />
        </div>
      )}
    </div>
  )
}

function scoreToHeatStyle(score?: number | null): CSSProperties {
  if (!score) return { background: 'var(--surface2)', borderColor: 'var(--border)' }
  if (score >= 80) return { background: 'var(--accent)', borderColor: 'var(--accent)' }
  if (score >= 60) return { background: 'rgba(200,169,126,0.5)', borderColor: 'rgba(200,169,126,0.7)' }
  if (score >= 40) return { background: 'rgba(200,169,126,0.25)', borderColor: 'rgba(200,169,126,0.4)' }
  return { background: 'rgba(200,169,126,0.1)', borderColor: 'rgba(200,169,126,0.25)' }
}
