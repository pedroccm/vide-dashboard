# Components Catalog

## Overview

The shadcn-admin application contains **60+ components** organized into a hierarchical system. This includes 30+ core shadcn/ui components, specialized component systems, and custom application components.

---

## Core UI Components (src/components/ui/)

### Form Components

#### **Input** (`input.tsx`)
Single-line text input with comprehensive styling and validation support.

**Variants**: 
- Standard text input
- File input with custom styling

**Features**:
- Focus and error state styling
- Placeholder support
- Disabled state handling

**Usage**:
```tsx
<Input type="text" placeholder="Enter username" />
<Input type="file" accept="image/*" />
```

#### **Textarea** (`textarea.tsx`)
Multi-line text input for longer content.

**Features**:
- Auto-resizing capability
- Character count integration
- Focus state management

#### **Input OTP** (`input-otp.tsx`)
Specialized one-time password input component.

**Features**:
- 6-digit code input
- Auto-focus progression
- Auto-submission on completion
- Clear visual feedback

#### **Select** (`select.tsx`)
Dropdown selection component with search and filtering capabilities.

**Components**:
- `Select`, `SelectGroup`, `SelectValue`
- `SelectTrigger`, `SelectContent`, `SelectItem`
- `SelectLabel`, `SelectSeparator`

**Sizes**: `sm`, `default`

**Features**:
- Keyboard navigation
- Search within options
- Custom option rendering

#### **Form** (`form.tsx`)
Comprehensive form handling system using react-hook-form.

**Components**:
- `FormField`, `FormItem`, `FormLabel`
- `FormControl`, `FormDescription`, `FormMessage`

**Features**:
- Automatic validation display
- Error message handling
- Field state management

