import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { hrDashboardConfig } from "@/config/dashboardConfigs"
import hrData from "./hrData.json"

export default function HRMessagesPage() {
  return (
    <DashboardLayout 
      sidebarConfig={hrDashboardConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
      dataTableData={hrData}
    >
      {/* Messages-specific custom content can go here */}
    </DashboardLayout>
  )
}
