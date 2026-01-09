# Copilot Instructions: Sachinthya Portfolio Admin Panel

## Architecture Overview

Next.js 14 App Router full-stack application with Supabase backend, JWT auth, and 2FA. Key architectural patterns:

- **Dual Supabase clients**: `createSupabaseBrowserClient()` for client-side, `createSupabaseServerClient()` with service role for API routes ([lib/supabase.ts](src/lib/supabase.ts))
- **Field mapping layer**: Database fields systematically mapped to frontend conventions via `mapDbToFrontend()` and `mapFrontendToDb()` functions in all API routes
- **Route protection**: JWT tokens verified via `authenticateRequest()` from [lib/auth.ts](src/lib/auth.ts) - extract with `Bearer` header, verify with `JWT_SECRET`
- **FormData uploads**: Image uploads use native FormData, not JSON - see [api/projects/route.ts](src/app/api/projects/route.ts#L88-L100)

## Critical Field Mapping Convention

**ALL API routes implement bidirectional field mapping** between database snake_case and frontend camelCase:

```typescript
// Database → Frontend mapping (in every GET endpoint)
function mapDbToFrontend(dbProject: Record<string, unknown>) {
  return {
    name: dbProject.name || dbProject.title,           // title → name
    isShown: dbProject.is_shown,                       // is_shown → isShown
    order: dbProject.order_index || dbProject.display_order,  // order_index → order
    comprehensiveSummary: dbProject.comprehensive_summary,
    tech: Array.isArray(dbProject.tech) ? dbProject.tech : 
          dbProject.technology?.split(',').map(t => t.trim())  // Handle legacy string format
  }
}

// Frontend → Database mapping (in POST/PUT/PATCH endpoints)
function mapFrontendToDb(frontendData: Record<string, unknown>) {
  return {
    name: frontendData.name,                           // Keep name as is
    is_shown: frontendData.isShown,                    // isShown → is_shown
    order_index: frontendData.order,                   // order → order_index
    comprehensive_summary: frontendData.comprehensiveSummary
  }
}
```

**Pattern found in**: [api/projects/route.ts](src/app/api/projects/route.ts), [api/certificates/route.ts](src/app/api/certificates/route.ts), [api/certificates/[id]/route.ts](src/app/api/certificates/%5Bid%5D/route.ts)

## Database Tables & Legacy Fields

Key tables: `users`, `projects`, `certificates`, `testimonials`, `inquiries`

**Projects table has dual-field support for backward compatibility**:
- `name` (new) + `title` (legacy) - use `name || title` in reads
- `order_index` (new) + `display_order` (legacy) - use `order_index || display_order`
- `comprehensive_summary` (new) + `description` (fallback)
- `tech` (JSONB array) + `technology` (legacy string CSV)

When querying, prefer newer fields but handle both: `dbProject.name || dbProject.title`

## Authentication Flow

1. **Login**: POST [/api/auth/login](src/app/api/auth/login) → returns JWT token
2. **2FA Check**: If user has `two_factor_enabled: true`, return `requiresTwoFactor: true` instead of token
3. **2FA Verify**: POST [/api/auth/verify-2fa](src/app/api/auth/verify-2fa) with 6-digit TOTP or 8-char backup code → returns JWT
4. **Protected Routes**: Include `Authorization: Bearer <token>` header, verified via `authenticateRequest()` helper

**2FA Setup Flow**: [/dashboard/security](src/app/dashboard/security) → [/api/auth/setup-2fa](src/app/api/auth/setup-2fa) (generates QR + backup codes) → [/api/auth/enable-2fa](src/app/api/auth/enable-2fa) (verifies code)

## Email Notifications

**New inquiry submissions trigger email notifications** via Resend:

```typescript
// In API routes - non-blocking email send
import { sendNewInquiryNotification } from '@/lib/email'

sendNewInquiryNotification(inquiryData).catch(err => {
  console.error('Email notification failed (non-blocking):', err)
})
```

Email utility ([lib/email.ts](src/lib/email.ts)):
- `sendNewInquiryNotification(data, adminEmail)` - Sends HTML + plain text email
- Requires `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL` env vars
- Email failures are logged but don't block inquiry creation
- See [docs/EMAIL-NOTIFICATIONS.md](docs/EMAIL-NOTIFICATIONS.md) for full setup guide

## Image Upload Pattern

**Always use Supabase Storage, never Vercel Blob** (despite @vercel/blob being installed):

```typescript
// Correct: Use storage.ts helpers
import { uploadImage, replaceImage, deleteImage } from '@/lib/storage'

// In API routes handling FormData
const formData = await request.formData()
const imageFile = formData.get('image') as File | null
if (imageFile) {
  const imageUrl = await uploadImage(imageFile, 'projects')  // Uploads to 'Portfolio Images' bucket
}
```

Storage helpers ([lib/storage.ts](src/lib/storage.ts)):
- `uploadImage(file, folder)` - Uploads to `Portfolio Images/{folder}/{timestamp}-{random}.ext`
- `deleteImage(publicUrl)` - Extracts path from full URL and deletes
- `replaceImage(oldUrl, newFile, folder)` - Atomically deletes old and uploads new

## Reordering Pattern

Drag-and-drop reordering via [api/projects/reorder](src/app/api/projects/reorder), [api/certificates/reorder](src/app/api/certificates/reorder):

```typescript
// POST /api/{resource}/reorder
{ 
  projects: [{id: "uuid1", order_index: 1}, {id: "uuid2", order_index: 2}]
}
```

Updates `order_index` in parallel using `Promise.all()`. Frontend should optimistically update local state before API call.

## Component Patterns

**Forms use FormData, not JSON**:
- [ProjectForm.tsx](src/components/projects/ProjectForm.tsx) builds FormData with `append()` for files
- Links/tech arrays: Append as `links[0].type`, `links[0].url`, `tech[0]`, etc.

**Dashboard Layout**: 
- [dashboard/layout.tsx](src/app/dashboard/layout.tsx) includes dual nav: `FloatingNav` (mobile) + `DraggableFloatingNav` (desktop, draggable)
- Toast notifications via `react-hot-toast` configured globally in layout

**Loading States**:
- Use `<CustomLoadingSpinner />` for full-page loads
- Use `<InlineLoadingSpinner />` for inline actions (delete, update)

## Development Commands

```bash
npm run dev          # Next.js dev server (localhost:3000)
npm run build        # Production build
vercel --prod        # Deploy to Vercel (env vars must be set in dashboard)
node scripts/setup-2fa.js        # Run 2FA database migration
node scripts/setup-inquiries.js  # Run inquiries table migration
```

**Environment vars required** (see [DEPLOYMENT.md](DEPLOYMENT.md)):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (for auth tokens)
- `TOTP_ISSUER` (for 2FA QR codes, defaults to "Sachinthya Portfolio Admin")
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL` (for email notifications - see [docs/EMAIL-NOTIFICATIONS.md](docs/EMAIL-NOTIFICATIONS.md))

## Common Pitfalls

1. **Never mix Supabase clients**: Use browser client in components, server client in API routes
2. **Always map fields**: Don't return raw database objects - use `mapDbToFrontend()`
3. **FormData for uploads**: JSON endpoints reject file uploads, use `multipart/form-data`
4. **Legacy field handling**: When reading, check both `name || title` and `order_index || display_order`
5. **Auth on all mutations**: Every POST/PUT/PATCH/DELETE must call `authenticateRequest()` first
6. **Backup codes are 8 chars**: TOTP is 6 digits, backup codes are 8 alphanumeric - validate accordingly in [/api/auth/verify-2fa](src/app/api/auth/verify-2fa)

## Key Files Reference

- [lib/auth.ts](src/lib/auth.ts) - JWT auth helpers (`authenticateRequest`, `verifyAuthToken`)
- [lib/storage.ts](src/lib/storage.ts) - Supabase Storage wrappers (always use for images)
- [lib/email.ts](src/lib/email.ts) - Email notification helpers (Resend integration)
- [lib/two-factor.ts](src/lib/two-factor.ts) - TOTP generation/validation with speakeasy
- [lib/api.ts](src/lib/api.ts) - API endpoint constants (use instead of hardcoded paths)
- [components/ui/](src/components/ui/) - Reusable components (Button, FormField, ToggleSwitch, etc.)

## Testing Locally

Default admin credentials (see [README.md](README.md)):
- Email: `admin@sachinthya.dev`
- Password: `admin123`

Database migrations in [database/](database/) - run manually via Supabase SQL Editor or setup scripts in [scripts/](scripts/)
