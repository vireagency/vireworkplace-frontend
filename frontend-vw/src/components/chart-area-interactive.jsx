/**
 * @fileoverview Interactive Area Chart Component for Vire Workplace HR App
 * @description Responsive area chart with time range filtering and mobile optimization
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// Client-side directive for Next.js compatibility
"use client";

// React core library for component creation and hooks
import * as React from "react";

// ============================================================================
// CHART COMPONENT IMPORTS
// ============================================================================

// Recharts library components for data visualization
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

// ============================================================================
// HOOK IMPORTS
// ============================================================================

// Custom hook for detecting mobile devices
import { useIsMobile } from "@/hooks/use-mobile";

// ============================================================================
// UI COMPONENT IMPORTS
// ============================================================================

// Card components for layout and structure
import {
  Card, // Main card container
  CardAction, // Card action area for controls
  CardContent, // Card content area
  CardDescription, // Card description text
  CardHeader, // Card header section
  CardTitle, // Card title text
} from "@/components/ui/card";

// Chart-specific UI components
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Form control components
import {
  Select, // Dropdown select component
  SelectContent, // Select dropdown content
  SelectItem, // Individual select option
  SelectTrigger, // Select trigger button
  SelectValue, // Select value display
} from "@/components/ui/select";

// Toggle group for time range selection
import {
  ToggleGroup, // Toggle group container
  ToggleGroupItem, // Individual toggle button
} from "@/components/ui/toggle-group";

// ============================================================================
// COMPONENT DESCRIPTION
// ============================================================================

/**
 * Component description for documentation and storybook
 * @type {string}
 */
export const description = "An interactive area chart";

// ============================================================================
// CHART DATA
// ============================================================================

/**
 * Sample chart data for visitor analytics
 * @description Contains daily visitor data for desktop and mobile platforms
 * @type {Array<{date: string, desktop: number, mobile: number}>}
 *
 * Data Structure:
 * - date: ISO date string (YYYY-MM-DD)
 * - desktop: Number of desktop visitors
 * - mobile: Number of mobile visitors
 */
