# System Architecture

## Overview

**shadcn-admin** is a modern React admin dashboard built with a focus on performance, accessibility, and developer experience. It provides a comprehensive foundation for building admin interfaces with consistent design patterns and reusable components.

## Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | ^19.1.1 |
| **TypeScript** | Type Safety | ~5.9.2 |
| **Vite** | Build Tool & Dev Server | ^7.1.2 |
| **TanStack Router** | File-based Routing | ^1.131.16 |
| **TanStack Query** | Server State Management | ^5.85.3 |
| **TanStack Table** | Data Tables | ^8.21.3 |
| **Tailwind CSS** | Styling Framework | ^4.1.12 |
| **Radix UI** | Headless UI Primitives | Various |
| **shadcn/ui** | Component Library | Latest |
| **Clerk** | Authentication (Optional) | ^5.42.1 |
| **React Hook Form** | Form Management | ^7.62.0 |
| **Zod** | Schema Validation | ^4.0.17 |
| **Zustand** | Local State Management | ^5.0.7 |

## Project Structure

```
src/
├── assets/                 # Static assets and icons
│   ├── brand-icons/        # Third-party service icons
│   ├── custom/             # Custom SVG icons
│   └── logo.tsx            # Application logo
├── components/             # Reusable components
│   ├── data-table/         # Table component system
│   ├── layout/             # Layout components
│   ├── ui/                 # shadcn/ui components (30+ components)
│   └── [feature-components] # Specific components
├── config/                 # Configuration files
├── context/                # React Context providers
├── features/               # Feature-based modules
│   ├── apps/              # App integrations feature
│   ├── auth/              # Authentication pages
│   ├── chats/             # Chat interface
│   ├── dashboard/         # Dashboard feature
│   ├── errors/            # Error pages
│   ├── settings/          # Settings feature
│   ├── tasks/             # Task management
│   └── users/             # User management
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── routes/                 # File-based routing structure
└── stores/                 # Global state stores
```

## Architecture Principles

### 1. Feature-First Organization
- Features are self-contained modules in `src/features/`
- Each feature contains its own components, data, and logic
- Features can share common components from `src/components/`

### 2. File-Based Routing
Using TanStack Router for type-safe, file-based routing:

```
routes/
├── __root.tsx              # Root layout
├── (auth)/                 # Public auth routes
├── (errors)/               # Error pages
├── _authenticated/         # Protected routes
│   ├── route.tsx          # Authenticated layout
│   ├── index.tsx          # Dashboard
│   ├── users/index.tsx    # Users page
│   ├── tasks/index.tsx    # Tasks page
│   ├── apps/index.tsx     # Apps page
│   ├── chats/index.tsx    # Chats page
│   └── settings/          # Settings routes
└── clerk/                  # Clerk-specific routes
```

### 3. Component Hierarchy

```
App Root (__root.tsx)
├── Navigation Progress
├── Toast Notifications (Sonner)
├── Development Tools
└── Route Outlet
    ├── Auth Pages (public)
    └── Authenticated Layout
        ├── Sidebar Provider
        ├── App Sidebar
        └── Sidebar Inset
            ├── Header
            └── Main Content
```

### 4. State Management Strategy

#### Global State (Zustand)
- **Auth Store** (`src/stores/auth-store.ts`): Authentication state
- Minimal global state, prefer local component state

#### Context Providers
- **LayoutProvider**: Layout configuration (fixed/fluid)
- **ThemeProvider**: Theme management (light/dark/system)
- **SearchProvider**: Global search functionality
- **DirectionProvider**: RTL/LTR text direction
- **FontProvider**: Font configuration

#### Feature State
- Each feature manages its own state through context providers
- **UsersProvider**: User management state
- **TasksProvider**: Task management state

### 5. Data Flow Patterns

#### Server State (TanStack Query)
- API calls and server state caching
- Background refetching and optimistic updates
- Error handling and retry logic

#### Form State (React Hook Form + Zod)
```typescript
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { /* */ }
})
```

#### URL State
- Search parameters for table filtering
- Custom hook `useTableUrlState` for persistence

## Routing Architecture

