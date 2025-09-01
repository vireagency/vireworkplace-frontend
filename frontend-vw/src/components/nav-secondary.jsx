"use client";
import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconUser, IconLock, IconBell } from "@tabler/icons-react";

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
            const isHR = location.pathname.startsWith('/human-resource-manager');
            const isSettings = item.title === 'Settings';

            // Custom HR Settings popover
            if (isHR && isSettings) {
              return (
                <SidebarMenuItem key={item.title}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <SidebarMenuButton 
                        tooltip={item.title}
                        className={`cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 ${isActive ? "text-[#00DB12]" : ""}`}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </PopoverTrigger>
                    <PopoverContent align="start" side="right" className="w-36 p-1">
                      <div>
                        <button 
                          onClick={() => navigate('/human-resource-manager/settings/profile')}
                          className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center space-x-2 ${
                            location.pathname === '/human-resource-manager/settings/profile' 
                              ? 'bg-green-500 text-white hover:bg-green-500' 
                              : 'hover:bg-green-500 hover:text-white'
                          }`}
                        >
                          <IconUser size={16} />
                          <span>Profile</span>
                        </button>
                        <div className="h-px bg-gray-200 my-1"></div>
                        <button 
                          onClick={() => navigate('/human-resource-manager/settings/password')}
                          className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-green-500 hover:text-white rounded-md transition-colors cursor-pointer flex items-center space-x-2"
                        >
                          <IconLock size={16} />
                          <span>Password</span>
                        </button>
                        <div className="h-px bg-gray-200 my-1"></div>
                        <button 
                          onClick={() => navigate('/human-resource-manager/settings/notifications')}
                          className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-green-500 hover:text-white rounded-md transition-colors cursor-pointer flex items-center space-x-2"
                        >
                          <IconBell size={16} />
                          <span>Notification</span>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </SidebarMenuItem>
              );
            }

            // Default secondary item
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
