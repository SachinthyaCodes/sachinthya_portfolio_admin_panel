# 📧 Email Notifications - Quick Setup

## 1️⃣ Get Resend API Key
```
1. Go to https://resend.com
2. Sign up / Login
3. Navigate to "API Keys"
4. Click "Create API Key"
5. Copy the key (starts with "re_")
```

## 2️⃣ Add to .env.local
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=notifications@sachinthya.dev
ADMIN_EMAIL=your-email@example.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3️⃣ Install & Test
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Test email (in new terminal)
node scripts/test-email.js
```

## 4️⃣ Deploy to Vercel
```
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   - RESEND_API_KEY
   - RESEND_FROM_EMAIL
   - ADMIN_EMAIL
   - NEXT_PUBLIC_APP_URL
5. Redeploy
```

## ✅ Checklist

- [ ] Resend account created
- [ ] API key obtained
- [ ] Environment variables set locally
- [ ] Test email sent successfully
- [ ] Email received in inbox
- [ ] Environment variables added to Vercel
- [ ] Production deployment tested

## 🔗 Resources

- Setup Guide: `docs/EMAIL-NOTIFICATIONS.md`
- Test Script: `scripts/test-email.js`
- Email Code: `src/lib/email.ts`
- API Route: `src/app/api/inquiries/route.ts`

## 💡 Quick Test

```bash
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "subject": "Test",
    "message": "Testing email notifications"
  }'
```

## 🎯 What Happens

1. User submits contact form → POST `/api/inquiries`
2. Inquiry saved to Supabase database
3. Email notification sent to `ADMIN_EMAIL`
4. You receive beautiful HTML email with inquiry details
5. Click link to view in dashboard

## 🚨 Troubleshooting

**No email received?**
- Check Resend dashboard → Activity
- Check spam folder
- Verify API key is correct
- Check server logs for errors

**Email from onboarding@resend.dev?**
- Need to verify custom domain
- Free tier limitation
- See docs/EMAIL-NOTIFICATIONS.md

**Rate limit error?**
- Free tier: 100 emails/day
- Verify domain for higher limits
- Or upgrade Resend plan

---
📚 Full documentation: `docs/EMAIL-NOTIFICATIONS.md`
