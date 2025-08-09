import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { adminDashboardConfig } from "@/config/dashboardConfigs"
import adminData from "./admindata.json"

export default function AdminDashboardPage() {
  return (
    <DashboardLayout 
      sidebarConfig={adminDashboardConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
      dataTableData={adminData}
    >
      {/* Admin-specific custom content can go here */}
    </DashboardLayout>
  )
}
