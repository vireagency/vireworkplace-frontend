import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { staffDashboardConfig } from "@/config/dashboardConfigs"
import staffData from "./staffData.json"

export default function StaffDashboardPage() {
  return (
    <DashboardLayout 
      sidebarConfig={staffDashboardConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
      dataTableData={staffData}
    >
      {/* Staff-specific custom content can go here */}
    </DashboardLayout>
  )
}
