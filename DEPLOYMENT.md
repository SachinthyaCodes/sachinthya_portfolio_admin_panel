# Vercel Deployment Guide

## 🚀 Deploy to Vercel

This portfolio admin panel is ready for deployment on Vercel. Follow these steps:

### 1. Prerequisites
- GitHub repository: `https://github.com/SachinthyaCodes/sachinthya_portfolio_admin_panel.git`
- Supabase project with database tables set up
- Vercel account

### 2. Deployment Steps

#### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `sachinthya_portfolio_admin_panel`
4. Configure environment variables (see below)
5. Click "Deploy"

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
vercel

# Follow prompts and add environment variables
```

### 3. Environment Variables

Add these environment variables in your Vercel project settings:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# API Configuration  
NEXT_PUBLIC_API_URL=/api
```

### 4. Database Setup

Ensure your Supabase database has these tables:

```sql
-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    technologies TEXT,
    category VARCHAR(100),
    is_shown BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table  
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Post-Deployment

After deployment:
1. Your admin panel will be available at `https://your-project.vercel.app`
2. Access the admin interface at `https://your-project.vercel.app/admin/login`
3. Default credentials: `admin@sachinthya.dev` / `admin123`

### 6. Custom Domain (Optional)

To add a custom domain:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Configure DNS records as shown

### 7. Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `master` branch
- **Preview**: Every push to other branches and pull requests

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/           # Admin panel pages
│   ├── api/             # API routes
│   ├── components/      # Reusable components
│   └── globals.css      # Global styles
├── public/              # Static assets
└── ...config files
```

## 🔧 Configuration Files

- `vercel.json` - Vercel deployment configuration
- `.vercelignore` - Files to ignore during deployment  
- `next.config.ts` - Next.js configuration
- `.env.local.example` - Environment variables template

## 🛠 Troubleshooting

**Build Issues:**
- Ensure all environment variables are set
- Check that Supabase credentials are correct
- Verify database tables exist

**API Issues:**
- Check function timeout settings in vercel.json
- Verify CORS headers if needed
- Ensure JWT_SECRET is set

**Database Issues:**
- Confirm Supabase service role key has proper permissions
- Check table schemas match the application requirements

## 📞 Support

For deployment issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)