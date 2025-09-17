import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

const UniformSidebar = ({
  config,
  className,
  itemCounts = {},
  onNavigate,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});
  const [isNavigating, setIsNavigating] = useState(false);

  // Initialize expanded sections
  useEffect(() => {
    const initialExpanded = {};
    Object.keys(config).forEach((sectionKey) => {
      const section = config[sectionKey];
      if (Array.isArray(section)) {
        const hasActiveItem = section.some(
          (item) =>
            location.pathname === item.href ||
            location.pathname.startsWith(item.href + "/")
        );
        initialExpanded[sectionKey] = hasActiveItem;
      }
    });
    setExpandedSections(initialExpanded);
  }, [config, location.pathname]);

  const toggleSection = (sectionKey) => {
    if (isNavigating) return;

    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleNavigation = async (href, item) => {
    if (isNavigating || location.pathname === href) return;

    setIsNavigating(true);

    try {
      // Call parent navigation handler if provided
      if (onNavigate) {
        await onNavigate(href, item);
      }

      // Navigate with smooth transition
      navigate(href);

      // Small delay for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 150));
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setIsNavigating(false);
    }
  };

  const isActiveItem = (href) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const getItemCount = (itemTitle, sectionKey) => {
    return (
      itemCounts[`${sectionKey}_${itemTitle}`] || itemCounts[itemTitle] || 0
    );
  };

  const renderNavItem = (item, sectionKey) => {
    const isActive = isActiveItem(item.href);
    const itemCount = getItemCount(item.title, sectionKey);
    const Icon = item.icon;

    return (
      <Button
        key={item.href}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 h-10 px-3 text-sm font-normal transition-all duration-200 group",
          "hover:bg-gray-100 hover:text-gray-900",
          isActive &&
            "bg-green-50 text-green-700 border-r-2 border-green-500 font-medium",
          isNavigating && "opacity-50 pointer-events-none"
        )}
        onClick={() => handleNavigation(item.href, item)}
        disabled={isNavigating || isLoading}
      >
        <Icon
          className={cn(
            "h-4 w-4 transition-colors duration-200",
            isActive
              ? "text-green-600"
              : "text-gray-500 group-hover:text-gray-700"
          )}
        />
        <span className="flex-1 text-left truncate">{item.title}</span>
        {itemCount > 0 && (
          <Badge
            variant="secondary"
            className={cn(
              "h-5 px-1.5 text-xs transition-colors duration-200",
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            )}
          >
            {itemCount}
          </Badge>
        )}
        {isNavigating && location.pathname !== item.href && (
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
        )}
      </Button>
    );
  };

  const renderSection = (sectionKey, section) => {
    if (!Array.isArray(section)) return null;

    const isExpanded = expandedSections[sectionKey];
    const sectionTitle = sectionKey
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return (
      <Collapsible
        key={sectionKey}
        open={isExpanded}
        onOpenChange={() => toggleSection(sectionKey)}
        className="space-y-1"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between h-8 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wide",
              "hover:bg-gray-50 hover:text-gray-900 transition-all duration-200",
              isNavigating && "opacity-50 pointer-events-none"
            )}
            disabled={isNavigating || isLoading}
          >
            <span>{sectionTitle}</span>
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-3 w-3 transition-transform duration-200" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 animate-in slide-in-from-top-1 duration-200">
          {section.map((item) => renderNavItem(item, sectionKey))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {Object.entries(config).map(([sectionKey, section]) =>
            renderSection(sectionKey, section)
          )}
        </div>
      </ScrollArea>

      {isLoading && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border border-gray-300 border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        </div>
      )}
    </div>
  );
};

export default UniformSidebar;
