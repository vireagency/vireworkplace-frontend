import { StaffSidebar } from "@/components/StaffSidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { StaffSidebarProvider } from "@/contexts/StaffSidebarContext";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { useEffect, memo } from "react";

const StaffDashboardLayoutComponent = ({
  children,
  sidebarConfig,
  onNavigate,
  showSectionCards = true,
  showChart = true,
  showDataTable = false,
  dataTableData = null,
  className = "min-h-screen bg-white",
}) => {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";

    return () => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    };
  }, []);

  return (
    <div className={className}>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        }}
      >
        <StaffSidebar
          variant="inset"
          config={sidebarConfig}
          onNavigate={onNavigate}
        />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {showSectionCards && <SectionCards />}
                {children}
                {showChart && (
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                  </div>
                )}
                {showDataTable && dataTableData && (
                  <DataTable data={dataTableData} />
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

// Memoize the layout component to prevent unnecessary re-renders
const MemoizedStaffDashboardLayout = memo(StaffDashboardLayoutComponent);

// Wrapper component that provides the sidebar context
export default function StaffDashboardLayout(props) {
  return (
    <StaffSidebarProvider>
      <MemoizedStaffDashboardLayout {...props} />
    </StaffSidebarProvider>
  );
}
