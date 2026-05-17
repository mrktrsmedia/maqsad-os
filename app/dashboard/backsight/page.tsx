export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import BacksightModule from '@/components/modules/BacksightModule'

export default function BacksightPage() {
  return (
    <DashboardShell>
      <BacksightModule />
    </DashboardShell>
  )
}
