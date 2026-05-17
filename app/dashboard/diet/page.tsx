export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import DietModule from '@/components/modules/DietModule'

export default function DietPage() {
  return (
    <DashboardShell>
      <DietModule />
    </DashboardShell>
  )
}
