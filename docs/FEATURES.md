# Features Documentation

## Overview

The shadcn-admin application is built around **6 main feature modules**, each self-contained with its own components, data management, and business logic. This document provides detailed analysis of each feature's functionality, architecture, and implementation patterns.

---

## Feature Architecture Pattern

Each feature follows a consistent structure:

```
src/features/[feature-name]/
├── components/          # Feature-specific components
├── data/               # Mock data and schemas
├── index.tsx           # Main feature export
└── [sub-features]/     # Feature subdivisions
```

### Common Patterns
- **Context Providers**: Each complex feature has its own state management
- **TanStack Table Integration**: Data-heavy features use advanced table functionality
- **Form Management**: React Hook Form + Zod validation
- **URL State Synchronization**: Search parameters for shareable views
- **Mock Data**: Faker.js for realistic development data

---

## Dashboard Feature

### **Location**: `src/features/dashboard/`
### **Route**: `/_authenticated/` (main landing page)

#### Architecture
```
dashboard/
├── components/
│   ├── overview.tsx      # Chart visualization
│   └── recent-sales.tsx  # Transaction table
└── index.tsx            # Main dashboard layout
```

#### Key Functionality

##### **Metric Cards System**
Displays key business metrics in card format:
- **Total Revenue**: $45,231.89 (+20.1% from last month)
- **Subscriptions**: +2350 (+180.1% from last month)  
- **Sales**: +12,234 (+19% from last month)
- **Active Now**: +573 (+201 since last hour)

##### **Chart Visualization** (`overview.tsx`)
- Built with **Recharts** library
- Responsive bar chart showing monthly data
- Smooth animations and hover interactions
- Data points: Jan through Dec with revenue values

##### **Recent Sales Component** (`recent-sales.tsx`)
- Lists latest 5 transactions
- User avatars with fallback initials
- Email and transaction amount display
- Clean, scannable interface

##### **Tab Navigation System**
Four main sections (currently Overview is implemented):
- **Overview**: Current dashboard view
- **Analytics**: Placeholder for advanced analytics
- **Reports**: Placeholder for reporting features
- **Notifications**: Placeholder for notification center

##### **Top Navigation Bar**
Demo links for:
- Overview, Customers, Products, Settings
- Currently disabled as demo elements

#### Data Flow
- Static mock data for metrics and charts
- Recent sales use faker-generated user data
- No external API integration (development mode)

---

## User Management Feature

### **Location**: `src/features/users/`
### **Route**: `/_authenticated/users/`

#### Architecture
```
users/
├── components/
│   ├── data-table-bulk-actions.tsx    # Bulk operations
│   ├── data-table-row-actions.tsx     # Individual row actions
│   ├── users-action-dialog.tsx        # Action confirmation
│   ├── users-columns.tsx              # Table column definitions
│   ├── users-delete-dialog.tsx        # Delete confirmation
│   ├── users-dialogs.tsx              # Create/edit modals
│   ├── users-invite-dialog.tsx        # User invitation
│   ├── users-multi-delete-dialog.tsx  # Bulk delete
│   ├── users-primary-buttons.tsx      # Main action buttons
│   ├── users-provider.tsx             # State management
│   └── users-table.tsx                # Main table component
├── data/
│   ├── data.ts           # Mock user data (100+ users)
│   ├── schema.ts         # Zod validation schemas
│   └── users.ts          # User type definitions
└── index.tsx            # Feature main component
```

#### Key Functionality

##### **Advanced Data Table**
- **TanStack Table** integration with full feature set
- **Sorting**: All columns sortable
- **Filtering**: Global search + column-specific filters
- **Pagination**: Configurable page sizes (10, 20, 30, 40, 50)
- **Row Selection**: Multi-select with bulk operations
- **Column Visibility**: Toggle columns on/off
- **Sticky Columns**: ID column remains visible on scroll

##### **User Data Schema** (`schema.ts`)
```typescript
const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  status: z.enum(['Active', 'Inactive']),
  role: z.enum(['Admin', 'User', 'Moderator']),
  created_at: z.date(),
  updated_at: z.date(),
})
```

##### **Column System** (`users-columns.tsx`)
1. **Selection Column**: Checkbox for row selection
2. **ID Column**: Sticky identifier with copy functionality  
3. **User Column**: Avatar + username + email
4. **Status Column**: Colored badge (Active/Inactive)
5. **Role Column**: Role badge with hierarchy colors
6. **Created Date**: Formatted date with tooltip
7. **Actions Column**: Dropdown menu with operations