**Usage Pattern**:
```tsx
<Form>
  <FormField
    control={form.control}
    name="username"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormDescription>Your public username</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

#### **Checkbox** (`checkbox.tsx`)
Selection input with indeterminate state support.

**States**: Unchecked, checked, indeterminate
**Features**: Custom styling, accessibility support

#### **Radio Group** (`radio-group.tsx`)
Single selection from multiple options.

**Components**: `RadioGroup`, `RadioGroupItem`

#### **Switch** (`switch.tsx`)
Toggle input component with RTL support.

**Features**: Smooth animations, accessibility

#### **Label** (`label.tsx`)
Form field labels with proper association.

---

### Navigation & Layout Components

#### **Sidebar** (`sidebar.tsx`)
Complex sidebar navigation system with 20+ sub-components.

**Core Components**:
- `Sidebar` - Main container
- `SidebarProvider` - Context provider
- `SidebarTrigger` - Toggle button
- `SidebarRail` - Resize handle
- `SidebarInset` - Main content area

**Structure Components**:
- `SidebarHeader` - Top section
- `SidebarContent` - Main navigation
- `SidebarFooter` - Bottom section
- `SidebarSeparator` - Visual dividers

**Navigation System**:
- `SidebarGroup` - Navigation groups
- `SidebarGroupLabel` - Group titles
- `SidebarGroupContent` - Group content
- `SidebarGroupAction` - Group actions

**Menu Components**:
- `SidebarMenu` - Menu container
- `SidebarMenuItem` - Individual menu items
- `SidebarMenuButton` - Clickable menu buttons
- `SidebarMenuAction` - Item actions
- `SidebarMenuBadge` - Status badges
- `SidebarMenuSub` - Submenu container
- `SidebarMenuSubItem` - Submenu items
- `SidebarMenuSubButton` - Submenu buttons

**Additional Features**:
- `SidebarInput` - Search within sidebar
- `SidebarMenuSkeleton` - Loading states

**Variants**:
- `sidebar` - Standard sidebar
- `floating` - Floating overlay
- `inset` - Inset within content

**States**:
- Expanded/collapsed
- Mobile/desktop responsive
- Keyboard shortcuts (Cmd/Ctrl + B)

#### **Tabs** (`tabs.tsx`)
Clean tab navigation component.

**Components**:
- `Tabs` - Container
- `TabsList` - Tab navigation
- `TabsTrigger` - Individual tabs
- `TabsContent` - Tab panels

**Features**:
- Keyboard navigation
- Active state styling
- Content lazy loading

#### **Sheet** (`sheet.tsx`)
Slide-out panel component with responsive behavior.

**Variants**: Left, right, top, bottom
**Features**: Backdrop blur, close on outside click

#### **Scroll Area** (`scroll-area.tsx`)
Custom scrollable areas with styled scrollbars.

**Features**:
- Cross-browser scroll styling
- Horizontal and vertical scrolling
- Smooth scrolling behavior

---

### Display Components

#### **Card** (`card.tsx`)
Flexible card component system with container query support.

**Components**:
- `Card` - Main container
- `CardHeader` - Top section with container queries
- `CardTitle` - Card title
- `CardDescription` - Subtitle text
- `CardAction` - Header action buttons
- `CardContent` - Main content area
- `CardFooter` - Bottom actions

**Features**:
- Container query responsive design (`@container/card-header`)
- Flexible layouts
- Action button integration

**Usage**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Revenue</CardTitle>
    <CardDescription>Monthly revenue metrics</CardDescription>
    <CardAction>
      <Button size="sm">View Details</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### **Badge** (`badge.tsx`)
Status and categorization component.

**Variants**: 
- `default` - Primary styling
- `secondary` - Muted styling
- `destructive` - Error/warning
- `outline` - Border-only

**Features**:
- Icon support
- `asChild` pattern for custom elements

#### **Avatar** (`avatar.tsx`)
User profile image component with fallback support.

**Components**: `Avatar`, `AvatarImage`, `AvatarFallback`
**Features**: Automatic fallback to initials, loading states

#### **Alert** (`alert.tsx`)
Information and notification display.

**Components**:
- `Alert` - Container
- `AlertTitle` - Alert title
- `AlertDescription` - Alert content

**Variants**: `default`, `destructive`
**Features**: Icon integration, grid-based layout

#### **Skeleton** (`skeleton.tsx`)
Loading state placeholder component.

**Features**:
- Shimmer animation
- Flexible sizing
- Content shape mimicking

---

### Data Display Components

#### **Table** (`table.tsx`)
Comprehensive table system with responsive design.

**Components**:
- `Table` - Main container
- `TableHeader` - Header section
- `TableBody` - Content rows
- `TableFooter` - Footer section
- `TableRow` - Individual rows
- `TableHead` - Header cells
- `TableCell` - Data cells
- `TableCaption` - Table description

**Features**:
- Horizontal scroll on overflow
- Row selection states
- Hover effects
- Sticky headers (where applicable)

---

### Interactive Components

#### **Button** (`button.tsx`)
Primary interactive component with extensive variant system.

**Variants**:
- `default` - Primary button
- `destructive` - Delete/danger actions
- `outline` - Secondary emphasis
- `secondary` - Lower emphasis
- `ghost` - Minimal styling
- `link` - Link-styled button

**Sizes**:
- `sm` - Small button
- `default` - Standard size
- `lg` - Large button
- `icon` - Icon-only button

**Features**:
- Type-safe variants with class-variance-authority
- `asChild` pattern support
- Loading states
- Disabled states

**Usage**:
```tsx
<Button variant="outline" size="sm">
  Cancel
</Button>
<Button variant="default">
  <Plus className="h-4 w-4" />
  Add User
