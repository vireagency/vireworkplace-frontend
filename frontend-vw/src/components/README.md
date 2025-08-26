# Reusable Action Button Components

This directory contains reusable action button components that can be used across different dashboards with different text and icons.

## Components Overview

### 1. ActionButton (`ui/action-button.jsx`)
A single, reusable action button component that can be customized with different icons, text, and variants.

**Props:**
- `icon`: Icon component to display (Tabler icon)
- `text`: Button text to display
- `tooltip`: Tooltip text for the button
- `onClick`: Click handler function
- `className`: Additional CSS classes
- `variant`: Button variant (`primary`, `secondary`, `outline`, `ghost`, `destructive`)
- `disabled`: Whether the button is disabled

**Example:**
```jsx
import { ActionButton } from "@/components/ui/action-button";
import { IconUserPlus } from "@tabler/icons-react";

<ActionButton
  icon={IconUserPlus}
  text="Add Employee"
  tooltip="Add New Employee"
  variant="primary"
  onClick={() => console.log("Add Employee clicked")}
/>
```

### 2. ActionButtonsSection (`action-buttons-section.jsx`)
A component that renders a section of action buttons based on the provided configuration.

**Props:**
- `actionButtons`: Array of action button configurations
- `title`: Optional section title
- `className`: Additional CSS classes

**Example:**
```jsx
import { ActionButtonsSection } from "@/components/action-buttons-section";
import { hrActionButtons } from "@/config/actionButtonConfigs";

<ActionButtonsSection 
  actionButtons={hrActionButtons}
  title="Quick Actions"
/>
```

## Configuration

Action button configurations are defined in `@/config/actionButtonConfigs.js`:

### HR Dashboard Action Buttons
- Add Employee
- Create Report
- Schedule Review
- Approve Leave

### Staff Dashboard Action Buttons
- Clock In/Out
- Request Leave
- Update Profile
- View Payslip

### Admin Dashboard Action Buttons
- Create User
- System Config
- Backup System
- View Logs
- Clean Cache

## Usage in Dashboards

### 1. Update Dashboard Configuration
Add `actionButtons` to your dashboard configuration:

```jsx
// In dashboardConfigs.js
export const hrDashboardConfig = {
  navMain: [...],
  navSecondary: [...],
  documents: [...],
  actionButtons: hrActionButtons, // Add this line
};
```

### 2. Pass to NavMain Component
The `NavMain` component automatically receives and displays action buttons:

```jsx
// In app-sidebar.jsx (already implemented)
<NavMain items={userData.navMain} actionButtons={userData.actionButtons} />
```

### 3. Custom Action Buttons
To create custom action buttons for a specific dashboard:

```jsx
// Create custom configuration
const customActionButtons = [
  {
    icon: IconCustom,
    text: "Custom Action",
    tooltip: "Custom tooltip",
    variant: "primary",
    onClick: () => console.log("Custom action clicked"),
  },
];

// Use in dashboard config
export const customDashboardConfig = {
  // ... other config
  actionButtons: customActionButtons,
};
```

## Button Variants

The `ActionButton` component supports multiple variants:

- **primary**: Blue background with white text
- **secondary**: Gray background with dark text
- **outline**: Bordered button with transparent background
- **ghost**: Transparent background with hover effects
- **destructive**: Red background for dangerous actions

## Benefits

1. **Reusability**: Same component structure across all dashboards
2. **Consistency**: Uniform styling and behavior
3. **Maintainability**: Centralized configuration and styling
4. **Flexibility**: Easy to customize for different user roles
5. **Accessibility**: Built-in tooltips and proper ARIA attributes

## File Structure

```
src/
├── components/
│   ├── ui/
│   │   └── action-button.jsx          # Single action button component
│   ├── action-buttons-section.jsx     # Section wrapper for multiple buttons
│   ├── examples/
│   │   └── ActionButtonsExample.jsx   # Usage examples
│   └── nav-main.jsx                   # Updated to use action buttons
├── config/
│   ├── actionButtonConfigs.js         # Button configurations
│   └── dashboardConfigs.js            # Updated dashboard configs
```

## Adding New Action Buttons

1. **Add to Configuration**: Update `actionButtonConfigs.js` with new button definitions
2. **Import Icons**: Import required Tabler icons
3. **Update Dashboard Config**: Add the new configuration to relevant dashboard configs
4. **Test**: Verify the buttons appear correctly in the sidebar

## Example: Adding a New HR Action Button

```jsx
// In actionButtonConfigs.js
import { IconNewFeature } from "@tabler/icons-react";

export const hrActionButtons = [
  // ... existing buttons
  {
    icon: IconNewFeature,
    text: "New Feature",
    tooltip: "Access New Feature",
    variant: "primary",
    onClick: () => console.log("New Feature clicked"),
  },
];
```

The new button will automatically appear in the HR dashboard sidebar without any additional changes to the component structure.
