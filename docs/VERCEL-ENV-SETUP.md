# 🔧 Vercel Environment Variables Setup Guide

## Current Issue
Your project is deployed but showing 500 errors because environment variables are not configured on Vercel.

## ✅ Required Environment Variables

Copy these **exact values** to your Vercel project settings:

### 1. Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://bwttbiruzyeaazbtemfd.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dHRiaXJ1enllYWF6YnRlbWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTY3OTAsImV4cCI6MjA3ODkzMjc5MH0.F0QLmkktV2yFKycrFtS79MR0iGyUfioQHAV_vCahikU
```

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dHRiaXJ1enllYWF6YnRlbWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1Njc5MCwiZXhwIjoyMDc4OTMyNzkwfQ.SvSslWV5juKMXvX-lmyibrrsXjRY9rY95oEHsfVCGX4
```

### 2. JWT Configuration
```
JWT_SECRET=e189f6a8cdbf0dd14fe8ad3ae94219eeb4e8175a638a259a2780e76c2c0ef2c4835dd8545ae8c6ee98e11b9396250c1ce89c094b7ba831943d9489491fc45c80
```

### 3. API Configuration
```
NEXT_PUBLIC_API_URL=/api
```

## 📋 How to Add Environment Variables to Vercel

### Method 1: Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your project: `sachinthya-portfolio-admin-panel`
3. Click on the project name
4. Go to **Settings** tab
5. Click **Environment Variables** in the sidebar
6. Add each variable:
   - Click **Add New**
   - Enter the **Name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the **Value** (copy from above)
   - Select **All Environments** (Production, Preview, Development)
   - Click **Save**
7. Repeat for all 5 variables above

### Method 2: Vercel CLI
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Set each environment variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production  
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add JWT_SECRET production
vercel env add NEXT_PUBLIC_API_URL production
```

## 🔄 After Adding Environment Variables

1. **Redeploy your project**:
   - In Vercel dashboard → **Deployments** tab
   - Click the three dots (**...**) on the latest deployment
   - Click **Redeploy**
   - Wait for deployment to complete

2. **Test the health check**:
   - Visit: `https://sachinthya-portfolio-admin-panel.vercel.app/api/health`
   - Should show all variables as "SET ✅"

3. **Test login**:
   - Visit: `https://sachinthya-portfolio-admin-panel.vercel.app/login`
   - Try logging in with: `admin@sachinthya.dev` / `admin123`

## 🐛 Troubleshooting

### If you still get 500 errors:
1. Check Vercel **Functions** logs:
   - Go to project dashboard
   - Click **Functions** tab
   - Check recent invocations for error details

2. Verify all 5 environment variables are set correctly
3. Make sure there are no extra spaces in variable names or values
4. Ensure you redeployed after adding variables

### Health Check Endpoint
Use `/api/health` to verify your configuration:
- ✅ All variables SET = Ready to use
- ❌ Variables MISSING = Need to add them to Vercel

## 📞 Need Help?
If issues persist, check the Vercel function logs and compare with your local `.env.local` file to ensure all values match exactly.