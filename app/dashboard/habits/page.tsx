export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import HabitsModule from '@/components/modules/HabitsModule'

export default function HabitsPage() {
  return (
    <DashboardShell>
      <HabitsModule />
    </DashboardShell>
  )
}
