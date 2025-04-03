import { DashboardContent } from "@/components/dashboard-content"
import { DriverDashboard } from "@/components/driver-dashboard"
import { RoleGuard } from "@/components/role-guard"

export default function DashboardPage() {
  return (
    <>
      <RoleGuard allowedRoles={["admin"]}>
        <DashboardContent />
      </RoleGuard>

      <RoleGuard allowedRoles={["driver"]}>
        <DriverDashboard />
      </RoleGuard>
    </>
  )
}

