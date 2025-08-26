import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout"
import { adminDashboardConfig } from "@/config/dashboardConfigs"
import adminData from "./admindata.json"

export default function AdminDashboardPage() {
  return (
    <AdminDashboardLayout 
      sidebarConfig={adminDashboardConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
      dataTableData={adminData}
    >
      {/* Admin-specific custom content can go here */}
    </AdminDashboardLayout>
  )
}
