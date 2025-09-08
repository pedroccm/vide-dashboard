# Screens and Pages Documentation

## Overview

The shadcn-admin application contains **15+ unique screens** organized into logical sections with comprehensive navigation. This document provides a complete inventory of all pages, their purposes, and key functionality.

## Navigation Structure

### Sidebar Navigation
The main navigation is organized in three sections:

#### **General Section**
- Dashboard (Main landing page)
- Tasks (Task management system)
- Apps (Third-party integrations)
- Chats (Messaging interface) - *Shows badge "3"*
- Users (User management)
- Secured by Clerk (Authentication demos)

#### **Pages Section**
- Auth (Authentication examples)
- Errors (Error page demonstrations)

#### **Other Section**
- Settings (Configuration pages)
- Help Center (Support placeholder)

---

## Main Application Screens

### 1. Dashboard (`/_authenticated/`)
**File**: `src/features/dashboard/index.tsx`  
**Route**: `src/routes/_authenticated/index.tsx`

#### Purpose
Main landing page displaying key business metrics and overview data.

#### Key Features
- **Metric Cards**: Revenue, subscriptions, sales, and active users
- **Overview Chart**: Visual data representation using Recharts
- **Recent Sales Table**: Latest transaction data
- **Tab Navigation**: Overview, Analytics, Reports, Notifications
- **Top Navigation Bar**: Team switching and demo links (disabled)

#### Components Used
- `Card` with CardHeader, CardContent, CardFooter
- `Tabs` with TabsList, TabsTrigger, TabsContent
- `Button` for actions
- `Overview` component for charts
- `RecentSales` component for transaction list

#### Mock Data
Displays sample revenue ($45,231.89), subscription counts (+2350), sales (+12,234), and activity metrics (+573).

---

### 2. User Management (`/_authenticated/users/`)
**File**: `src/features/users/index.tsx`  
**Route**: `src/routes/_authenticated/users/index.tsx`

#### Purpose
Comprehensive user management system with CRUD operations.

#### Key Features
- **Advanced Data Table**: Sortable, filterable, paginated
- **Search Functionality**: Global search across user data
- **Filtering Options**: By status (Active, Inactive) and role (Admin, User, Moderator)
- **Bulk Operations**: Multi-select for bulk actions
- **User Actions**: View, Edit, Delete individual users
- **Modal Dialogs**: User creation and editing forms

#### Search Parameters
- `page`: Current page number
- `pageSize`: Items per page (10, 20, 30, 40, 50)
- `status`: Filter by user status
- `role`: Filter by user role
- `username`: Text search filter

#### Components Used
- `UsersTable` with TanStack Table integration
- `UsersPrimaryButtons` for action buttons
- `UsersDialogs` for modals
- `DataTableToolbar` for search and filters
- `UsersProvider` for state management

---

### 3. Task Management (`/_authenticated/tasks/`)
**File**: `src/features/tasks/index.tsx`  
**Route**: `src/routes/_authenticated/tasks/index.tsx`

#### Purpose
Task management system for tracking work items and projects.

#### Key Features
- **Task Table**: Comprehensive task listing with metadata
- **Status Management**: Todo, In Progress, Done, Canceled
- **Priority Levels**: Low, Medium, High priority sorting
- **Task Import**: CSV/Excel import functionality
- **Bulk Operations**: Multi-task management
- **Task Creation**: Modal-based task creation

#### Search Parameters
- `page`: Current page number
- `pageSize`: Items per page
- `status`: Filter by task status
- `priority`: Filter by priority level
- `filter`: Text search across task data

#### Task Properties
- ID, Title, Status, Label, Priority
- Creation date and metadata
- Assignee information

---

### 4. App Integrations (`/_authenticated/apps/`)
**File**: `src/features/apps/index.tsx`  
**Route**: `src/routes/_authenticated/apps/index.tsx`

#### Purpose
Manage third-party application integrations and connections.

#### Key Features
- **App Grid Layout**: Visual card-based interface
- **Connection Management**: Connect/disconnect apps
- **Filter Options**: All, Connected, Not Connected
- **Search Functionality**: Find apps by name
- **Sort Options**: Name, status-based sorting

#### Available Integrations
**Connected Apps**:
- Stripe (Payment processing)
- Figma (Design collaboration)
- GitHub (Version control)
- GitLab (DevOps platform)

**Available Apps**:
- Discord, Docker, Facebook, Gmail, Medium
- Notion, Skype, Slack, Telegram, Trello
- WhatsApp, Zoom

#### Search Parameters
- `type`: Filter by app category
- `filter`: Connection status filter
- `sort`: Sorting preference

---

### 5. Chat Interface (`/_authenticated/chats/`)
**File**: `src/features/chats/index.tsx`  
**Route**: `src/routes/_authenticated/chats/index.tsx`

#### Purpose
Real-time messaging interface with conversation management.

#### Key Features
- **Split Layout**: Contact list + chat window
- **Message Grouping**: Messages grouped by date
- **Contact List**: Users with status indicators
- **Mobile Responsive**: Optimized mobile experience
- **New Chat Dialog**: Start new conversations
- **Message History**: Persistent conversation data

#### Mock Conversations
- **Sofia Davis**: Recent active conversation
- **Jackson Lee**: Design system discussions
- **Isabella Nguyen**: Meeting scheduling
- **William Kim**: Project updates
- **Sofia Davis**: Multiple conversation threads

