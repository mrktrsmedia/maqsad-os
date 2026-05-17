export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import WeeklyMoveModule from '@/components/modules/WeeklyMoveModule'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getWeekStart, getWeekEnd } from '@/lib/dates'

export default async function WeeklyMovePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  const [{ data: profile }, { data: weeklyReview }, { data: dailyLogs }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('weekly_reviews').select('*').eq('user_id', user.id).eq('week_start', weekStart).single(),
    supabase.from('daily_logs').select('*').eq('user_id', user.id).gte('log_date', weekStart).lte('log_date', weekEnd),
  ])

  return (
    <DashboardShell title="Weekly Move">
      <WeeklyMoveModule
        userId={user.id}
        profile={profile}
        weekStart={weekStart}
        weekEnd={weekEnd}
        weeklyReview={weeklyReview ?? null}
        dailyLogs={dailyLogs ?? []}
      />
    </DashboardShell>
  )
}
