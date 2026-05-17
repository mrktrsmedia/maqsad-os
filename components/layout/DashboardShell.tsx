import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import type { Profile } from '@/types/database.types'
import type { ReactNode } from 'react'

interface DashboardShellProps {
  children: ReactNode
  title?: string
}

export default async function DashboardShell({ children, title = 'DASHBOARD' }: DashboardShellProps) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile && !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile as Profile | null} />
      <div className="ml-[220px] flex-1 flex flex-col min-h-screen">
        <Topbar title={title} profile={profile as Profile | null} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
