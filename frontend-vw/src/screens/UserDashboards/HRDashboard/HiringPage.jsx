import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { hrDashboardConfig } from "@/config/dashboardConfigs"
import hrData from "./hrData.json"

export default function HiringPage() {
  return (
    <DashboardLayout 
      sidebarConfig={hrDashboardConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
      dataTableData={hrData}
    >
      {/* Hiring-specific custom content can go here */}
    </DashboardLayout>
  )
}
