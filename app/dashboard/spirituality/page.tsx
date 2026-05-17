export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import SpiritualityModule from '@/components/modules/SpiritualityModule'

export default function SpiritualityPage() {
  return (
    <DashboardShell>
      <SpiritualityModule />
    </DashboardShell>
  )
}