### Route Groups
- `(auth)`: Public authentication pages
- `(errors)`: Error handling pages
- `_authenticated`: Protected application routes
- `clerk`: Clerk-specific authentication flow

### Route Protection
```typescript
// _authenticated/route.tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    // Authentication check
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: AuthenticatedLayout,
})
```

### Layout Nesting
- Root layout provides global providers and notifications
- Authenticated layout adds sidebar and header
- Feature layouts can add additional structure

## Component Architecture

### UI Component System
Based on **shadcn/ui** with 30+ components:
- **Atomic**: Button, Input, Badge, etc.
- **Composite**: Form, DataTable, Sidebar, etc.
- **Layout**: Card, Sheet, Dialog, etc.

### Component Variants
Using `class-variance-authority` for type-safe variants:
```typescript
const buttonVariants = cva("base-styles", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { sm: "...", default: "...", lg: "..." }
  }
})
```

### Component Composition
- **Slot Pattern**: Components accept `asChild` prop
- **Compound Components**: Multi-part components like Form, Dialog
- **Provider Pattern**: Components with context (Sidebar, Form)

## Styling Architecture

### Tailwind CSS Configuration
- **Container Queries**: `@container` support
- **Custom Animations**: Extended animation utilities
- **Design Tokens**: CSS custom properties for themes
- **RTL Support**: Direction-aware utilities

### Theme System
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Responsive Design
- **Mobile First**: Design system starts with mobile
- **Container Queries**: Component-level responsiveness
- **Breakpoints**: Custom breakpoint system

## Authentication Architecture

### Dual Authentication Support
1. **Custom Auth**: Forms with React Hook Form + Zod validation
2. **Clerk Integration**: Drop-in authentication service

### Route Structure
```
routes/
├── (auth)/           # Custom auth pages
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── forgot-password.tsx
│   └── otp.tsx
└── clerk/            # Clerk auth pages
    ├── sign-in.tsx
    └── sign-up.tsx
```

## Data Management

### API Integration
- **Axios**: HTTP client with interceptors
- **Mock Data**: Development data using @faker-js/faker
- **Error Handling**: Centralized error handling

### Table Data Management
- **TanStack Table**: Sorting, filtering, pagination
- **URL Synchronization**: Table state persisted in URL
- **Bulk Operations**: Multi-row selection and actions

## Development Tooling

### Code Quality
- **ESLint**: Code linting with React and Query plugins
- **Prettier**: Code formatting with import sorting
- **TypeScript**: Strict type checking
- **Knip**: Unused code detection

### Development Experience
- **Vite HMR**: Fast development server
- **TanStack DevTools**: Router and Query debugging
- **Type Safety**: End-to-end type safety with Zod schemas

## Build & Deployment

### Build Process
1. **TypeScript Compilation**: `tsc -b`
2. **Vite Build**: Production optimization
3. **Asset Optimization**: CSS/JS minification
4. **Static Generation**: Pre-built routes

### Environment Support
- Development with hot reload
- Production with optimization
- Preview mode for testing builds

## Performance Considerations

### Bundle Optimization
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Route-based splitting
- **Dynamic Imports**: Lazy loading for large features

### Runtime Performance
- **React 19**: Latest performance optimizations
- **Memoization**: Strategic use of useMemo/useCallback
- **Virtual Scrolling**: Large list optimization (where applicable)

### Accessibility
- **ARIA Support**: Full screen reader support
- **Keyboard Navigation**: Complete keyboard accessibility
- **Focus Management**: Proper focus handling in modals/dialogs
- **Semantic HTML**: Proper HTML structure

## Scalability Patterns

### Adding New Features
1. Create feature folder in `src/features/`
2. Add route files in `src/routes/`
3. Implement feature components and logic
4. Add to sidebar navigation if needed

### Component Extension
- Extend existing shadcn/ui components
- Create custom variants using CVA
- Maintain consistent design patterns

### State Management Growth
- Add feature-specific context providers
- Use Zustand for truly global state
- Keep local state when possible

This architecture provides a solid foundation for building scalable, maintainable admin interfaces with modern React patterns and excellent developer experience.