##### **Search & Filtering**
- **Global Search**: Search across all user fields
- **Status Filter**: Active/Inactive with faceted selection
- **Role Filter**: Admin/User/Moderator with counts
- **Username Filter**: Dedicated text search

##### **URL State Management** (`useTableUrlState`)
Persists table state in URL parameters:
- `page`: Current page number
- `pageSize`: Items per page
- `status`: Status filter selection
- `role`: Role filter selection  
- `username`: Search query

##### **User Operations**
- **Create User**: Full form with validation
- **Edit User**: Pre-filled form with all fields
- **Delete User**: Confirmation dialog with impact warning
- **Bulk Delete**: Multi-user deletion with safeguards
- **Invite User**: Email invitation workflow
- **Export Users**: CSV/Excel export functionality

##### **State Management** (`users-provider.tsx`)
```tsx
const UsersProvider = ({ children }) => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  // ... other state management
}
```

#### Data Flow
1. **Data Loading**: Mock users generated with faker.js
2. **Table Rendering**: TanStack Table processes data
3. **User Actions**: State updates through context
4. **URL Sync**: Search parameters updated on changes
5. **Persistence**: Table state maintained across navigation

---

## Task Management Feature

### **Location**: `src/features/tasks/`
### **Route**: `/_authenticated/tasks/`

#### Architecture
```
tasks/
├── components/
│   ├── data-table-bulk-actions.tsx     # Bulk task operations
│   ├── data-table-row-actions.tsx      # Single task actions
│   ├── tasks-columns.tsx               # Table column definitions
│   ├── tasks-dialogs.tsx               # Task modals
│   ├── tasks-import-dialog.tsx         # CSV import functionality
│   ├── tasks-multi-delete-dialog.tsx   # Bulk delete
│   ├── tasks-mutate-drawer.tsx         # Create/edit drawer
│   ├── tasks-primary-buttons.tsx       # Main actions
│   ├── tasks-provider.tsx              # State management
│   └── tasks-table.tsx                 # Main table
├── data/
│   ├── data.tsx          # Status/priority definitions
│   ├── schema.ts         # Task validation schemas
│   └── tasks.ts          # Mock task data
└── index.tsx            # Feature entry point
```

#### Key Functionality

##### **Task Data Model** (`schema.ts`)
```typescript
const taskSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string().min(1, "Title is required"),
  status: z.enum(['todo', 'in-progress', 'done', 'canceled']),
  label: z.enum(['bug', 'feature', 'enhancement', 'documentation']),
  priority: z.enum(['low', 'medium', 'high']),
  created_at: z.date(),
  updated_at: z.date(),
})
```

##### **Status Management System**
- **Todo**: Initial task state
- **In Progress**: Currently being worked on
- **Done**: Completed tasks
- **Canceled**: Abandoned tasks

Visual indicators:
- Color-coded badges for each status
- Progress tracking across states
- Status change workflows

##### **Priority System**
- **Low**: Minor improvements, low urgency
- **Medium**: Standard priority tasks
- **High**: Critical tasks, urgent attention needed

Visual hierarchy:
- Color-coded priority badges
- Sort by priority functionality
- Filter by priority level

##### **Label Categorization**
- **Bug**: Issue fixes and error resolution
- **Feature**: New functionality development
- **Enhancement**: Improvements to existing features
- **Documentation**: Documentation updates and creation

##### **Advanced Table Features**
1. **Task Code Column**: Unique identifier (e.g., TASK-8782)
2. **Title Column**: Task description with overflow handling
3. **Status Column**: Interactive status badges
4. **Priority Column**: Visual priority indicators
5. **Label Column**: Category badges
6. **Actions Column**: Task operations menu

##### **Task Operations**
- **Create Task**: Comprehensive task creation form
- **Edit Task**: Full task editing with validation
- **Delete Task**: Individual task deletion
- **Bulk Operations**: Multi-task management
- **Import Tasks**: CSV/Excel import with validation
- **Export Tasks**: Data export in multiple formats

##### **Import System** (`tasks-import-dialog.tsx`)
- **File Upload**: Drag-and-drop or file selection
- **Format Validation**: CSV/Excel parsing
- **Data Validation**: Schema validation for imported data
- **Preview**: Show import preview before processing
- **Conflict Resolution**: Handle duplicate entries

