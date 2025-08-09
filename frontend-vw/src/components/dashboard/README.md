# Modular Dashboard System

This directory contains the modular dashboard components that provide a reusable structure for all dashboard types (HR, Staff, Admin).

## Components

### DashboardLayout
The main reusable dashboard wrapper component that provides:
- Consistent layout structure
- Theme management (light theme for dashboards)
- Configurable sidebar
- Optional components (SectionCards, Chart, DataTable)
- Custom content area via children prop

### AppSidebar
Enhanced sidebar component that accepts custom configurations:
- Default navigation items
- Custom navigation items via config prop
- User information display
- Role-based customization

## Usage

### Basic Usage
```jsx
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { hrDashboardConfig } from "@/config/dashboardConfigs"

export default function MyDashboard() {
  return (
    <DashboardLayout 
      sidebarConfig={hrDashboardConfig}
      showSectionCards={true}
      showChart={true}
      showDataTable={true}
      dataTableData={data}
    >
      {/* Custom content goes here */}
    </DashboardLayout>
  )
}
```

### DashboardLayout Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Custom content to render in the main area |
| `sidebarConfig` | object | - | Navigation configuration for the sidebar |
| `showSectionCards` | boolean | true | Whether to show the section cards |
| `showChart` | boolean | true | Whether to show the chart area |
| `showDataTable` | boolean | false | Whether to show the data table |
| `dataTableData` | array | null | Data for the data table |
| `className` | string | "min-h-screen bg-white" | Custom CSS classes |

### Sidebar Configuration

Each dashboard type has its own configuration in `@/config/dashboardConfigs.js`:

```jsx
export const hrDashboardConfig = {
  navMain: [
    {
      title: "Dashboard",
      url: "/human-resource-manager",
      icon: IconDashboard,
    },
    // ... more navigation items
  ],
  navSecondary: [
    // ... secondary navigation items
  ],
  documents: [
    // ... document links
  ],
}
```

## Dashboard Types

### HR Dashboard
- Employee Management
- Recruitment
- Performance Reviews
- Leave Management
- Analytics

### Staff Dashboard
- My Profile
- Leave Requests
- Performance
- Team

### Admin Dashboard
- System Management
- User Management
- Analytics
- Reports
- System Health

## Customization

### Adding Custom Content
```jsx
<DashboardLayout sidebarConfig={config}>
  <div className="custom-widget">
    <h2>Custom Widget</h2>
    <p>This is custom content specific to this dashboard.</p>
  </div>
</DashboardLayout>
```

### Custom Sidebar Items
```jsx
const customConfig = {
  ...hrDashboardConfig,
  navMain: [
    ...hrDashboardConfig.navMain,
    {
      title: "Custom Feature",
      url: "/custom",
      icon: CustomIcon,
    }
  ]
}
```

### Conditional Components
```jsx
<DashboardLayout 
  sidebarConfig={config}
  showSectionCards={userRole === 'admin'}
  showChart={true}
  showDataTable={false}
>
  {userRole === 'hr' && <HRWidget />}
  {userRole === 'staff' && <StaffWidget />}
</DashboardLayout>
```

## Benefits

1. **Consistency**: All dashboards share the same base structure
2. **Maintainability**: Changes to layout affect all dashboards
3. **Customization**: Each dashboard can have unique features
4. **Reusability**: Easy to create new dashboard types
5. **Performance**: Shared components reduce bundle size 