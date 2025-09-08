# Development Guide

## Getting Started

### Prerequisites
- **Node.js**: Version 18 or higher
- **Package Manager**: pnpm (recommended), npm, or yarn
- **Git**: For version control

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/satnaing/shadcn-admin.git
cd shadcn-admin
```

2. **Install Dependencies**
```bash
pnpm install
```

3. **Start Development Server**
```bash
pnpm run dev
```

4. **Open in Browser**
Navigate to `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server with HMR |
| `pnpm run build` | Build for production |
| `pnpm run lint` | Run ESLint code linting |
| `pnpm run preview` | Preview production build locally |
| `pnpm run format:check` | Check code formatting |
| `pnpm run format` | Format code with Prettier |
| `pnpm run knip` | Detect unused code and dependencies |

---

## Project Structure Deep Dive

### File Naming Conventions

- **Components**: PascalCase (`UserTable.tsx`)
- **Hooks**: camelCase with `use` prefix (`useTableState.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase (`User.ts`, `ApiResponse.ts`)

### Folder Organization

```
src/
├── assets/                 # Static assets
│   ├── brand-icons/        # Third-party brand SVG icons
│   ├── custom/             # Custom application icons
│   └── [brand-assets]      # Logos and branding
├── components/             # Reusable UI components
│   ├── ui/                 # shadcn/ui base components
│   ├── data-table/         # Data table system
│   ├── layout/             # Layout-specific components
│   └── [shared-components] # Application-wide shared components
├── config/                 # Configuration files
│   └── fonts.ts            # Font configuration
├── context/                # React Context providers
│   ├── theme-provider.tsx  # Theme management
│   ├── layout-provider.tsx # Layout configuration
│   └── [other-providers]   # Feature-specific contexts
├── features/               # Feature modules (business logic)
│   └── [feature-name]/     # Self-contained feature modules
│       ├── components/     # Feature-specific components
│       ├── data/           # Mock data and schemas
│       └── index.tsx       # Feature entry point
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and helpers
├── routes/                 # File-based routing (TanStack Router)
│   ├── __root.tsx          # Root layout
│   ├── (auth)/             # Auth route group
│   ├── _authenticated/     # Protected route group
│   └── [other-routes]      # Additional route definitions
└── stores/                 # Global state management (Zustand)
```

---

## Development Workflow

### Adding New Pages

1. **Create Route File**
```bash
# For public pages
touch src/routes/new-page.tsx

# For authenticated pages  
touch src/routes/_authenticated/new-feature.tsx
```

2. **Route File Template**
```tsx
import { createFileRoute } from '@tanstack/react-router'
import { NewFeaturePage } from '@/features/new-feature'

export const Route = createFileRoute('/_authenticated/new-feature')({
  component: NewFeaturePage,
})
```

3. **Create Feature Module**
```bash
mkdir src/features/new-feature
touch src/features/new-feature/index.tsx
mkdir src/features/new-feature/components
```

4. **Feature Entry Point**
```tsx
// src/features/new-feature/index.tsx
export function NewFeaturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Feature</h1>
        <p className="text-muted-foreground">
          Feature description goes here.
        </p>
      </div>
      {/* Feature content */}
    </div>
  )
}
```

5. **Add to Navigation** (if needed)
```tsx
// src/components/layout/data/sidebar-data.ts
export const sidebarData = {
  navGroups: [
    {
      title: "General",
      items: [
        // existing items...
        {
          title: "New Feature",
          url: "/new-feature",
          icon: NewFeatureIcon,
        },
      ]
    }
  ]
}
```

### Creating New Components

#### 1. UI Components (extending shadcn/ui)

```tsx
// src/components/ui/custom-component.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const customVariants = cva(
  "base-class-styles",
  {
    variants: {
      variant: {
        default: "variant-styles",
        secondary: "secondary-styles",
      },
      size: {
        sm: "small-styles",
        default: "default-styles",
        lg: "large-styles",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CustomComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof customVariants> {}

const CustomComponent = React.forwardRef<
  HTMLDivElement,
  CustomComponentProps
>(({ className, variant, size, ...props }, ref) => (
  <div
    className={cn(customVariants({ variant, size, className }))}
    ref={ref}
    {...props}
  />
))
CustomComponent.displayName = "CustomComponent"

export { CustomComponent, customVariants }
```

#### 2. Feature Components

```tsx
// src/features/[feature]/components/feature-component.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FeatureComponentProps {
  title: string
  onAction: () => void
}

export function FeatureComponent({ title, onAction }: FeatureComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onAction}>Action</Button>
      </CardContent>
    </Card>
  )
}
```

### Form Development Pattern

#### 1. Define Schema
```tsx
// src/features/[feature]/data/schema.ts
import { z } from "zod"

export const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(['admin', 'user', 'moderator']),
  isActive: z.boolean().default(true),
})

export type User = z.infer<typeof userSchema>
```

#### 2. Create Form Component
```tsx
// src/features/[feature]/components/user-form.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userSchema, type User } from "../data/schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface UserFormProps {
  defaultValues?: Partial<User>
  onSubmit: (values: User) => void
}

