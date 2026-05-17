export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import MirrorModule from '@/components/modules/MirrorModule'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MirrorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: mirrorEntries }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('mirror_entries').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(20),
  ])

  if (!profile) redirect('/onboarding')

  return (
    <DashboardShell title="Mirror / AI Insight">
      <MirrorModule
        profile={profile}
        mirrorEntries={mirrorEntries ?? []}
      />
    </DashboardShell>
  )
}
