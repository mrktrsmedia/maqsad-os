'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today, formatDate } from '@/lib/dates'
import toast from 'react-hot-toast'

interface BacksightEntry {
  id: string
  entry_date: string
  question: string
  ai_response: string | null
  created_at: string
}

const HARD_QUESTIONS = [
  "Where are you lying to yourself right now?",
  "What would your future self say about how you're spending today?",
  "What's the one thing you keep avoiding that would change everything?",
  "If results were the only measure, how would you grade this month?",
  "What pattern keeps showing up in your failures?",
  "Who are you becoming? Is that who you want to be?",
  "What fear is running your decisions right now?",
  "Where is your energy leaking that you could seal today?",
  "What's the gap between who you say you are and how you actually live?",
  "What would you do differently if you had 10x the stakes?",
]

export default function BacksightModule() {
  const supabase = createClient()
  const [entries, setEntries] = useState<BacksightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [customQuestion, setCustomQuestion] = useState('')

  // Gap analysis fields saved as a mirror_entry with special prefix
  const [gaps, setGaps] = useState({
    currentReality: '',
    desiredReality: '',
    mainGap: '',
    rootCause: '',
    nextAction: '',
  })
  const [savingGaps, setSavingGaps] = useState(false)
  const [gapsSaved, setGapsSaved] = useState(false)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('mirror_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setEntries(data as BacksightEntry[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  async function saveReflection() {
    const question = activeQuestion || customQuestion
    if (!question.trim() || !answer.trim()) {
      toast.error('Both question and answer required')
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('mirror_entries').insert({
      user_id: user.id,
      entry_date: today(),
      question: question,
      ai_response: answer,
    })

    if (error) { toast.error('Failed to save'); return }
    toast.success('Reflection saved')
    setShowForm(false)
    setActiveQuestion('')
    setAnswer('')
    setCustomQuestion('')
    fetchEntries()
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase.from('mirror_entries').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    fetchEntries()
  }

  async function saveGapAnalysis() {
    setSavingGaps(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSavingGaps(false); return }

    const content = JSON.stringify(gaps)
    const { error } = await supabase.from('mirror_entries').insert({
      user_id: user.id,
      entry_date: today(),
      question: '[GAP ANALYSIS]',
      ai_response: content,
    })

    setSavingGaps(false)
    if (error) { toast.error('Failed to save gap analysis'); return }
    toast.success('Gap analysis saved')
    setGapsSaved(true)
    fetchEntries()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[var(--text-muted)] text-xs tracking-widest">LOADING...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="os-card border-[var(--border-bright)]">
        <div className="text-[10px] text-[var(--accent)] tracking-widest mb-2">BACKSIGHT MODULE</div>
        <div className="text-xs text-[var(--text-muted)] leading-relaxed">
          Backsight is for deep reflection. No AI fluff. Real answers. Gap analysis, hard questions, pattern detection.
          Use this weekly or monthly to audit where you actually are vs where you said you'd be.
        </div>
      </div>

      {/* Gap Analysis */}
      <div className="os-card">
        <div className="text-[10px] text-[var(--text-muted)] tracking-widest mb-4">GAP ANALYSIS</div>
        <div className="space-y-4">
          {[
            { key: 'currentReality', label: 'CURRENT REALITY', placeholder: 'Where are you actually right now? Be ruthlessly honest.' },
            { key: 'desiredReality', label: 'DESIRED REALITY', placeholder: 'Where do you want to be? Be specific - money, habits, skills, relationships.' },
            { key: 'mainGap', label: 'MAIN GAP', placeholder: "What's the biggest distance between the two? Name it clearly." },
            { key: 'rootCause', label: 'ROOT CAUSE', placeholder: "Why does this gap exist? Not excuses - real causes." },
            { key: 'nextAction', label: 'NEXT IRREVERSIBLE ACTION', placeholder: "What is the one thing you will do in the next 48 hours to close this gap?" },
          ].map(field => (
            <div key={field.key}>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">{field.label}</label>
              <textarea
                value={gaps[field.key as keyof typeof gaps]}
                onChange={e => setGaps(p => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                rows={2}
                className="os-input w-full resize-none"
              />
            </div>
          ))}
          <button onClick={saveGapAnalysis} disabled={savingGaps || gapsSaved}
            className={`os-btn ${gapsSaved ? 'opacity-50' : ''}`}>
            {savingGaps ? 'SAVING...' : gapsSaved ? 'SAVED ✓' : 'SAVE GAP ANALYSIS'}
          </button>
        </div>
      </div>

      {/* Hard Questions */}
      <div className="os-card">
        <div className="text-[10px] text-[var(--text-muted)] tracking-widest mb-4">HARD QUESTIONS</div>
        {!showForm ? (
          <div className="space-y-2">
            {HARD_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => { setActiveQuestion(q); setAnswer(''); setShowForm(true) }}
                className="w-full text-left p-3 rounded-lg border border-[var(--border)] hover:border-[var(--border-bright)] hover:bg-[var(--surface2)] transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-[9px] text-[var(--text-dim)] mt-0.5 font-['Syne'] font-bold">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{q}</span>
                </div>
              </button>
            ))}
            <button
              onClick={() => { setActiveQuestion(''); setAnswer(''); setShowForm(true) }}
              className="w-full text-left p-3 rounded-lg border border-dashed border-[var(--border)] hover:border-[var(--accent)] transition-all"
            >
              <span className="text-[9px] text-[var(--text-muted)] tracking-widest">+ WRITE YOUR OWN QUESTION</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeQuestion ? (
              <div className="p-3 bg-[var(--surface2)] rounded-lg">
                <div className="text-xs text-[var(--text)] font-['Fraunces'] italic">"{activeQuestion}"</div>
              </div>
            ) : (
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">YOUR QUESTION</label>
                <input type="text" value={customQuestion}
                  onChange={e => setCustomQuestion(e.target.value)}
                  placeholder="Ask yourself something hard..." className="os-input w-full" />
              </div>
            )}
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">YOUR HONEST ANSWER</label>
              <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                placeholder="Don't think. Write. Be brutal." rows={5}
                className="os-input w-full resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={saveReflection} className="os-btn">SAVE REFLECTION</button>
              <button onClick={() => { setShowForm(false); setActiveQuestion(''); setAnswer('') }}
                className="os-btn opacity-50">CANCEL</button>
            </div>
          </div>
        )}
      </div>

      {/* Past Reflections */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <div className="os-section-title">PAST REFLECTIONS</div>
          <div className="space-y-2">
            {entries.filter(e => e.question !== '[GAP ANALYSIS]').slice(0, 10).map(entry => (
              <div key={entry.id} className="os-card group hover:border-[var(--border-bright)] transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-[9px] text-[var(--text-dim)] mb-2">{formatDate(entry.entry_date)}</div>
                    <div className="text-[10px] text-[var(--accent)] mb-2 font-['Fraunces'] italic">
                      "{entry.question}"
                    </div>
                    <div className="text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
                      {entry.ai_response}
                    </div>
                  </div>
                  <button onClick={() => deleteEntry(entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-[var(--text-dim)] hover:text-[var(--red)] px-1.5 py-0.5 border border-[var(--border)] rounded flex-shrink-0">
                    DEL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
