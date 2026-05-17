export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import GymModule from '@/components/modules/GymModule'

export default function GymPage() {
  return (
    <DashboardShell>
      <GymModule />
    </DashboardShell>
  )
}
