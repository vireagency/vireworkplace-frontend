import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button"
import { ActionButton } from "@/components/ui/action-button"
import { ActionButtonsSection } from "@/components/action-buttons-section"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  actionButtons
}) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleNavigation = (url) => {
    if (url && url !== "#") {
      navigate(url);
    }
  };
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Action Buttons Section */}
        {actionButtons && actionButtons.length > 0 && (
          <ActionButtonsSection 
            actionButtons={actionButtons}
            title="Quick Actions"
          />
        )}
        
        {/* Default Check-In Button (if no action buttons provided) */}
        {(!actionButtons || actionButtons.length === 0) && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <ActionButton
                icon={IconCirclePlusFilled}
                text="Check-In"
                tooltip="Check-In"
                variant="primary"
              />
              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline">
                <IconMail />
                <span className="sr-only">Inbox</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        
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
