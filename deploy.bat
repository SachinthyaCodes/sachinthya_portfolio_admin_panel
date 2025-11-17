@echo off
REM Vercel Deployment Script for Windows
REM This script helps deploy the portfolio admin panel to Vercel

echo 🚀 Deploying Sachinthya Portfolio Admin Panel to Vercel...

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Build the project first (optional - Vercel will do this)
echo 📦 Building project locally...
npm run build

REM Deploy to Vercel
echo 🚢 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete! Check your Vercel dashboard for the live URL.

REM Remind about environment variables
echo.
echo 🔧 Don't forget to set environment variables in Vercel:
echo    - NEXT_PUBLIC_SUPABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo    - SUPABASE_SERVICE_ROLE_KEY
echo    - JWT_SECRET
echo    - NEXT_PUBLIC_API_URL
echo.
echo 📚 See DEPLOYMENT.md for detailed instructions.

pause