##### **Search & Filtering**
URL Parameters:
- `page`: Current page
- `pageSize`: Items per page  
- `status`: Task status filter
- `priority`: Priority level filter
- `filter`: Text search across titles

##### **Bulk Actions**
- **Status Updates**: Change status for multiple tasks
- **Priority Changes**: Bulk priority assignment
- **Label Assignment**: Bulk label application
- **Delete Tasks**: Multi-task deletion with confirmation

#### Performance Considerations
- **Virtualization**: Large task lists with efficient rendering
- **Lazy Loading**: Progressive data loading
- **Optimistic Updates**: Immediate UI feedback
- **Debounced Search**: Efficient text filtering

---

## App Integrations Feature

### **Location**: `src/features/apps/`
### **Route**: `/_authenticated/apps/`

#### Architecture
```
apps/
├── data/
│   └── apps.tsx         # App definitions and mock data
└── index.tsx           # Main apps interface
```

#### Key Functionality

##### **Integration Categories**

**Connected Apps** (Currently integrated):
- **Stripe**: Payment processing platform
  - Status: Connected
  - Features: Payment handling, subscription management
- **Figma**: Design collaboration tool
  - Status: Connected  
  - Features: Design file access, collaboration
- **GitHub**: Version control platform
  - Status: Connected
  - Features: Repository access, CI/CD integration
- **GitLab**: DevOps platform
  - Status: Connected
  - Features: Repository management, pipeline integration

**Available Apps** (Ready to connect):
Communication: Discord, Slack, Telegram, WhatsApp, Skype
Productivity: Notion, Trello, Medium
Development: Docker
Email: Gmail
Video: Zoom

##### **App Card System**
Each app displays:
- **App Icon**: Brand-specific SVG icons
- **App Name**: Service name
- **Connection Status**: Connected/Not Connected badge
- **Connect Button**: Integration trigger
- **Description**: Brief service description

##### **Connection Management**
- **Connect Flow**: OAuth-based connection simulation
- **Disconnect Flow**: Safe disconnection with data retention options
- **Status Indicators**: Visual connection state
- **Permissions**: Required permissions display

##### **Filtering System**
URL Parameters:
- `type`: App category filter
- `filter`: Connection status (all, connected, not-connected)
- `sort`: Sorting preference (name, status)

Filter Options:
- **All Apps**: Complete app directory
- **Connected**: Only integrated apps
- **Not Connected**: Available integrations

##### **Search Functionality**
- **Real-time Search**: Filter apps by name
- **Category Filtering**: Filter by app type
- **Status Filtering**: Filter by connection status

##### **Grid Layout**
- **Responsive Grid**: Adapts to screen size
- **Card-based Interface**: Clean, scannable design
- **Loading States**: Skeleton loading for app cards
- **Empty States**: Helpful messaging when no apps match filters

#### Integration Architecture
```tsx
interface App {
  id: string
  name: string
  description: string
  icon: React.ComponentType
  status: 'connected' | 'not-connected'
  category: 'communication' | 'productivity' | 'development' | 'payment'
  permissions: string[]
  connectedDate?: Date
}
```

---

## Chat Feature

### **Location**: `src/features/chats/`
### **Route**: `/_authenticated/chats/`

#### Architecture
```
chats/
├── components/
│   └── new-chat.tsx     # New conversation dialog
├── data/
│   └── chat-types.ts    # TypeScript definitions
└── index.tsx           # Main chat interface
```

#### Key Functionality

##### **Chat Interface Layout**
- **Split Layout**: Contact list + chat window
- **Responsive Design**: Mobile-optimized experience
- **Contact Sidebar**: Scrollable contact list
- **Chat Window**: Message display and input

##### **Contact System**
Active conversations with:
- **Sofia Davis**: Recent active conversation
- **Jackson Lee**: Design system discussions  
- **Isabella Nguyen**: Meeting scheduling
- **William Kim**: Project updates
- **Multiple Threads**: Users can have multiple conversation threads

##### **Message Features**
- **Message Grouping**: Messages grouped by date
- **Timestamp Display**: Precise message timing
- **Avatar Integration**: User profile pictures
- **Status Indicators**: Online/offline status
- **Message Status**: Delivered/read indicators

