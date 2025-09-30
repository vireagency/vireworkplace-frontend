/**
 * @fileoverview Section Cards Component for Vire Workplace HR App
 * @description Displays a grid of metric cards with key performance indicators and trends
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// ============================================================================
// ICON IMPORTS
// ============================================================================

// Tabler icons for trend indicators
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

// ============================================================================
// UI COMPONENT IMPORTS
// ============================================================================

// Badge component for trend indicators
import { Badge } from "@/components/ui/badge";

// Card components for layout and structure
import {
  Card, // Main card container
  CardAction, // Card action area for badges
  CardDescription, // Card description text
  CardFooter, // Card footer section
  CardHeader, // Card header section
  CardTitle, // Card title text
} from "@/components/ui/card";

/**
 * SectionCards Component
 * @description Displays a responsive grid of metric cards showing key performance indicators
 * @component
 * @returns {JSX.Element} The section cards grid component
 *
 * Features:
 * - Responsive grid layout (1 column on mobile, 2 on xl, 4 on 5xl)
 * - Metric cards with descriptions, values, and trend indicators
 * - Gradient backgrounds and shadow effects
 * - Container queries for responsive typography
 * - Trend badges with up/down indicators
 * - Detailed footer information for each metric
 *
 * Metrics Displayed:
 * - Total Revenue: Financial performance indicator
 * - New Customers: Customer acquisition metric
 * - Active Accounts: User engagement indicator
 * - Growth Rate: Overall business growth percentage
 */
export function SectionCards() {
  return (
    // ============================================================================
    // CARDS GRID CONTAINER
    // ============================================================================

    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-2 sm:gap-4 px-2 sm:px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* ========================================================================
           TOTAL REVENUE CARD
           ========================================================================
           
           Displays total revenue with positive trend indicator
           ======================================================================== */}

      <Card className="@container/card">
        <CardHeader>
          {/* Revenue metric description */}
          <CardDescription>Total Revenue</CardDescription>

          {/* Revenue value with responsive typography */}
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $1,250.00
          </CardTitle>

          {/* Trend indicator badge */}
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>

        {/* Card footer with additional context */}
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/* Trend description with icon */}
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <IconTrendingUp className="size-4" />
          </div>
          {/* Additional context information */}
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>

      {/* ========================================================================
           NEW CUSTOMERS CARD
           ========================================================================
           
           Displays new customer count with negative trend indicator
           ======================================================================== */}

      <Card className="@container/card">
        <CardHeader>
          {/* Customer metric description */}
          <CardDescription>New Customers</CardDescription>

          {/* Customer count with responsive typography */}
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>

          {/* Trend indicator badge */}
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>

        {/* Card footer with additional context */}
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/* Trend description with icon */}
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <IconTrendingDown className="size-4" />
          </div>
          {/* Additional context information */}
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>

      {/* ========================================================================
           ACTIVE ACCOUNTS CARD
           ========================================================================
           
           Displays active account count with positive trend indicator
           ======================================================================== */}

      <Card className="@container/card">
        <CardHeader>
          {/* Active accounts metric description */}
          <CardDescription>Active Accounts</CardDescription>

          {/* Account count with responsive typography */}
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>

          {/* Trend indicator badge */}
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>

        {/* Card footer with additional context */}
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/* Trend description with icon */}
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>
          {/* Additional context information */}
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>

      {/* ========================================================================
           GROWTH RATE CARD
           ========================================================================
           
           Displays growth rate percentage with positive trend indicator
           ======================================================================== */}

      <Card className="@container/card">
        <CardHeader>
          {/* Growth rate metric description */}
          <CardDescription>Growth Rate</CardDescription>

          {/* Growth percentage with responsive typography */}
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>

          {/* Trend indicator badge */}
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>

        {/* Card footer with additional context */}
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/* Trend description with icon */}
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
          {/* Additional context information */}
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  );
}
