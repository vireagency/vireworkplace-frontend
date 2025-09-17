import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";
import staffData from "../staffData.json";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

export default function StaffPerformancePage() {
  const { accessToken } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!accessToken) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const url = `${apiUrl}/tasks`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (response.data.success) {
          setTasks(response.data.data || response.data.tasks || []);
        } else {
          setTasks([]);
        }
      } catch {
        setTasks([]);
      }
    };
    fetchTasks();
  }, [accessToken]);

  const dynamicSidebarConfig = {
    ...staffDashboardConfig,
    productivity: staffDashboardConfig.productivity.map((item) =>
      item.title === "Tasks" ? { ...item, badge: tasks.length } : item
    ),
  };

  return (
    <StaffDashboardLayout
      sidebarConfig={dynamicSidebarConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
      dataTableData={staffData}
    >
      {/* Performance-specific content can be added here later */}
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Performance
          </h1>
          <p className="text-gray-600">
            Track your performance metrics and goals
          </p>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
