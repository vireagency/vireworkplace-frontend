"use client";
import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (url) => {
    if (url && url !== "#") {
      navigate(url);
    }
  };
  
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
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
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
