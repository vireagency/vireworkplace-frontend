/**
 * Dashboard Layout Component
 *
 * A reusable layout component that provides a consistent structure for all dashboard pages.
 * It includes a sidebar, header, and configurable content areas for different dashboard types.
 *
 * Features:
 * - Responsive sidebar with configurable navigation
 * - Light theme for dashboard pages (different from auth pages)
 * - Configurable content sections (cards, charts, data tables)
 * - Flexible layout that adapts to different dashboard needs
 * - Automatic theme switching between auth and dashboard pages
 *
 * Layout Structure:
 * - Sidebar: Navigation and user information
 * - Header: Top navigation and actions
 * - Main Content: Configurable sections based on props
 *
 * Props:
 * @param {React.ReactNode} children - Custom content to render in the main area
 * @param {Object} sidebarConfig - Navigation configuration for the sidebar
 * @param {boolean} showSectionCards - Whether to show the section cards (default: true)
 * @param {boolean} showChart - Whether to show the chart area (default: true)
 * @param {boolean} showDataTable - Whether to show the data table (default: false)
 * @param {Array} dataTableData - Data for the data table component
 * @param {string} className - Custom CSS classes for the main container
 */

// Dashboard Components
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";

// UI Components
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// React Hooks
import { useEffect } from "react";

/**
 * DashboardLayout Component
 *
 * Provides a consistent layout structure for all dashboard pages with configurable
 * content sections and automatic theme management.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Custom content to render
 * @param {Object} props.sidebarConfig - Sidebar navigation configuration
 * @param {boolean} props.showSectionCards - Show section cards (default: true)
 * @param {boolean} props.showChart - Show chart area (default: true)
 * @param {boolean} props.showDataTable - Show data table (default: false)
 * @param {Array} props.dataTableData - Data for data table
 * @param {string} props.className - Custom CSS classes
 */
export default function DashboardLayout({
  children,
  sidebarConfig,
  showSectionCards = true,
  showChart = true,
  showDataTable = false,
  dataTableData = null,
  className = "min-h-screen bg-white",
}) {
  /**
   * Force light theme for dashboard pages
   * Ensures consistent light theme across all dashboard pages
   * and restores dark theme when component unmounts
   */
  useEffect(() => {
    // Switch to light theme for dashboard
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";

    return () => {
      // Restore dark theme when component unmounts
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
        {/* Sidebar with configurable navigation */}
        <AppSidebar variant="inset" config={sidebarConfig} />

        {/* Main content area */}
        <SidebarInset>
          {/* Top header */}
          <SiteHeader />

          {/* Main content container */}
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-2 sm:gap-4 py-2 sm:py-4 md:gap-6 md:py-6">
                {/* Section cards - configurable */}
                {showSectionCards && <SectionCards />}

                {/* Custom content passed as children */}
                {children}

                {/* Chart area - configurable */}
                {showChart && (
                  <div className="px-2 sm:px-4 lg:px-6">
                    <ChartAreaInteractive />
                  </div>
                )}

                {/* Data table - configurable */}
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

export function HRDashboardLayout({
  children,
  sidebarConfig,
  showSectionCards = true,
  showChart = true,
  showDataTable = false,
  dataTableData = null,
  className = "min-h-screen bg-white",
}) {
  /**
   * Force light theme for dashboard pages
   * Ensures consistent light theme across all dashboard pages
   * and restores dark theme when component unmounts
   */
  useEffect(() => {
    // Switch to light theme for dashboard
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";

    return () => {
      // Restore dark theme when component unmounts
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
        {/* Sidebar with configurable navigation */}
        <AppSidebar variant="inset" config={sidebarConfig} />

        {/* Main content area */}
        <SidebarInset>
          {/* Top header */}
          <SiteHeader />

          {/* Main content container */}
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-2 sm:gap-4 py-2 sm:py-4 md:gap-6 md:py-6">
                {/* Section cards - configurable */}
                {showSectionCards && <SectionCards />}

                {/* Custom content passed as children */}
                {children}

                {/* Chart area - configurable */}
                {showChart && (
                  <div className="px-2 sm:px-4 lg:px-6">
                    <ChartAreaInteractive />
                  </div>
                )}

                {/* Data table - configurable */}
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

export function StaffDashboardLayout({
  children,
  sidebarConfig,
  showSectionCards = true,
  showChart = true,
  showDataTable = false,
  dataTableData = null,
  className = "min-h-screen bg-white",
}) {
  /**
   * Force light theme for dashboard pages
   * Ensures consistent light theme across all dashboard pages
   * and restores dark theme when component unmounts
   */
  useEffect(() => {
    // Switch to light theme for dashboard
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";

    return () => {
      // Restore dark theme when component unmounts
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
        {/* Sidebar with configurable navigation */}
        <AppSidebar variant="inset" config={sidebarConfig} />

        {/* Main content area */}
        <SidebarInset>
          {/* Top header */}
          <SiteHeader />

          {/* Main content container */}
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-2 sm:gap-4 py-2 sm:py-4 md:gap-6 md:py-6">
                {/* Section cards - configurable */}
                {showSectionCards && <SectionCards />}

                {/* Custom content passed as children */}
                {children}

                {/* Chart area - configurable */}
                {showChart && (
                  <div className="px-2 sm:px-4 lg:px-6">
                    <ChartAreaInteractive />
                  </div>
                )}

                {/* Data table - configurable */}
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

export function AdminDashboardLayout({
  children,
  sidebarConfig,
  showSectionCards = true,
  showChart = true,
  showDataTable = false,
  dataTableData = null,
  className = "min-h-screen bg-white",
}) {
  /**
   * Force light theme for dashboard pages
   * Ensures consistent light theme across all dashboard pages
   * and restores dark theme when component unmounts
   */
  useEffect(() => {
    // Switch to light theme for dashboard
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";

    return () => {
      // Restore dark theme when component unmounts
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
        {/* Sidebar with configurable navigation */}
        <AppSidebar variant="inset" config={sidebarConfig} />

        {/* Main content area */}
        <SidebarInset>
          {/* Top header */}
          <SiteHeader />

          {/* Main content container */}
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-2 sm:gap-4 py-2 sm:py-4 md:gap-6 md:py-6">
                {/* Section cards - configurable */}
                {showSectionCards && <SectionCards />}

                {/* Custom content passed as children */}
                {children}

                {/* Chart area - configurable */}
                {showChart && (
                  <div className="px-2 sm:px-4 lg:px-6">
                    <ChartAreaInteractive />
                  </div>
                )}

                {/* Data table - configurable */}
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
