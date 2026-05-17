import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { canUseAI } from '@/lib/plans'
import { getWeekStart, getWeekEnd } from '@/lib/dates'
import type { Plan } from '@/types/database.types'

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
    const { weekStart, intent, wins, losses, lessons } = body

    if (!weekStart) return NextResponse.json({ error: 'weekStart required' }, { status: 400 })

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    if (!canUseAI(profile.plan as Plan, profile.ai_calls_this_week ?? 0)) {
      return NextResponse.json({ error: 'AI limit reached. Upgrade your plan.' }, { status: 429 })
    }

    const weekEnd = getWeekEnd(weekStart)

    const [
      { data: dailyLogs },
      { data: prayers },
      { data: gymSessions },
      { data: outreach },
      { data: habitCompletions },
      { data: habits },
    ] = await Promise.all([
      supabase.from('daily_logs').select('*').eq('user_id', user.id).gte('log_date', weekStart).lte('log_date', weekEnd),
      supabase.from('prayers').select('*').eq('user_id', user.id).gte('prayer_date', weekStart).lte('prayer_date', weekEnd),
      supabase.from('gym_sessions').select('*').eq('user_id', user.id).gte('session_date', weekStart).lte('session_date', weekEnd),
      supabase.from('outreach_leads').select('*').eq('user_id', user.id).gte('created_at', new Date(weekStart).toISOString()),
      supabase.from('habit_completions').select('*').eq('user_id', user.id).gte('completion_date', weekStart).lte('completion_date', weekEnd),
      supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true),
    ])

    const scoredLogs = dailyLogs?.filter(l => l.day_score) ?? []
    const avgScore = scoredLogs.length
      ? Math.round(scoredLogs.reduce((s, l) => s + (l.day_score ?? 0), 0) / scoredLogs.length)
      : 0

    const prayerRate = prayers?.length
      ? Math.round(prayers.reduce((s, p) => s + [p.fajr,p.dhuhr,p.asr,p.maghrib,p.isha].filter(Boolean).length, 0) / (prayers.length * 5) * 100)
      : 0

    const context = `
WEEKLY DEBRIEF - Week of ${weekStart} to ${weekEnd}
User: ${profile.full_name ?? 'User'}

INTENT THIS WEEK: ${intent ?? 'Not set'}
USER-REPORTED WINS: ${wins ?? 'None listed'}
USER-REPORTED LOSSES: ${losses ?? 'None listed'}
USER-REPORTED LESSONS: ${lessons ?? 'None listed'}

DATA:
- Average day score: ${avgScore}/100
- Gym sessions: ${gymSessions?.length ?? 0}
- Prayer compliance: ${prayerRate}%
- Outreach leads added: ${outreach?.length ?? 0} (booked: ${outreach?.filter(o => o.status === 'booked').length ?? 0})
- Habit completions: ${habitCompletions?.length ?? 0} across ${habits?.length ?? 0} habits
`

    const anthropic = getAnthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: `You are a weekly performance debrief AI. Analyze the user's week data and write a direct, specific debrief. 
Cover: what the data actually shows, the patterns you see, the gap between stated intent and actual execution, 
and one clear directive for next week. No therapy. No sugar-coating. Data-driven. Under 250 words.
Use **bold** for key observations.`,
      messages: [{ role: 'user', content: context }],
    })

    const aiDebrief = message.content[0].type === 'text' ? message.content[0].text : ''

    await Promise.allSettled([
      supabase.from('weekly_reviews').upsert({
        user_id: user.id,
        week_start: weekStart,
        week_end: weekEnd,
        intent, wins, losses, lessons,
        ai_debrief: aiDebrief,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,week_start' }),
      supabase.from('profiles').update({
        ai_calls_this_week: (profile.ai_calls_this_week ?? 0) + 1,
      }).eq('id', user.id),
    ])

    return NextResponse.json({ debrief: aiDebrief })
  } catch (err: unknown) {
    console.error('[weekly-debrief] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
