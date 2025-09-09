import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout"
import { staffDashboardConfig } from "@/config/dashboardConfigs"
import staffData from "../staffData.json"
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"

export default function StaffEvaluationsPage() {
  return (
    <StaffDashboardLayout
      sidebarConfig={staffDashboardConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
      dataTableData={staffData}
    >
      {/* Evaluations-specific content can be added here later */}
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Evaluations</h1>
          <p className="text-gray-600">View your performance evaluations and feedback</p>
        </div>
      </div>
    </StaffDashboardLayout>
  )
}
