# Sachinthya Portfolio Admin Panel - Full Stack

A modern full-stack admin panel for managing portfolio content, built with Next.js 14 and Supabase.

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SachinthyaCodes/sachinthya_portfolio_admin_panel)

**Quick Deployment:** Click the button above or see [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🚀 Features

- **Modern UI Design**: Clean, professional interface with responsive layout
- **Dashboard Overview**: Statistics, quick actions, and project management
- **Portfolio Management**: Create, edit, delete, and reorder projects
- **Drag & Drop**: Intuitive project reordering with visual feedback
- **Email Notifications**: Instant email alerts for new contact form inquiries
- **Real-time Updates**: Modern React 18 with state management
- **Authentication**: Secure JWT-based authentication with 2FA support
- **Field Mapping**: Seamless database-frontend field translation
- **Form Validation**: Comprehensive client and server-side validation

## 📁 Project Structure

```
sachinthya_portfolio_fullstack/
├── src/
│   ├── app/                 # Next.js 14 app directory
│   │   ├── dashboard/       # Dashboard pages
│   │   │   └── projects/    # Projects management
│   │   ├── login/          # Authentication page
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   └── projects/   # Projects CRUD endpoints
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── layout/         # Layout components
│   │   ├── projects/       # Project-specific components
│   │   └── ui/            # Reusable UI components
│   └── lib/               # Utilities and configurations
│       └── supabase.ts    # Supabase client setup
├── public/                # Static assets
├── package.json
└── .env.local            # Environment configuration
```

## 🛠 Prerequisites

- Node.js 18+
- Supabase account and project
- npm or yarn package manager

## ⚙️ Installation & Setup

### 1. Clone and Navigate

```bash
cd "d:\Projects\Portfolio\sachinthya_portfolio_fullstack"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Update `.env.local` with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Email Notifications (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=notifications@sachinthya.dev
ADMIN_EMAIL=admin@sachinthya.dev

# API Configuration
NEXT_PUBLIC_API_URL=/api
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔑 Default Credentials

**Admin Login:**
- Email: `admin@sachinthya.dev`
- Password: `admin123`

## 🗄️ Database Schema

The application uses these Supabase tables:

### Users Table
```sql
- id (uuid, primary key)
- email (text, unique)
- password_hash (text)
- first_name (text)
- last_name (text)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### Projects Table
```sql
- id (uuid, primary key)
- name (text)
- title (text) -- for backward compatibility
- category (text)
- description (text)
- comprehensive_summary (text)
- tech (jsonb array)
- links (jsonb array)
- image_url (text)
- is_shown (boolean)
- order_index (integer)
- display_order (integer) -- for backward compatibility
- user_id (uuid, foreign key)
- created_at (timestamp)
- updated_at (timestamp)
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Projects
- `GET /api/projects` - Get all projects (authenticated)
- `POST /api/projects` - Create project (FormData)
- `GET /api/projects/[id]` - Get specific project
- `PUT /api/projects/[id]` - Update project (full)
- `PATCH /api/projects/[id]` - Update project (partial)
- `DELETE /api/projects/[id]` - Delete project

### Inquiries
- `POST /api/inquiries` - Submit new inquiry (public, sends email notification)
- `GET /api/inquiries` - Get all inquiries (authenticated, supports filtering)
- `DELETE /api/inquiries` - Delete inquiries (authenticated, supports bulk delete)

## 🎨 Key Components

### Dashboard Features
- **Project Cards**: Display with drag-and-drop reordering
- **Visibility Toggle**: Show/hide projects with automatic reordering
- **Inline Editing**: Quick project modifications
- **Form Validation**: Comprehensive validation with error handling
- **Field Mapping**: Automatic translation between database and frontend formats

### UI Components
- **FormField**: Labeled form inputs with validation
- **LoadingScreen**: Full-screen loading with progress
- **ToggleSwitch**: Custom styled toggle switches
- **Button**: Multiple variants (primary, cancel, danger)
- **Modal**: Reusable modal container

## 🔄 Field Mapping System

The application includes automatic field mapping between database and frontend:

**Database → Frontend:**
- `title` → `name`
- `is_shown` → `isShown`  
- `display_order` → `order`
- `technology` (string) → `tech` (array)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Route Protection**: Protected dashboard routes
- **Input Validation**: Server-side validation
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: Input sanitization

## 🚀 Development Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

## 📝 Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# API Configuration  
NEXT_PUBLIC_API_URL=/api
```

## 🔧 Technology Stack

**Framework:** Next.js 14 with App Router
**Database:** Supabase (PostgreSQL)
**Authentication:** JWT with bcrypt
**Styling:** CSS Modules with CSS Variables
**UI:** React 18 with TypeScript
**State Management:** React Hooks
**Deployment Ready:** Vercel compatible

## ✨ Recent Updates

- ✅ **Migration Complete**: Successfully migrated from Firebase + Express to Next.js + Supabase
- ✅ **Field Mapping**: Implemented automatic database-frontend field translation
- ✅ **FormData Support**: Fixed project creation with proper FormData parsing
- ✅ **Code Cleanup**: Removed all Prisma dependencies and legacy files
- ✅ **Error Resolution**: Fixed all TypeScript and JSX compilation errors
- ✅ **Security**: Updated dependencies and removed hardcoded credentials

This full-stack application provides a complete portfolio management solution with modern development practices and clean architecture.