import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";
import staffData from "../staffData.json";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";

export default function StaffReportsPage() {
  // Get sidebar counts
  const sidebarCounts = useSidebarCounts();

  // Dynamically update the badges for sidebar items
  const dynamicSidebarConfig = {
    ...staffDashboardConfig,
    analytics:
      staffDashboardConfig.analytics?.map((item) => {
        if (item.title === "Evaluations") {
          return { ...item, badge: sidebarCounts.evaluations };
        }
        return item;
      }) || [],
    productivity:
      staffDashboardConfig.productivity?.map((item) => {
        if (item.title === "Tasks") {
          return { ...item, badge: sidebarCounts.tasks };
        }
        if (item.title === "Attendance") {
          return { ...item, badge: sidebarCounts.attendance };
        }
        return item;
      }) || [],
    company:
      staffDashboardConfig.company?.map((item) => {
        if (item.title === "Messages") {
          return { ...item, badge: sidebarCounts.messages };
        }
        return item;
      }) || [],
  };

  return (
    <StaffDashboardLayout
      sidebarConfig={dynamicSidebarConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
      dataTableData={staffData}
    >
      {/* Reports-specific content can be added here later */}
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">
            View your performance reports and analytics
          </p>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