#### Message Features
- Timestamp display
- Message status indicators
- Contact avatars and status

---

### 6. Settings System (`/_authenticated/settings/`)
**File**: `src/features/settings/index.tsx`  
**Route**: `src/routes/_authenticated/settings/index.tsx`

#### Purpose
Application configuration and user preferences management.

#### Settings Categories

##### **Profile Settings** (`/settings/`)
- Personal information management
- Avatar upload and display name
- Bio and personal details
- Account profile customization

##### **Account Settings** (`/settings/account`)
- Account security settings
- Password management
- Account preferences
- Privacy settings

##### **Appearance Settings** (`/settings/appearance`)
- Theme selection (Light, Dark, System)
- Color scheme customization
- UI preferences
- Visual customization options

##### **Notifications** (`/settings/notifications`)
- Email notification preferences
- Push notification settings
- Communication preferences
- Alert configurations

##### **Display Settings** (`/settings/display`)
- Layout preferences (Fixed, Fluid)
- Sidebar behavior (Sidebar, Floating, Inset)
- Typography settings
- Layout customization

#### Navigation
- **Sidebar Navigation**: Category-based organization
- **Responsive Design**: Mobile-optimized settings interface
- **Form Validation**: Comprehensive form handling with Zod

---

## Authentication Screens

### Custom Authentication Routes (`/(auth)/`)

#### **Sign In** (`/sign-in`)
**File**: `src/features/auth/sign-in/index.tsx`
- Email/password authentication
- Form validation with React Hook Form
- "Remember me" functionality
- Forgot password link
- Sign up redirect

#### **Alternative Sign In** (`/sign-in-2`)
**File**: `src/features/auth/sign-in/sign-in-2.tsx`
- Alternative sign-in design
- Same functionality, different UI layout

#### **Sign Up** (`/sign-up`)
**File**: `src/features/auth/sign-up/index.tsx`
- User registration form
- Email verification workflow
- Terms and conditions acceptance
- Sign in redirect

#### **Forgot Password** (`/forgot-password`)
**File**: `src/features/auth/forgot-password/index.tsx`
- Password reset request
- Email-based recovery
- Return to sign-in option

#### **OTP Verification** (`/otp`)
**File**: `src/features/auth/otp/index.tsx`
- One-time password input
- 6-digit verification code
- Resend code functionality
- Auto-submission on completion

### Clerk Authentication Routes (`/clerk/`)

#### **Clerk Sign In** (`/clerk/sign-in`)
- Clerk-managed authentication
- Social logins integration
- Enterprise SSO support

#### **Clerk Sign Up** (`/clerk/sign-up`)
- Clerk-managed registration
- Social signup options

#### **User Management** (`/clerk/user-management`)
- Clerk user management interface
- Admin user controls

---

## Error Pages (`/(errors)/`)

### **401 Unauthorized** (`/errors/401`)
**File**: `src/features/errors/unauthorized-error.tsx`
- Access denied message
- Authentication required prompt
- Return to sign-in option

### **403 Forbidden** (`/errors/403`)
**File**: `src/features/errors/forbidden.tsx`
- Permission denied message
- Contact administrator prompt
- Navigation options

### **404 Not Found** (`/errors/404`)
**File**: `src/features/errors/not-found-error.tsx`
- Page not found message
- Search functionality
- Navigation suggestions
- Return home option

### **500 Internal Server Error** (`/errors/500`)
**File**: `src/features/errors/general-error.tsx`
- Server error message
- Retry functionality
- Support contact information

### **503 Service Unavailable** (`/errors/503`)
**File**: `src/features/errors/maintenance-error.tsx`
- Maintenance mode message
- Estimated downtime
- Status page link

---

## Special Pages

### **Help Center** (`/_authenticated/help-center/`)
**Route**: `src/routes/_authenticated/help-center/index.tsx`
- Coming soon placeholder
- Support resources
- Documentation links

### **Dynamic Error Handler** (`/_authenticated/errors/$error`)
**Route**: `src/routes/_authenticated/errors/$error.tsx`
- Dynamic error handling
- Error-specific content
- Recovery suggestions

---

## Layout Structure

### **Root Layout** (`__root.tsx`)
- Navigation progress indicator
- Toast notification system
- Development tools (dev mode only)
- Global error boundary

### **Authenticated Layout** (`_authenticated/route.tsx`)
**File**: `src/components/layout/authenticated-layout.tsx`
- Sidebar navigation system
- Header with search and profile
- Main content container
- Responsive mobile behavior

### **Auth Layout** (`(auth)` routes)
**File**: `src/features/auth/auth-layout.tsx`
- Centered authentication forms
- Branding and logo
- Clean, minimal design
- Responsive layout

---

## Page-Level Features

### **Search Integration**
- Global search via Cmd/Ctrl + K
- Page-specific search in Users, Tasks, Apps
- Real-time filtering and results

### **URL State Management**
- Search parameters preservation
- Shareable filtered views
- Browser back/forward support

### **Responsive Design**
- Mobile-first approach
- Tablet optimizations
- Desktop enhancements
- Container queries for components

### **Loading States**
- Skeleton loading components
- Progress indicators
- Smooth transitions

### **Data Persistence**
- Local storage for preferences
- Cookie-based sidebar state
- URL-based filter states

This comprehensive screen documentation provides a complete overview of all pages, their functionality, and navigation structure within the shadcn-admin application.