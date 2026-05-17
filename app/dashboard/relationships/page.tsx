export const dynamic = 'force-dynamic'

import DashboardShell from '@/components/layout/DashboardShell'
import RelationshipsModule from '@/components/modules/RelationshipsModule'

export default function RelationshipsPage() {
  return (
    <DashboardShell>
      <RelationshipsModule />
    </DashboardShell>
  )
}