export function UserForm({ defaultValues, onSubmit }: UserFormProps) {
  const form = useForm<User>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      role: "user",
      isActive: true,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Data Table Development

#### 1. Define Column Structure
```tsx
// src/features/[feature]/components/columns.tsx
import { createColumnHelper } from "@tanstack/react-table"
import { User } from "../data/schema"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table/column-header"

const columnHelper = createColumnHelper<User>()

export const columns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  }),
  
  columnHelper.accessor("username", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ getValue }) => getValue(),
  }),
  
  columnHelper.accessor("role", {
    header: "Role",
    cell: ({ getValue }) => (
      <Badge variant="secondary">{getValue()}</Badge>
    ),
  }),
]
```

#### 2. Create Table Component
```tsx
// src/features/[feature]/components/data-table.tsx
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { useTableUrlState } from "@/hooks/use-table-url-state"

interface UserDataTableProps {
  data: User[]
}

export function UserDataTable({ data }: UserDataTableProps) {
  const { tableState, setTableState } = useTableUrlState({
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [],
    columnFilters: [],
  })

  return (
    <DataTable
      columns={columns}
      data={data}
      state={tableState}
      onStateChange={setTableState}
    />
  )
}
```

---

## Styling Guidelines

### Tailwind CSS Best Practices

#### 1. Component Styling
```tsx
// Good: Use semantic class combinations
<div className="flex items-center gap-2 rounded-md bg-card p-4 shadow-sm">
  
// Good: Use consistent spacing scale
<div className="space-y-4"> {/* or gap-4, p-4, m-4 */}

// Good: Use design system colors
<div className="bg-background text-foreground border-border">
```

#### 2. Responsive Design
```tsx
// Mobile-first responsive design
<div className="flex flex-col md:flex-row">
<div className="text-sm md:text-base lg:text-lg">

// Container queries for component-level responsiveness
<div className="@container">
  <div className="@md:flex @md:items-center">
</div>
```

#### 3. Dark Mode Support
```tsx
// Colors automatically support dark mode
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground border-border">

// Avoid hardcoded colors
<div className="bg-white text-black"> {/* ❌ Bad */}
<div className="bg-background text-foreground"> {/* ✅ Good */}
```

### CSS Custom Properties

The application uses CSS custom properties for theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more properties */
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}
```

---

## State Management Patterns

### Context Provider Pattern

#### 1. Create Provider
```tsx
// src/features/[feature]/components/provider.tsx
import { createContext, useContext, useState, type ReactNode } from "react"

interface FeatureState {
  selectedItems: string[]
  isDialogOpen: boolean
}

interface FeatureContextValue extends FeatureState {
  setSelectedItems: (items: string[]) => void
  setIsDialogOpen: (open: boolean) => void
}

const FeatureContext = createContext<FeatureContextValue | null>(null)

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <FeatureContext.Provider
      value={{
        selectedItems,
        isDialogOpen,
        setSelectedItems,
        setIsDialogOpen,
      }}
    >
      {children}
    </FeatureContext.Provider>
  )
}

export function useFeature() {
  const context = useContext(FeatureContext)
  if (!context) {
    throw new Error("useFeature must be used within FeatureProvider")
  }
  return context
}
```

#### 2. Use in Component
```tsx
// src/features/[feature]/index.tsx
import { FeatureProvider, useFeature } from "./components/provider"

function FeatureContent() {
  const { selectedItems, setSelectedItems } = useFeature()
  
  return (
    <div>
      {/* Component content */}
    </div>
  )
}

export function FeaturePage() {
  return (
    <FeatureProvider>
      <FeatureContent />
    </FeatureProvider>
  )
}
```

### URL State Management

```tsx
// src/hooks/use-table-url-state.ts
import { useNavigate, useSearch } from "@tanstack/react-router"

export function useTableUrlState<T>(defaultState: T) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  
  const updateState = (newState: Partial<T>) => {
    navigate({
      search: (prev) => ({ ...prev, ...newState }),
    })
  }
  
  return {
    state: { ...defaultState, ...search },
    setState: updateState,
  }
}
```

---

## Testing Guidelines

### Component Testing Setup

```tsx
// src/components/__tests__/Button.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "../ui/button"

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("handles click events", async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole("button"))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("applies variant classes correctly", () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole("button")).toHaveClass("bg-destructive")
  })
})
```

### Form Testing

```tsx
// src/features/users/components/__tests__/UserForm.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserForm } from "../user-form"

