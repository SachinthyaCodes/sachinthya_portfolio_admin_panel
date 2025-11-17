# Sachinthya Portfolio Admin Panel

A comprehensive admin panel for managing your portfolio content, built with Next.js 15 (frontend) and NestJS (backend).

## 🚀 Features

### Frontend (Next.js 15)
- **Modern UI Design**: Clean, professional interface with Inter font
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Dashboard Overview**: Statistics, quick actions, and recent activity
- **Portfolio Management**: Create, edit, and organize projects
- **Testimonial Management**: Manage client testimonials
- **Media Upload**: Handle images and file uploads
- **Authentication**: Secure login system
- **Real-time Updates**: Modern React 19 with state management

### Backend (NestJS)
- **RESTful API**: Complete CRUD operations for all entities
- **JWT Authentication**: Secure token-based authentication
- **Database Integration**: TypeORM with MySQL support
- **File Upload**: Multer integration for media handling
- **API Documentation**: Swagger/OpenAPI documentation
- **Validation**: Class-validator for input validation
- **TypeScript**: Full type safety throughout

## 📁 Project Structure

```
sachinthya_portfolio_admin_panel/
├── frontend/                 # Next.js 15 application
│   ├── src/
│   │   ├── app/             # App directory (Next.js 13+ structure)
│   │   │   ├── dashboard/   # Dashboard pages
│   │   │   ├── login/       # Authentication pages
│   │   │   └── layout.tsx   # Root layout
│   │   ├── components/      # React components
│   │   │   ├── layout/      # Layout components (Sidebar, Header)
│   │   │   └── dashboard/   # Dashboard-specific components
│   │   └── styles/          # Global styles
│   ├── package.json
│   └── next.config.js
│
└── backend/                 # NestJS application
    ├── src/
    │   ├── auth/           # Authentication module
    │   ├── user/           # User management
    │   ├── portfolio/      # Portfolio projects
    │   ├── testimonial/    # Testimonials
    │   ├── media/          # File upload handling
    │   └── main.ts         # Application entry point
    ├── package.json
    └── .env                # Environment configuration
```

## 🛠 Prerequisites

- Node.js 18+ 
- MySQL database
- npm or yarn package manager

## ⚙️ Installation & Setup

### 1. Clone and Setup

```bash
# Navigate to the admin panel directory
cd "D:\Projects\Portfolio\sachinthya_portfolio_admin_panel"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials and settings

# Start the backend server
npm run start:dev
```

The backend will be available at `http://localhost:3000`
API documentation at `http://localhost:3000/api/docs`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3001`

### 4. Database Setup

Create a MySQL database and update the `.env` file in the backend directory:

```bash
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=portfolio_admin
```

The application will automatically create the required tables when you start the backend.

## 🔑 Default Credentials

**Admin Login:**
- Email: `admin@sachinthya.com`
- Password: `admin123`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Portfolio
- `GET /api/portfolio` - Get published projects (public)
- `GET /api/portfolio/admin` - Get all projects (admin)
- `POST /api/portfolio` - Create project
- `PUT /api/portfolio/:id` - Update project
- `DELETE /api/portfolio/:id` - Delete project

### Testimonials
- `GET /api/testimonials` - Get published testimonials (public)
- `GET /api/testimonials/admin` - Get all testimonials (admin)

### Media
- `POST /api/media/upload` - Upload file
- `DELETE /api/media/:filename` - Delete file

### User
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile

## 🎨 UI Components

The admin panel includes these pre-built components:

- **Sidebar**: Navigation with section grouping
- **Header**: User menu and notifications
- **Stats Cards**: Dashboard metrics display
- **Quick Actions**: Common task shortcuts
- **Recent Activity**: Activity timeline
- **Forms**: Styled form inputs and validation
- **Tables**: Data display with sorting
- **Buttons**: Multiple variants and states
- **Cards**: Content containers with headers

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Route Guards**: Protected admin routes
- **Input Validation**: Server-side validation with class-validator
- **CORS Configuration**: Proper cross-origin setup
- **File Upload Security**: Type and size restrictions

## 🚀 Development Scripts

### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

### Backend
```bash
npm run start:dev   # Start development server with hot reload
npm run start       # Start production server
npm run build       # Build TypeScript
npm run test        # Run tests
```

## 📝 Environment Variables

### Backend (.env)
```bash
# Database
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=portfolio_admin

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Application
PORT=3000
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:3001
```

## 🎯 Next Steps

1. **Database Setup**: Create MySQL database and configure connection
2. **Install Dependencies**: Run `npm install` in both frontend and backend directories
3. **Environment Configuration**: Update `.env` files with your settings
4. **Start Development**: Run both frontend and backend servers
5. **Login**: Use default credentials to access the admin panel

## 🔧 Customization

- **Styling**: Modify `frontend/src/styles/globals.css` for design changes
- **Components**: Add new components in `frontend/src/components/`
- **API Endpoints**: Extend backend modules in `backend/src/`
- **Database Schema**: Modify entities in respective module directories

## 📚 Technology Stack

**Frontend:**
- Next.js 15 with App Router
- React 19
- TypeScript
- CSS Variables (Modern styling)
- React Icons
- Axios for API calls

**Backend:**
- NestJS
- TypeORM
- MySQL
- JWT Authentication
- Swagger/OpenAPI
- Class Validator
- Multer (File uploads)

This admin panel provides a solid foundation for managing your portfolio content with modern development practices and a professional user interface.