import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { canUseAI } from '@/lib/plans'
import { today, getWeekStart } from '@/lib/dates'
import type { Plan } from '@/types/database.types'

// Lazy init — avoids crash if env var missing at build time
function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set')
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { question } = body
    if (!question?.trim()) return NextResponse.json({ error: 'Question required' }, { status: 400 })

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Reset weekly AI count if needed
    const weekStart = getWeekStart()
    if (!profile.ai_calls_reset_at || profile.ai_calls_reset_at < weekStart) {
      await supabase.from('profiles').update({
        ai_calls_this_week: 0,
        ai_calls_reset_at: new Date().toISOString(),
      }).eq('id', user.id)
      profile.ai_calls_this_week = 0
    }

    if (!canUseAI(profile.plan as Plan, profile.ai_calls_this_week ?? 0)) {
      return NextResponse.json({ error: 'AI limit reached. Upgrade your plan to continue.' }, { status: 429 })
    }

    const todayStr = today()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

    const [
      { data: recentLogs },
      { data: prayers },
      { data: gymSessions },
      { data: outreach },
      { data: habits },
      { data: habitCompletions },
    ] = await Promise.all([
      supabase.from('daily_logs').select('*').eq('user_id', user.id).gte('log_date', sevenDaysAgoStr).order('log_date', { ascending: false }),
      supabase.from('prayers').select('*').eq('user_id', user.id).gte('prayer_date', sevenDaysAgoStr),
      supabase.from('gym_sessions').select('*').eq('user_id', user.id).gte('session_date', sevenDaysAgoStr),
      supabase.from('outreach_leads').select('*').eq('user_id', user.id).gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('habit_completions').select('*').eq('user_id', user.id).gte('completion_date', sevenDaysAgoStr),
    ])

    const prayerStats = prayers?.map(p => {
      const count = [p.fajr, p.dhuhr, p.asr, p.maghrib, p.isha].filter(Boolean).length
      return `${p.prayer_date}: ${count}/5 prayers`
    }).join('\n') ?? 'No prayer data'

    const gymStats = gymSessions?.map(g =>
      `${g.session_date}: ${g.session_type ?? 'Session'} - ${g.duration_minutes ?? '?'} min`
    ).join('\n') ?? 'No gym data'

    const outreachStats = outreach
      ? `Total leads this week: ${outreach.length}, Booked: ${outreach.filter(o => o.status === 'booked').length}, Closed: ${outreach.filter(o => o.status === 'closed').length}`
      : 'No outreach data'

    const habitStats = habits?.map(h => {
      const done = habitCompletions?.filter(c => c.habit_id === h.id).length ?? 0
      return `${h.name}: ${done}/7 days`
    }).join('\n') ?? 'No habits'

    const context = `
USER: ${profile.full_name ?? 'User'} | Plan: ${profile.plan}

LAST 7 DAYS - DAILY LOGS:
${recentLogs?.map(l => `${l.log_date}: score ${l.day_score ?? 'N/A'}, completion ${l.overall_completion ?? 0}%, notes: ${l.notes ?? 'none'}`).join('\n') ?? 'None'}

PRAYERS (last 7 days):
${prayerStats}

GYM SESSIONS (last 7 days):
${gymStats}

OUTREACH (last 7 days):
${outreachStats}

HABITS (last 7 days):
${habitStats}

USER'S QUESTION: ${question}
`

    const systemPrompt = `You are the Mirror - a brutally honest, direct personal performance analyst. 
You analyze the user's actual data and give real, specific, pattern-based insights.

Rules:
- Never be generic or motivational. Be direct and specific.
- Reference the actual data. Name the patterns you see.
- No medical or religious rulings. Focus on execution and self-accountability.
- Keep responses under 200 words.
- Write in second person. Talk to them directly.
- Bold key observations with **asterisks**.
- No therapy language. No "I hear you." No excessive positivity.
- If the data shows a problem, name it clearly.`

    const anthropic = getAnthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: context }],
    })

    const aiResponse = message.content[0].type === 'text' ? message.content[0].text : ''

    // Save entry and increment count (non-fatal if these fail)
    await Promise.allSettled([
      supabase.from('mirror_entries').insert({
        user_id: user.id,
        entry_date: todayStr,
        question,
        ai_response: aiResponse,
      }),
      supabase.from('profiles').update({
        ai_calls_this_week: (profile.ai_calls_this_week ?? 0) + 1,
      }).eq('id', user.id),
    ])

    return NextResponse.json({ response: aiResponse })
  } catch (err: unknown) {
    console.error('[mirror] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