</Button>
```

#### **Dropdown Menu** (`dropdown-menu.tsx`)
Comprehensive dropdown system with 15+ components.

**Core Components**:
- `DropdownMenu` - Root container
- `DropdownMenuTrigger` - Toggle button
- `DropdownMenuContent` - Menu content
- `DropdownMenuItem` - Individual items

**Selection Components**:
- `DropdownMenuCheckboxItem` - Multi-select items
- `DropdownMenuRadioGroup` - Single-select group
- `DropdownMenuRadioItem` - Radio options

**Organization**:
- `DropdownMenuSeparator` - Visual dividers
- `DropdownMenuLabel` - Section labels
- `DropdownMenuGroup` - Item grouping

**Advanced Features**:
- `DropdownMenuSub` - Nested submenus
- `DropdownMenuShortcut` - Keyboard shortcuts
- `DropdownMenuPortal` - Portal rendering

**Variants**:
- `destructive` - Dangerous actions

---

### Modal & Overlay Components

#### **Dialog** (`dialog.tsx`)
Primary modal system for complex interactions.

**Components**:
- `Dialog` - Root container
- `DialogTrigger` - Open trigger
- `DialogContent` - Modal content
- `DialogHeader` - Modal header
- `DialogTitle` - Modal title
- `DialogDescription` - Modal description
- `DialogFooter` - Action buttons
- `DialogClose` - Close button
- `DialogOverlay` - Background overlay
- `DialogPortal` - Portal rendering

**Features**:
- Configurable close button
- Focus management
- Escape key handling
- Backdrop click closing

#### **Alert Dialog** (`alert-dialog.tsx`)
Confirmation and important action dialogs.

**Features**:
- Blocking interactions
- Confirmation patterns
- Action buttons

#### **Popover** (`popover.tsx`)
Floating content containers for contextual information.

**Features**:
- Smart positioning
- Arrow indicators
- Click-outside closing

#### **Tooltip** (`tooltip.tsx`)
Hover information display component.

**Features**:
- Automatic positioning
- Delay controls
- Touch support

---

### Utility Components

#### **Separator** (`separator.tsx`)
Visual dividers with orientation support.

**Orientations**: Horizontal, vertical
**Features**: Accessible semantics

#### **Calendar** (`calendar.tsx`)
Date selection component built on react-day-picker.

**Features**:
- Month/year navigation
- Date range selection
- Disabled date handling

#### **Command** (`command.tsx`)
Command palette and search interface.

**Features**:
- Fuzzy search
- Keyboard navigation
- Command groups

#### **Collapsible** (`collapsible.tsx`)
Expandable content areas.

**Features**:
- Smooth animations
- Trigger integration
- State management

#### **Sonner** (`sonner.tsx`)
Toast notification system.

**Features**:
- Multiple toast types
- Position control
- Auto-dismiss
- Action buttons

---

## Specialized Component Systems

### Data Table System (`src/components/data-table/`)

Advanced table functionality built on TanStack Table.

#### **DataTableToolbar** (`toolbar.tsx`)
Comprehensive table control interface.

**Features**:
- Global search functionality
- Column-specific filtering
- Faceted filter management
- View options toggle
- Reset functionality
- Bulk action integration

**Search Implementation**:
```tsx
<Input
  placeholder="Filter users..."
  value={table.getColumn("username")?.getFilterValue() as string}
  onChange={(event) =>
    table.getColumn("username")?.setFilterValue(event.target.value)
  }
