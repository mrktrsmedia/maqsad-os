export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import LearningModule from '@/components/modules/LearningModule'

export default function LearningPage() {
  return (
    <DashboardShell>
      <LearningModule />
    </DashboardShell>
  )
}