describe("UserForm", () => {
  it("submits form with valid data", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    
    render(<UserForm onSubmit={onSubmit} />)
    
    await user.type(screen.getByLabelText(/username/i), "testuser")
    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.click(screen.getByRole("button", { name: /submit/i }))
    
    expect(onSubmit).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
      role: "user",
      isActive: true,
    })
  })
  
  it("shows validation errors", async () => {
    const user = userEvent.setup()
    
    render(<UserForm onSubmit={jest.fn()} />)
    await user.click(screen.getByRole("button", { name: /submit/i }))
    
    expect(screen.getByText(/username is required/i)).toBeInTheDocument()
  })
})
```

---

## Performance Optimization

### Code Splitting

```tsx
// Lazy load heavy components
import { lazy, Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const HeavyChart = lazy(() => import("./components/heavy-chart"))

export function Dashboard() {
  return (
    <div>
      <Suspense fallback={<Skeleton className="h-[300px]" />}>
        <HeavyChart />
      </Suspense>
    </div>
  )
}
```

### Memoization

```tsx
import { memo, useMemo, useCallback } from "react"

// Memoize expensive calculations
function ExpensiveComponent({ data }: { data: Item[] }) {
  const processedData = useMemo(() => {
    return data.map(item => expensiveProcessing(item))
  }, [data])
  
  const handleClick = useCallback((id: string) => {
    // Handle click
  }, [])
  
  return <div>{/* Component content */}</div>
}

// Memoize component to prevent unnecessary re-renders
export default memo(ExpensiveComponent)
```

### Virtual Scrolling

```tsx
import { FixedSizeList as List } from "react-window"

function VirtualizedList({ items }: { items: Item[] }) {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <ItemComponent item={items[index]} />
    </div>
  )
  
  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={60}
    >
      {Row}
    </List>
  )
}
```

---

## RTL Support

The application includes comprehensive RTL (Right-to-Left) support for Arabic, Hebrew, and other RTL languages.

### RTL Implementation

#### 1. Direction Provider
```tsx
// src/context/direction-provider.tsx
import { createContext, useContext } from "react"

const DirectionContext = createContext<{
  direction: 'ltr' | 'rtl'
  setDirection: (dir: 'ltr' | 'rtl') => void
}>()

export function DirectionProvider({ children }) {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')
  
  useEffect(() => {
    document.documentElement.setAttribute('dir', direction)
  }, [direction])
  
  return (
    <DirectionContext.Provider value={{ direction, setDirection }}>
      {children}
    </DirectionContext.Provider>
  )
}
```

#### 2. RTL-Aware Components
Several components have been updated for RTL support:
- `alert-dialog`, `calendar`, `command`, `dialog`
- `dropdown-menu`, `select`, `table`, `sheet`
- `sidebar`, `switch`

#### 3. RTL Styling
```css
/* Tailwind RTL utilities */
.rtl\:space-x-reverse > * + * {
  margin-right: var(--tw-space-x-reverse);
  margin-left: calc(var(--tw-space-x) * calc(1 - var(--tw-space-x-reverse)));
}

/* Custom RTL properties */
[dir="rtl"] .sidebar {
  right: 0;
  left: auto;
}
```

---

## Deployment

### Build Process

```bash
# Type checking
pnpm run build
# This runs: tsc -b && vite build

# Preview production build
pnpm run preview
```

### Environment Variables

```env
# .env.local
VITE_APP_TITLE="Shadcn Admin"
VITE_API_BASE_URL="https://api.example.com"
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

### Production Considerations

1. **Bundle Analysis**
```bash
# Analyze bundle size
npx vite-bundle-analyzer dist
```

2. **Performance Monitoring**
- Implement error boundaries
- Add performance monitoring
- Monitor Core Web Vitals

3. **Security**
- Implement CSP headers
- Sanitize user inputs
- Validate all forms server-side

---

## Troubleshooting

### Common Issues

#### 1. Module Resolution Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. Type Errors
```bash
# Regenerate route types
pnpm run dev  # Routes are auto-generated
```

#### 3. Styling Issues
```bash
# Rebuild Tailwind
pnpm run build:css  # If available
```

#### 4. Development Server Issues
```bash
# Check port availability
lsof -ti:5173
# Kill process if needed
kill -9 <PID>
```

### Debugging Tips

1. **Use Browser DevTools**
   - React Developer Tools
   - TanStack Router DevTools
   - TanStack Query DevTools

2. **Console Debugging**
```tsx
// Add debug logs in development
if (import.meta.env.DEV) {
  console.log('Debug info:', data)
}
```

3. **Error Boundaries**
```tsx
import { ErrorBoundary } from "react-error-boundary"

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  )
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

---

## Contributing

### Code Style

1. **Follow existing patterns**
2. **Use TypeScript consistently**
3. **Write self-documenting code**
4. **Add JSDoc for complex functions**
5. **Test your changes**

### Pull Request Process

1. **Fork and clone**
2. **Create feature branch**
3. **Make changes following conventions**
4. **Test thoroughly**
5. **Submit pull request with clear description**

### Code Review Checklist

- [ ] Follows coding conventions
- [ ] Includes proper TypeScript types
- [ ] Has appropriate error handling
- [ ] Includes tests for new functionality
- [ ] Updates documentation if needed
- [ ] Maintains accessibility standards
- [ ] Supports RTL languages (if applicable)

This development guide provides comprehensive information for working with the shadcn-admin codebase effectively.