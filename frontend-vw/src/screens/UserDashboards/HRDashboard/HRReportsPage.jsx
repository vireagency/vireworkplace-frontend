import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { hrDashboardConfig } from "@/config/dashboardConfigs"
import hrData from "./hrData.json"

export default function HRReportsPage() {
  return (
    <DashboardLayout 
      sidebarConfig={hrDashboardConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
      dataTableData={hrData}
    >
      {/* Reports-specific custom content can go here */}
    </DashboardLayout>
  )
}
