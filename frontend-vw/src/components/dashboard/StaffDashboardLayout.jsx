import { StaffSidebar } from "@/components/StaffSidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { useEffect } from "react";

export default function StaffDashboardLayout({
  children,
  sidebarConfig,
  itemCounts = {},
  onNavigate,
  isLoading = false,
  showSectionCards = true,
  showChart = true,
  showDataTable = false,
  dataTableData = null,
  className = "min-h-screen bg-white",
}) {
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
          itemCounts={itemCounts}
          onNavigate={onNavigate}
          isLoading={isLoading}
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
}
