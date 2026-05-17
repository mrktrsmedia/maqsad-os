export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import QuittingModule from '@/components/modules/QuittingModule'

export default function QuittingPage() {
  return (
    <DashboardShell>
      <QuittingModule />
    </DashboardShell>
  )
}
