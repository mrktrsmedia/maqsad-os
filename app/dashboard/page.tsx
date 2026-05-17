export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import { createClient } from '@/lib/supabase/server'
import DashboardModule from '@/components/modules/DashboardModule'
import { today, getWeekDays } from '@/lib/dates'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const todayStr = today()
  const weekDays = getWeekDays()

  const [
    { data: dailyLogs },
    { data: todayPrayers },
    { data: habits },
    { data: habitCompletions },
    { data: quickLogs },
  ] = await Promise.all([
    supabase.from('daily_logs').select('*').eq('user_id', user.id).in('log_date', weekDays),
    supabase.from('prayers').select('*').eq('user_id', user.id).eq('prayer_date', todayStr).single(),
    supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true),
    supabase.from('habit_completions').select('*').eq('user_id', user.id).in('completion_date', weekDays),
    supabase.from('quick_logs').select('*').eq('user_id', user.id).eq('log_date', todayStr).order('logged_at', { ascending: false }).limit(10),
  ])

  return (
    <DashboardShell title="Dashboard">
      <DashboardModule
        userId={user.id}
        weekDays={getWeekDays()}
        dailyLogs={dailyLogs ?? []}
        todayPrayers={todayPrayers ?? null}
        habits={habits ?? []}
        habitCompletions={habitCompletions ?? []}
        quickLogs={quickLogs ?? []}
        todayStr={todayStr}
      />
    </DashboardShell>
  )
}
