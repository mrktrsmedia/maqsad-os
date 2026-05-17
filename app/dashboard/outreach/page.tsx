export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import OutreachModule from '@/components/modules/OutreachModule'

export default function OutreachPage() {
  return (
    <DashboardShell>
      <OutreachModule />
    </DashboardShell>
  )
}