const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-04-21", desktop: 137, mobile: 200 },
  { date: "2024-04-22", desktop: 224, mobile: 170 },
  { date: "2024-04-23", desktop: 138, mobile: 230 },
  { date: "2024-04-24", desktop: 387, mobile: 290 },
  { date: "2024-04-25", desktop: 215, mobile: 250 },
  { date: "2024-04-26", desktop: 75, mobile: 130 },
  { date: "2024-04-27", desktop: 383, mobile: 420 },
  { date: "2024-04-28", desktop: 122, mobile: 180 },
  { date: "2024-04-29", desktop: 315, mobile: 240 },
  { date: "2024-04-30", desktop: 454, mobile: 380 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-05-08", desktop: 149, mobile: 210 },
  { date: "2024-05-09", desktop: 227, mobile: 180 },
  { date: "2024-05-10", desktop: 293, mobile: 330 },
  { date: "2024-05-11", desktop: 335, mobile: 270 },
  { date: "2024-05-12", desktop: 197, mobile: 240 },
  { date: "2024-05-13", desktop: 197, mobile: 160 },
  { date: "2024-05-14", desktop: 448, mobile: 490 },
  { date: "2024-05-15", desktop: 473, mobile: 380 },
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
  { date: "2024-05-24", desktop: 294, mobile: 220 },
  { date: "2024-05-25", desktop: 201, mobile: 250 },
  { date: "2024-05-26", desktop: 213, mobile: 170 },
  { date: "2024-05-27", desktop: 420, mobile: 460 },
  { date: "2024-05-28", desktop: 233, mobile: 190 },
  { date: "2024-05-29", desktop: 78, mobile: 130 },
  { date: "2024-05-30", desktop: 340, mobile: 280 },
  { date: "2024-05-31", desktop: 178, mobile: 230 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
];

// ============================================================================
// CHART CONFIGURATION
// ============================================================================

/**
 * Chart configuration object for styling and labels
 * @description Defines colors, labels, and styling for chart elements
 * @type {Object}
 */
const chartConfig = {
  // Overall visitors configuration
  visitors: {
    label: "Visitors", // Main chart label
  },

  // Desktop platform configuration
  desktop: {
    label: "Desktop", // Desktop data label
    color: "var(--primary)", // Desktop line and fill color
  },

  // Mobile platform configuration
  mobile: {
    label: "Mobile", // Mobile data label
    color: "var(--primary)", // Mobile line and fill color
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ChartAreaInteractive Component
 * @description Interactive area chart with time range filtering and responsive design
 * @component
 * @returns {JSX.Element} The interactive area chart component
 *
 * Features:
 * - Responsive area chart visualization
 * - Time range filtering (7 days, 30 days, 90 days)
 * - Mobile-optimized interface
 * - Interactive tooltips
 * - Gradient-filled areas for visual appeal
 * - Responsive controls (toggle group on desktop, select on mobile)
 */
export function ChartAreaInteractive() {
  // ========================================================================
  // HOOKS AND STATE
  // ========================================================================

  // Detect if user is on a mobile device
  const isMobile = useIsMobile();

  // State for selected time range (90d, 30d, or 7d)
  const [timeRange, setTimeRange] = React.useState("90d");

  // ========================================================================
  // EFFECTS
  // ========================================================================

  /**
   * Effect to automatically set mobile-friendly time range
   * @description Sets time range to 7 days on mobile devices for better UX
   */
  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d"); // Default to 7 days on mobile
    }
  }, [isMobile]);

  // ========================================================================
  // DATA FILTERING
  // ========================================================================

  /**
   * Filter chart data based on selected time range
   * @description Filters data to show only the selected number of days
   * @type {Array<{date: string, desktop: number, mobile: number}>}
   */
  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date); // Convert date string to Date object
    const referenceDate = new Date("2024-06-30"); // Reference date for calculations
    let daysToSubtract = 90; // Default to 90 days

    // Adjust days based on selected time range
    if (timeRange === "30d") {
      daysToSubtract = 30; // 30 days
    } else if (timeRange === "7d") {
      daysToSubtract = 7; // 7 days
    }

    // Calculate start date by subtracting days from reference
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Return true if date is within the selected range
    return date >= startDate;
  });

  return (
    // ============================================================================
    // CHART CARD CONTAINER
    // ============================================================================

    <Card className="@container/card">
      {/* ========================================================================
           CARD HEADER
           ========================================================================
           
           Contains title, description, and time range controls
           ======================================================================== */}

      <CardHeader className="px-2 sm:px-6">
        {/* Chart title */}
        <CardTitle>Total Visitors</CardTitle>

        {/* Responsive description text */}
        <CardDescription>
          {/* Full description for larger screens */}
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          {/* Condensed description for smaller screens */}
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>

        {/* Time range selection controls */}
        <CardAction>
          {/* ====================================================================
               DESKTOP TOGGLE GROUP
               ====================================================================
               
               Toggle buttons for desktop users (hidden on mobile)
               ==================================================================== */}

          <ToggleGroup
            type="single" // Single selection mode
            value={timeRange} // Current selected value
            onValueChange={setTimeRange} // Change handler
            variant="outline" // Outline button style
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            {/* 90 days option */}
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            {/* 30 days option */}
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            {/* 7 days option */}
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>

          {/* ====================================================================
               MOBILE SELECT DROPDOWN
               ====================================================================
               
               Dropdown select for mobile users (hidden on desktop)
               ==================================================================== */}

          <Select value={timeRange} onValueChange={setTimeRange}>
            {/* Select trigger button */}
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden cursor-pointer"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>

            {/* Select dropdown content */}
            <SelectContent className="rounded-xl">
              {/* 90 days option */}
              <SelectItem value="90d" className="rounded-lg cursor-pointer">
                Last 3 months
              </SelectItem>
              {/* 30 days option */}
              <SelectItem value="30d" className="rounded-lg cursor-pointer">
                Last 30 days
              </SelectItem>
              {/* 7 days option */}
              <SelectItem value="7d" className="rounded-lg cursor-pointer">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      {/* ========================================================================
           CARD CONTENT
           ========================================================================
           
           Contains the actual chart visualization
           ======================================================================== */}

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* Chart container with responsive height */}
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] sm:h-[250px] w-full"
        >
          {/* ====================================================================
               AREA CHART COMPONENT
               ====================================================================
               
               Main chart visualization using Recharts
               ==================================================================== */}

          <AreaChart data={filteredData}>
            {/* ================================================================
                 CHART DEFINITIONS
                 ================================================================
                 
                 Define gradients and styling for chart areas
                 ================================================================ */}
            <defs>
              {/* Desktop area gradient */}
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* Mobile area gradient */}
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            {/* ================================================================
                 CHART ELEMENTS
                 ================================================================
                 
                 Grid, axes, tooltips, and data areas
                 ================================================================ */}
            {/* Background grid (vertical lines hidden for cleaner look) */}
            <CartesianGrid vertical={false} />
            {/* X-axis with custom formatting */}
            <XAxis
              dataKey="date" // Data key for x-axis values
              tickLine={false} // Hide tick lines
              axisLine={false} // Hide axis line
              tickMargin={8} // Margin for tick labels
              minTickGap={32} // Minimum gap between ticks
              tickFormatter={(value) => {
                // Custom date formatting
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short", // Abbreviated month
                  day: "numeric", // Numeric day
                });
              }}
            />
            {/* Interactive tooltip */}
            <ChartTooltip
              cursor={false} // Hide cursor line
              defaultIndex={isMobile ? -1 : 10} // Default tooltip position
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    // Custom tooltip date formatting
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short", // Abbreviated month
                      day: "numeric", // Numeric day
                    });
                  }}
                  indicator="dot"
                /> // Dot indicator for tooltip
              }
            />
            {/* ================================================================
                 DATA AREAS
                 ================================================================
                 
                 Stacked area charts for mobile and desktop data
                 ================================================================ */}
            {/* Mobile visitors area */}
            <Area
              dataKey="mobile" // Data key for mobile values
              type="natural" // Natural curve interpolation
              fill="url(#fillMobile)" // Gradient fill for mobile area
              stroke="var(--color-mobile)" // Mobile area stroke color
              stackId="a"
            />{" "}
            // Stack with desktop data
            {/* Desktop visitors area */}
            <Area
              dataKey="desktop" // Data key for desktop values
              type="natural" // Natural curve interpolation
              fill="url(#fillDesktop)" // Gradient fill for desktop area
              stroke="var(--color-desktop)" // Desktop area stroke color
              stackId="a"
            />{" "}
            // Stack with mobile data
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
