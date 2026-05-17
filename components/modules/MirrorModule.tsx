'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type { MirrorEntry, Profile } from '@/types/database.types'
import { getRemainingAICalls } from '@/lib/plans'
import type { Plan } from '@/types/database.types'

function fmtMD(d: Date) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }

interface Props {
  profile: Profile
  mirrorEntries: MirrorEntry[]
}

export default function MirrorModule({ profile, mirrorEntries: initEntries }: Props) {
  const [entries, setEntries]   = useState<MirrorEntry[]>(initEntries)
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading]   = useState(false)

  const remaining = getRemainingAICalls(profile.plan as Plan, profile.ai_calls_this_week ?? 0)

  async function generateInsight() {
    if (!question.trim()) { toast.error('Ask a question first.'); return }
    if (remaining <= 0) { toast.error('AI limit reached. Upgrade to continue.'); return }

    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/ai/mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'AI error'); return }
      setResponse(data.response)
      setEntries(prev => [{
        id: crypto.randomUUID(),
        user_id: profile.id,
        entry_date: new Date().toISOString().split('T')[0],
        question,
        ai_response: data.response,
        created_at: new Date().toISOString(),
      }, ...prev])
      setQuestion('')
      toast.success('Mirror generated.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Usage indicator */}
      <div className="flex items-center justify-between mb-5 px-4 py-3 bg-os-surface border border-os-accent-dim rounded-sm">
        <div className="text-[10px] text-os-text-muted">
          AI calls remaining this week:{' '}
          <span className={remaining > 0 ? 'text-os-accent' : 'text-os-red'}>{remaining}</span>
        </div>
        {remaining === 0 && (
          <a href="/pricing" className="os-btn os-btn-accent os-btn-sm">Upgrade →</a>
        )}
      </div>

      {/* Latest response */}
      {response && (
        <div className="os-mirror-card mb-5">
          <div className="font-syne text-[8px] tracking-[0.2em] uppercase text-os-accent mb-3">Mirror Response</div>
          <p className="font-fraunces text-base leading-relaxed text-os-text"
            dangerouslySetInnerHTML={{ __html: response.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c8a97e">$1</strong>') }} />
        </div>
      )}

      {/* Ask */}
      <div className="os-section-title">Ask Your Mirror</div>
      <div className="os-card mb-5">
        <textarea
          className="os-input mb-3 resize-none"
          rows={3}
          placeholder="Ask a direct question. e.g. 'Where am I lying to myself this week?' or 'What's holding me back?'"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-os-text-dim">
            Claude analyzes your OS data and responds directly. No sugar-coating.
          </span>
          <button
            onClick={generateInsight}
            disabled={loading || remaining === 0}
            className={`os-btn os-btn-accent os-btn-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Generating...' : 'Generate Insight →'}
          </button>
        </div>
      </div>

      {/* History */}
      {entries.length > 0 && (
        <>
          <div className="os-section-title">Mirror History</div>
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className="os-insight-card">
                <div className="text-[8px] text-os-accent tracking-widest uppercase mb-2">
                  {fmtMD(new Date(entry.created_at))} · Q: {entry.question}
                </div>
                <p className="font-fraunces text-sm leading-relaxed text-os-text"
                  dangerouslySetInnerHTML={{
                    __html: (entry.ai_response ?? '').replace(
                      /\*\*(.*?)\*\*/g, '<strong style="color:#c8a97e">$1</strong>'
                    )
                  }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
