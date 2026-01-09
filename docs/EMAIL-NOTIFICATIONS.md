# Email Notification Setup

This document explains how to configure email notifications for new portfolio inquiries.

## 📧 Email Service: Resend

The application uses [Resend](https://resend.com) for sending email notifications. Resend is a modern email API service designed for developers with excellent deliverability.

## 🚀 Quick Setup

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address
3. Complete the onboarding process

### 2. Get Your API Key

1. Navigate to **API Keys** in the Resend dashboard
2. Click **Create API Key**
3. Name it (e.g., "Portfolio Admin - Production")
4. Copy the API key (it will only be shown once)

### 3. Configure Your Domain (Optional but Recommended)

For production use, configure your own domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `sachinthya.dev`)
4. Add the DNS records provided by Resend:
   - SPF record
   - DKIM records
   - DMARC record (optional)
5. Wait for verification (usually 5-10 minutes)

**Without a verified domain**, emails will be sent from `onboarding@resend.dev` (limited to 100 emails/day).

### 4. Set Environment Variables

Add these to your `.env.local` file:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=notifications@sachinthya.dev  # Use your verified domain
ADMIN_EMAIL=admin@sachinthya.dev                # Where to receive notifications
NEXT_PUBLIC_APP_URL=https://admin.sachinthya.dev  # For "View in Dashboard" link
```

### 5. Deploy to Vercel

Add the same environment variables in your Vercel project settings:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add each variable for **Production**, **Preview**, and **Development** environments
3. Redeploy your application

## 📋 Environment Variables Explained

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | ✅ Yes | Your Resend API key | `re_123abc...` |
| `RESEND_FROM_EMAIL` | ⚠️ Recommended | Sender email (must be from verified domain) | `notifications@sachinthya.dev` |
| `ADMIN_EMAIL` | ⚠️ Recommended | Email to receive notifications | `admin@sachinthya.dev` |
| `NEXT_PUBLIC_APP_URL` | ❌ Optional | Your admin panel URL (for email links) | `https://admin.sachinthya.dev` |

**Defaults if not set:**
- `RESEND_FROM_EMAIL`: `notifications@sachinthya.dev`
- `ADMIN_EMAIL`: `admin@sachinthya.dev`
- `NEXT_PUBLIC_APP_URL`: `https://admin.sachinthya.dev`

## 🎨 Email Template

The email notification includes:

- **Professional design** with gradient header matching admin panel theme
- **All inquiry details**: Name, email, subject, message
- **Timestamp** of when the inquiry was received
- **Direct link** to view in dashboard
- **Responsive layout** for mobile and desktop
- **Plain text fallback** for email clients that don't support HTML

## 🧪 Testing Email Notifications

### Test Locally

1. Set up environment variables in `.env.local`
2. Start development server: `npm run dev`
3. Submit a test inquiry via POST request:

```bash
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Inquiry",
    "message": "This is a test message to verify email notifications."
  }'
```

4. Check your admin email inbox

### Test in Production

After deploying to Vercel:

1. Use your portfolio contact form
2. Or use the curl command above with your production URL
3. Verify email is received at `ADMIN_EMAIL`

## 🔧 Troubleshooting

### Email Not Received

1. **Check Resend dashboard** → Activity to see send status
2. **Verify API key** is correct and active
3. **Check spam folder** in your email client
4. **Verify domain** if using custom domain (must be fully verified)
5. **Check logs** in Vercel → Functions → Logs for error messages

### Common Issues

**Issue**: Email sent but shows as from `onboarding@resend.dev`
- **Solution**: Verify your domain in Resend dashboard and update `RESEND_FROM_EMAIL`

**Issue**: Email fails silently
- **Solution**: Email errors are non-blocking. Check application logs for error messages. The inquiry is still saved even if email fails.

**Issue**: "Invalid API key" error
- **Solution**: Ensure `RESEND_API_KEY` is correctly set and starts with `re_`

**Issue**: Rate limit errors
- **Solution**: Free tier is limited to 100 emails/day. Upgrade Resend plan or verify your domain for higher limits.

## 📊 Email Delivery

### Non-Blocking Implementation

Email notifications are sent **asynchronously** and won't block the inquiry submission:

```typescript
// Email sent in background - errors are logged but don't affect response
sendNewInquiryNotification(inquiry).catch(err => {
  console.error('Email notification failed (non-blocking):', err)
})

// User immediately gets success response
return NextResponse.json({ success: true, message: 'Inquiry submitted' })
```

This ensures:
- ✅ Fast API response (< 500ms)
- ✅ Inquiry always saved to database
- ✅ Email failures don't break user experience
- ✅ Errors are logged for debugging

## 🔐 Security Features

- **HTML escaping**: All user input is escaped to prevent XSS attacks
- **Email validation**: Format validation before processing
- **Rate limiting**: Resend provides built-in rate limiting
- **Input sanitization**: Trimming and normalization of all fields

## 📈 Monitoring

Check email delivery status:

1. **Resend Dashboard** → **Activity**
   - View all sent emails
   - Check delivery status
   - See open/click rates (if tracking enabled)

2. **Vercel Logs** → **Functions**
   - Filter for `/api/inquiries`
   - Look for email send confirmations or errors

## 🚀 Production Checklist

Before going live:

- [ ] Resend account created
- [ ] API key generated
- [ ] Domain verified (if using custom domain)
- [ ] Environment variables set in Vercel
- [ ] Test email sent successfully
- [ ] Email arrives in inbox (not spam)
- [ ] "View in Dashboard" link works
- [ ] Email template looks good on mobile and desktop

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference/introduction)
- [Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)
- [Email Best Practices](https://resend.com/docs/best-practices)

## 💡 Tips

- **Use different emails for dev/production**: Set different `ADMIN_EMAIL` values for each environment
- **Monitor your quota**: Check Resend dashboard regularly to avoid hitting limits
- **Enable DMARC**: Improves email deliverability and security
- **Test spam score**: Use [Mail Tester](https://www.mail-tester.com) to check if emails might go to spam
- **Customize template**: Edit `src/lib/email.ts` to match your branding