##### **New Chat System** (`new-chat.tsx`)
- **User Selection**: Choose from available contacts
- **Message Composer**: Rich text message input
- **Contact Search**: Find users to message
- **Group Chat Support**: Multi-user conversations (planned)

##### **Mock Conversation Data**
Realistic conversation examples:
```json
{
  "conversations": [
    {
      "user": "Sofia Davis",
      "lastMessage": "Thanks for the feedback! I'll make those changes.",
      "timestamp": "2m ago",
      "unread": 2
    }
  ]
}
```

##### **Mobile Responsiveness**
- **Touch-Optimized**: Mobile-first design
- **Gesture Support**: Swipe navigation
- **Compact Layout**: Optimized for small screens
- **Performance**: Efficient scrolling and rendering

#### Chat Architecture
```tsx
interface Conversation {
  id: string
  participants: User[]
  messages: Message[]
  lastActivity: Date
  unreadCount: number
}

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: Date
  status: 'sent' | 'delivered' | 'read'
  type: 'text' | 'image' | 'file'
}
```

---

## Settings Feature

### **Location**: `src/features/settings/`
### **Route**: `/_authenticated/settings/`

#### Architecture
```
settings/
├── components/
│   ├── content-section.tsx    # Settings content wrapper
│   └── sidebar-nav.tsx        # Settings navigation
├── account/
│   ├── account-form.tsx       # Account settings form
│   └── index.tsx             # Account page
├── appearance/
│   ├── appearance-form.tsx    # Theme settings form
│   └── index.tsx             # Appearance page
├── display/
│   ├── display-form.tsx       # Layout settings form
│   └── index.tsx             # Display page
├── notifications/
│   ├── notifications-form.tsx # Notification settings
│   └── index.tsx             # Notifications page
├── profile/
│   ├── profile-form.tsx       # Profile settings form
│   └── index.tsx             # Profile page (default)
└── index.tsx                 # Settings layout
```

#### Key Functionality

##### **Settings Navigation System** (`sidebar-nav.tsx`)
Hierarchical navigation with:
- **Profile**: Personal information (default route)
- **Account**: Security and account settings  
- **Appearance**: Theme and visual preferences
- **Notifications**: Communication preferences
- **Display**: Layout and interface settings

##### **Profile Settings** (`profile/`)
- **Personal Information**: Name, email, bio
- **Avatar Management**: Profile picture upload
- **Display Name**: Public name configuration
- **Bio**: Personal description
- **Social Links**: Social media connections

##### **Account Settings** (`account/`)
- **Security Settings**: Password management
- **Two-Factor Authentication**: 2FA setup
- **Account Recovery**: Recovery options
- **Privacy Settings**: Data and privacy controls
- **Account Deletion**: Safe account removal

##### **Appearance Settings** (`appearance/`)
- **Theme Selection**: Light, Dark, System
- **Color Schemes**: Custom color preferences
- **Font Settings**: Typography preferences
- **UI Density**: Compact/comfortable spacing

##### **Notification Settings** (`notifications/`)
- **Email Notifications**: Email preference management
- **Push Notifications**: Browser notification settings
- **Communication Preferences**: How to receive updates
- **Alert Settings**: System alert configurations

##### **Display Settings** (`display/`)
- **Layout Modes**: Fixed vs Fluid layout
- **Sidebar Style**: Sidebar, Floating, Inset options
- **Navigation Preferences**: Sidebar behavior
- **Content Width**: Max-width preferences

##### **Form Management Pattern**
All settings forms use consistent pattern:
```tsx
const form = useForm({
  resolver: zodResolver(settingsSchema),
  defaultValues: currentSettings
})

const onSubmit = (values) => {
  updateSettings(values)
  toast.success("Settings updated successfully")
}
```

##### **Settings Persistence**
- **Local Storage**: User preferences
- **Cookies**: Layout settings
- **Context Providers**: Live settings updates
- **URL State**: Deep linking to specific settings

#### Settings Schema Examples
```typescript
const profileSchema = z.object({
  displayName: z.string().min(1, "Display name required"),
  bio: z.string().max(500, "Bio too long"),
  avatar: z.string().url().optional(),
})

const appearanceSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  fontSize: z.enum(['sm', 'base', 'lg']),
})
```

---

## Authentication Feature

### **Location**: `src/features/auth/`
### **Routes**: `/(auth)/` and `/clerk/`