/>
```

#### **DataTableColumnHeader** (`column-header.tsx`)
Sortable column headers with visual indicators.

**Features**:
- Sort direction indicators
- Click to sort
- Accessibility support
- Custom sort icons

#### **DataTableFacetedFilter** (`faceted-filter.tsx`)
Multi-select filtering component.

**Features**:
- Checkbox-based selection
- Clear filters option
- Badge display for selected filters
- Search within filter options

#### **DataTablePagination** (`pagination.tsx`)
Table pagination controls.

**Features**:
- Page size selection (10, 20, 30, 40, 50)
- Page navigation
- Row count display
- Go-to-page functionality

#### **DataTableViewOptions** (`view-options.tsx`)
Column visibility controls.

**Features**:
- Toggle column visibility
- Select all/none options
- Column reordering (where supported)

#### **BulkActions** (`bulk-actions.tsx`)
Bulk operations for selected rows.

**Features**:
- Multi-row selection
- Batch operations
- Confirmation dialogs
- Progress indicators

### Layout System (`src/components/layout/`)

#### **AppSidebar** (`app-sidebar.tsx`)
Main application sidebar integration.

**Features**:
- Dynamic navigation data
- TeamSwitcher integration
- NavGroup organization
- NavUser profile section
- Responsive behavior

#### **Header** (`header.tsx`)
Application header with advanced functionality.

**Features**:
- Sticky positioning with scroll detection
- Backdrop blur effects
- SidebarTrigger integration
- Search functionality
- Theme switching
- Configuration drawer
- Profile dropdown

**Scroll Behavior**:
```tsx
useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 10)
  }
  // Backdrop blur when scrolled
}, [])
```

#### **AuthenticatedLayout** (`authenticated-layout.tsx`)
Main application layout wrapper.

**Features**:
- Multiple context providers
- Sidebar state management
- Container query setup
- Responsive design
- Cookie-based state persistence

#### **Main** (`main.tsx`)
Main content container with layout modes.

**Features**:
- Fixed/fluid layout modes
- Container query support
- Responsive max-width constraints
- Padding and margin management

#### **NavGroup** (`nav-group.tsx`)
Navigation group organization component.

**Features**:
- Collapsible groups
- Icon integration
- Badge support
- Hierarchical structure

#### **NavUser** (`nav-user.tsx`)
User profile navigation section.

**Features**:
- User avatar display
- Quick actions
- Profile dropdown integration

#### **TeamSwitcher** (`team-switcher.tsx`)
Organization/team switching interface.

**Features**:
- Team selection
- Organization management
- Visual indicators

#### **TopNav** (`top-nav.tsx`)
Top navigation bar for additional navigation.

**Features**:
- Horizontal navigation
- Demo link integration
- Responsive behavior

#### **AppTitle** (`app-title.tsx`)
Application branding component.

**Features**:
- Logo integration
- Application name display
- Responsive sizing

---

## Custom Application Components

### **ComingSoon** (`coming-soon.tsx`)
Placeholder component for future features.

### **CommandMenu** (`command-menu.tsx`)
Global command palette (Cmd/Ctrl + K).

**Features**:
- Page navigation
- Quick actions
- Search functionality
- Keyboard shortcuts

### **ConfigDrawer** (`config-drawer.tsx`)
Configuration panel for layout settings.

**Features**:
- Layout mode selection (Fixed/Fluid)
- Sidebar style selection (Sidebar/Floating/Inset)
- Theme selection
- Real-time preview

### **ConfirmDialog** (`confirm-dialog.tsx`)
Reusable confirmation dialog component.

### **DatePicker** (`date-picker.tsx`)
Enhanced date selection component.

**Features**:
- Calendar popup
- Date formatting
- Range selection support

### **LearnMore** (`learn-more.tsx`)
Educational component with expandable content.

### **LongText** (`long-text.tsx`)
Text truncation and expansion component.

**Features**:
- Configurable character limits
- "Show more/less" functionality
- Smooth transitions

### **NavigationProgress** (`navigation-progress.tsx`)
Page loading progress indicator.

### **PasswordInput** (`password-input.tsx`)
Password input with visibility toggle.

**Features**:
- Show/hide password
- Strength indicators
- Validation support

### **ProfileDropdown** (`profile-dropdown.tsx`)
User profile dropdown menu.

**Features**:
- User information display
- Quick actions
- Sign-out functionality

### **Search** (`search.tsx`)
Global search component.

**Features**:
- Real-time search
- Result highlighting
- Keyboard navigation

### **SelectDropdown** (`select-dropdown.tsx`)
Enhanced select component wrapper.

### **SignOutDialog** (`sign-out-dialog.tsx`)
Sign-out confirmation dialog.

### **SkipToMain** (`skip-to-main.tsx`)
Accessibility skip link component.

### **ThemeSwitch** (`theme-switch.tsx`)
Theme selection component.

**Options**: Light, Dark, System
**Features**: Real-time theme switching

---

## Design System Patterns

### **Component Composition**
Components are built to work together seamlessly:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Users</CardTitle>
    <CardAction>
      <Button onClick={handleAddUser}>Add User</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <DataTable />
  </CardContent>
</Card>
```

### **Variant Systems**
Type-safe variants using class-variance-authority:

```tsx
const badgeVariants = cva("base-styles", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      outline: "border-border text-foreground"
    }
  },
  defaultVariants: { variant: "default" }
})
```

### **asChild Pattern**
Flexible component composition:

```tsx
<Button asChild>
  <Link to="/users">View Users</Link>
</Button>
```

### **Provider Pattern**
Context-based state management:

```tsx
<SidebarProvider>
  <Sidebar />
  <SidebarInset>
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

This comprehensive component catalog provides the foundation for building consistent, accessible, and maintainable user interfaces within the shadcn-admin system.