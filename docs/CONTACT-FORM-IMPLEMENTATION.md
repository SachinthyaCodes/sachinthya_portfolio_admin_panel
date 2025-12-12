# Contact Form & Inquiries System

This document explains how the contact form submission and inquiry management system works across the portfolio site and admin dashboard.

## Overview

The system consists of three main parts:
1. **Contact Form** (Portfolio Site) - Users submit inquiries
2. **Database** (Supabase) - Stores inquiry data
3. **Admin Panel** (Dashboard) - View and manage inquiries

## Architecture

### Data Flow

```
Portfolio Contact Form → API Endpoint → Supabase Database
                                              ↓
                                     Admin Dashboard
                                     (View & Manage)
```

## Setup Instructions

### 1. Database Setup

Run the migration to create the inquiries table in Supabase:

```bash
# View setup instructions
node scripts/setup-inquiries.js
```

Or manually execute the SQL in Supabase SQL Editor:
- File: `database/inquiries-migration.sql`
- Location: Supabase Dashboard → SQL Editor

The migration creates:
- `inquiries` table with all necessary fields
- Indexes for performance optimization
- RLS policies (public insert, authenticated read/update/delete)
- Automatic timestamp updates

### 2. Database Schema

**Table: `inquiries`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `name` | VARCHAR(255) | Sender's name |
| `email` | VARCHAR(255) | Sender's email |
| `subject` | VARCHAR(255) | Inquiry subject/topic |
| `message` | TEXT | Inquiry message |
| `status` | VARCHAR(50) | Status: 'new', 'in-progress', 'resolved' |
| `is_read` | BOOLEAN | Whether admin has read it |
| `created_at` | TIMESTAMP | Auto-generated creation time |
| `updated_at` | TIMESTAMP | Auto-updated modification time |

### 3. API Endpoints

#### Portfolio Site (sachinthya_portfolio)

**POST /api/contact**
- Submit contact form
- Public endpoint (no authentication required)
- Request body:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "A new project",
    "message": "I'd like to discuss..."
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "Your message has been sent successfully!",
    "data": { /* inquiry object */ }
  }
  ```

#### Admin Dashboard (sachinthya_portfolio_fullstack)

**GET /api/inquiries**
- Fetch all inquiries
- Requires authentication (Bearer token)
- Query parameters:
  - `status`: Filter by status (new/in-progress/resolved)
  - `is_read`: Filter by read status (true/false)
- Returns: Array of inquiry objects

**GET /api/inquiries/[id]**
- Fetch single inquiry
- Requires authentication
- Returns: Single inquiry object

**PATCH /api/inquiries/[id]**
- Update inquiry (status or is_read)
- Requires authentication
- Request body:
  ```json
  {
    "status": "in-progress",
    "is_read": true
  }
  ```

**DELETE /api/inquiries/[id]**
- Delete single inquiry
- Requires authentication
- Returns: Success confirmation

## Components

### Portfolio Site

**ContactForm Component**
- Location: `sachinthya_portfolio/src/app/components/ContactForm/ContactForm.tsx`
- Features:
  - Form validation
  - Loading states
  - Success/error messages
  - Auto-reset after successful submission

### Admin Dashboard

**Inquiries Page**
- Location: `sachinthya_portfolio_fullstack/src/app/dashboard/inquiries/page.tsx`
- Features:
  - List all inquiries
  - Filter by status and read state
  - Mark as read automatically when viewing
  - Update status (new → in-progress → resolved)
  - Delete inquiries
  - Responsive design with detail view

## Security

### Row Level Security (RLS)

The inquiries table has RLS enabled with the following policies:

1. **Public Insert**: Anyone can submit contact forms
2. **Authenticated Select**: Only logged-in admins can view inquiries
3. **Authenticated Update**: Only logged-in admins can update inquiries
4. **Authenticated Delete**: Only logged-in admins can delete inquiries

### Authentication

- Admin dashboard uses JWT tokens
- All admin endpoints require `Authorization: Bearer <token>` header
- Tokens stored in localStorage

## Usage

### For Users (Portfolio Site)

1. Navigate to the Contact section on the portfolio
2. Fill out the form:
   - Select a subject
   - Enter name
   - Enter email
   - Write message
3. Click "SUBMIT"
4. See success message

### For Admins (Dashboard)

1. Log in to admin dashboard
2. Navigate to "inquiries" from the navigation
3. View list of all inquiries
4. Filter by status or read state
5. Click an inquiry to view details
6. Update status as you process inquiries
7. Delete resolved inquiries if needed

## Status Workflow

Recommended workflow for managing inquiries:

```
new → in-progress → resolved
```

- **new**: Just received, not yet processed
- **in-progress**: Admin is working on it
- **resolved**: Complete, can be deleted if desired

## Filters

### Status Filter
- All Status
- New
- In Progress
- Resolved

### Read Filter
- All Messages
- Unread
- Read

## Visual Indicators

- **Unread Dot**: Blue dot next to unread inquiry names
- **Status Badges**: Color-coded badges
  - Blue: New
  - Orange: In Progress
  - Green: Resolved
- **Selected State**: Highlighted inquiry in list

## Troubleshooting

### Contact Form Not Submitting

1. Check browser console for errors
2. Verify Supabase URL and anon key in portfolio `.env.local`
3. Check network tab for API response

### Inquiries Not Showing in Admin

1. Verify authentication token is valid
2. Check that migration was run successfully
3. Verify RLS policies in Supabase Dashboard
4. Check admin token in browser localStorage

### Database Connection Issues

1. Verify Supabase credentials in both projects
2. Check Supabase project is active
3. Run database health check: `/api/health`

## Testing

### Test Contact Form Submission

```javascript
// In browser console on portfolio site
fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    subject: 'A new project',
    message: 'This is a test message'
  })
}).then(r => r.json()).then(console.log)
```

### Test Admin API

```javascript
// In browser console on admin dashboard (after login)
const token = localStorage.getItem('token')
fetch('/api/inquiries', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

## Files Created/Modified

### New Files
- `sachinthya_portfolio/src/app/api/contact/route.ts`
- `sachinthya_portfolio/src/app/components/ContactForm/ContactForm.tsx`
- `sachinthya_portfolio_fullstack/src/app/api/inquiries/route.ts`
- `sachinthya_portfolio_fullstack/src/app/api/inquiries/[id]/route.ts`
- `sachinthya_portfolio_fullstack/src/app/dashboard/inquiries/page.tsx`
- `sachinthya_portfolio_fullstack/src/app/dashboard/inquiries/inquiries.module.css`
- `sachinthya_portfolio_fullstack/database/inquiries-migration.sql`
- `sachinthya_portfolio_fullstack/scripts/setup-inquiries.js`

### Modified Files
- `sachinthya_portfolio/src/app/page.tsx` (replaced form with ContactForm component)
- `sachinthya_portfolio_fullstack/src/lib/api.ts` (added INQUIRIES endpoints)

## Future Enhancements

Potential improvements:
- Email notifications when new inquiry received
- Reply functionality from admin panel
- Export inquiries to CSV
- Search functionality
- Bulk status updates
- Auto-archive old resolved inquiries
- Analytics dashboard for inquiries