#### Architecture
```
auth/
├── auth-layout.tsx              # Auth pages layout
├── forgot-password/
│   ├── components/
│   │   └── forgot-password-form.tsx
│   └── index.tsx
├── otp/
│   ├── components/
│   │   └── otp-form.tsx
│   └── index.tsx
├── sign-in/
│   ├── components/
│   │   └── user-auth-form.tsx
│   ├── index.tsx
│   └── sign-in-2.tsx           # Alternative layout
└── sign-up/
    ├── components/
    │   └── sign-up-form.tsx
    └── index.tsx
```

#### Key Functionality

##### **Dual Authentication System**
1. **Custom Authentication**: Built with React Hook Form
2. **Clerk Integration**: Drop-in authentication service

##### **Sign-In Features** (`sign-in/`)
- **Email/Password**: Standard credential authentication
- **Form Validation**: Real-time validation with Zod
- **Remember Me**: Persistent login sessions  
- **Forgot Password**: Password recovery link
- **Alternative Layout**: Different design variant (`sign-in-2.tsx`)

##### **Sign-Up Features** (`sign-up/`)
- **User Registration**: Full registration form
- **Email Verification**: Verification workflow
- **Terms Acceptance**: Legal agreement checkbox
- **Password Strength**: Real-time password validation

##### **OTP System** (`otp/`)
- **6-Digit Input**: One-time password interface
- **Auto-Focus**: Progressive input focus
- **Auto-Submit**: Automatic form submission
- **Resend Code**: Code regeneration
- **Visual Feedback**: Clear input status

##### **Password Recovery** (`forgot-password/`)
- **Email Input**: Recovery email form
- **Validation**: Email format checking
- **Recovery Flow**: Email-based password reset
- **Return Options**: Back to sign-in navigation

##### **Auth Layout** (`auth-layout.tsx`)
Consistent layout for all auth pages:
- **Centered Forms**: Optimized form positioning
- **Branding**: Logo and application name
- **Responsive**: Mobile-optimized layouts
- **Clean Design**: Minimal, focused interface

##### **Form Validation Patterns**
```typescript
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
})
```

##### **Clerk Integration**
- **Social Logins**: Google, GitHub, Discord
- **Enterprise SSO**: SAML/OIDC support
- **User Management**: Admin interface
- **Session Management**: Automatic session handling

---

## Error Handling Feature

### **Location**: `src/features/errors/`
### **Routes**: `/(errors)/` and `/_authenticated/errors/`

#### Architecture
```
errors/
├── forbidden.tsx           # 403 Forbidden
├── general-error.tsx       # 500 Internal Server Error  
├── maintenance-error.tsx   # 503 Service Unavailable
├── not-found-error.tsx     # 404 Not Found
└── unauthorized-error.tsx  # 401 Unauthorized
```

#### Key Functionality

##### **Error Types**
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Permission denied
- **404 Not Found**: Page/resource not found
- **500 Internal Server Error**: Application errors
- **503 Service Unavailable**: Maintenance mode

##### **Error Components**
Each error page includes:
- **Error Code**: HTTP status code
- **Error Message**: User-friendly description
- **Recovery Actions**: Navigation options
- **Support Information**: Help contact details
- **Visual Design**: Consistent error page styling

##### **Dynamic Error Handling**
- **Route Parameter**: `/_authenticated/errors/$error`
- **Error Context**: Detailed error information
- **Recovery Suggestions**: Contextual help
- **Logging**: Error tracking and monitoring

---

## Cross-Feature Patterns

### **State Management**
- **Feature Contexts**: Each feature manages its own state
- **Global State**: Minimal global state with Zustand
- **URL Synchronization**: Table and filter states in URL
- **Persistence**: Cookie and localStorage usage

### **Form Handling**
- **React Hook Form**: Consistent form management
- **Zod Validation**: Type-safe form validation
- **Error Display**: Standardized error messaging
- **Loading States**: Form submission feedback

### **Data Flow**
- **Mock Data**: Faker.js for realistic development data
- **TanStack Query**: Server state management (ready for API integration)
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling

### **Performance**
- **Code Splitting**: Route-based splitting
- **Lazy Loading**: Progressive feature loading
- **Memoization**: Optimized re-rendering
- **Virtual Scrolling**: Large dataset handling

This comprehensive features documentation provides the foundation for understanding how each module works individually and how they integrate to create the complete shadcn-admin application.