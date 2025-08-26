import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout"
import { staffDashboardConfig } from "@/config/dashboardConfigs"
import staffData from "./staffData.json"

export default function StaffDashboardPage() {
  return (
    <StaffDashboardLayout 
      sidebarConfig={staffDashboardConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
      dataTableData={staffData}
    >
      {/* Staff-specific custom content can go here */}
    </StaffDashboardLayout>
  )
}
