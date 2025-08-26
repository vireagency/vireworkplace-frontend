import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

/**
 * NavCategorized Component
 * 
 * Renders categorized navigation sections for dashboards.
 * Each section has a title and contains navigation items.
 * 
 * Props:
 * @param {Array} analytics - Analytics section items
 * @param {Array} teams - Teams section items
 * @param {Array} company - Company section items
 */
export function NavCategorized({
  analytics = [],
  teams = [],
  company = [],
}) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (url) => {
    if (url && url !== "#") {
      navigate(url);
    }
  };
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-4">
        {/* Analytics Section */}
        {analytics && analytics.length > 0 && (
          <div>
            <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Analytics
            </h3>
            <SidebarMenu>
              {analytics.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      tooltip={item.title}
                      onClick={() => handleNavigation(item.url)}
                      className={`cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 ${isActive ? "text-[#00DB12]" : ""}`}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        )}

        {/* Teams Section */}
        {teams && teams.length > 0 && (
          <div>
            <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Teams
            </h3>
            <SidebarMenu>
              {teams.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      tooltip={item.title}
                      onClick={() => handleNavigation(item.url)}
                      className={`cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 ${isActive ? "text-[#00DB12]" : ""}`}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        )}

        {/* Company Section */}
        {company && company.length > 0 && (
          <div>
            <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Company
            </h3>
            <SidebarMenu>
              {company.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      tooltip={item.title}
                      onClick={() => handleNavigation(item.url)}
                      className={`cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 ${isActive ? "text-[#00DB12]" : ""}`}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
