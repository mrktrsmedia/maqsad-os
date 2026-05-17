export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import FinanceModule from '@/components/modules/FinanceModule'

export default function FinancePage() {
  return (
    <DashboardShell>
      <FinanceModule />
    </DashboardShell>
  )
}
