# Two-Factor Authentication (2FA) Implementation

This document describes the TOTP-based Two-Factor Authentication implementation for the Sachinthya Portfolio Admin Panel.

## 🔒 Features

- **TOTP (Time-based One-Time Password)** authentication using industry standards
- **QR Code setup** for easy configuration with authenticator apps
- **Backup codes** for recovery access
- **Clean UI** with glass morphism design matching the admin panel theme
- **Mobile responsive** design for all screen sizes
- **Automatic cleanup** of expired sessions

## 🚀 Quick Setup

### 1. Install Dependencies

The required packages are already installed:
```bash
npm install speakeasy qrcode @types/speakeasy @types/qrcode
```

### 2. Database Migration

Apply the 2FA database migration:
```bash
# Option 1: Use the setup script (recommended)
node scripts/setup-2fa.js

# Option 2: Manual SQL execution
# Copy and run the SQL from database/2fa-migration.sql in Supabase Dashboard > SQL Editor
```

### 3. Environment Variables

The following environment variables are already configured in `.env.local`:
```env
TOTP_ISSUER=Sachinthya Portfolio Admin
```

### 4. Start the Application

```bash
npm run dev
```

## 📱 User Journey

### Setting Up 2FA

1. **Navigate to Security**: Go to `/dashboard/security`
2. **Enable 2FA**: Click "Enable 2FA" button
3. **Scan QR Code**: Use Google Authenticator, Authy, or similar app
4. **Verify Setup**: Enter 6-digit code from authenticator app
5. **Save Backup Codes**: Download and securely store backup codes

### Login with 2FA

1. **Regular Login**: Enter email and password
2. **2FA Prompt**: Redirected to `/verify-2fa` page
3. **Enter Code**: Input 6-digit TOTP code or 8-character backup code
4. **Access Granted**: Successfully logged into dashboard

## 🛠 API Endpoints

### Setup & Management
- `POST /api/auth/setup-2fa` - Generate QR code and backup codes
- `POST /api/auth/enable-2fa` - Verify and enable 2FA
- `POST /api/auth/disable-2fa` - Disable 2FA (requires confirmation)
- `GET /api/auth/me` - Get user info including 2FA status

### Authentication
- `POST /api/auth/login` - Enhanced to handle 2FA flow
- `POST /api/auth/verify-2fa` - Verify TOTP/backup codes during login

## 📁 File Structure

```
src/
├── components/auth/
│   ├── TwoFactorSetup.tsx      # 2FA setup wizard
│   └── TwoFactorVerify.tsx     # 2FA verification during login
├── app/
│   ├── api/auth/
│   │   ├── setup-2fa/route.ts   # Setup endpoint
│   │   ├── enable-2fa/route.ts  # Enable endpoint
│   │   ├── verify-2fa/route.ts  # Verification endpoint
│   │   ├── disable-2fa/route.ts # Disable endpoint
│   │   ├── me/route.ts          # User info endpoint
│   │   └── login/route.ts       # Enhanced login
│   ├── dashboard/security/      # Security management page
│   └── verify-2fa/             # 2FA verification page
├── lib/
│   └── two-factor.ts           # TOTP utility functions
└── styles/
    └── two-factor.css          # 2FA component styles
```

## 🗄️ Database Schema

### Users Table Extensions
```sql
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN backup_codes TEXT[];
```

### New Tables
```sql
-- 2FA sessions for temporary tokens during login
CREATE TABLE two_factor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  temp_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Utility Functions

The `TwoFactorAuth` class provides:

- `generateSecret()` - Create new TOTP secret
- `generateQRCode()` - Generate QR code for setup
- `verifyToken()` - Verify TOTP codes
- `generateBackupCodes()` - Create recovery codes
- `verifyBackupCode()` - Validate backup codes

## 🎨 UI Components

### TwoFactorSetup
Multi-step setup wizard:
1. Introduction and benefits
2. QR code scanning
3. Verification and backup codes

### TwoFactorVerify
Login verification with:
- TOTP code input
- Backup code option
- Error handling
- Mobile-optimized design

### Security Management
Dashboard page featuring:
- 2FA status overview
- Enable/disable controls
- Account information
- Responsive design

## 🔐 Security Features

- **Time-based validation** with 60-second tolerance window
- **Single-use backup codes** automatically removed after use
- **Secure session management** with automatic cleanup
- **Input validation** for all codes and tokens
- **Rate limiting** through proper error handling

## 📱 Supported Authenticator Apps

- **Google Authenticator** (Android/iOS)
- **Authy** (Android/iOS/Desktop)
- **Microsoft Authenticator** (Android/iOS)
- **1Password** (with TOTP support)
- **Bitwarden** (Premium)
- **LastPass Authenticator** (Android/iOS)

## 🚨 Recovery Options

1. **Backup Codes**: 10 single-use alphanumeric codes
2. **Manual Disable**: Database-level 2FA removal if needed
3. **Support Access**: Admin can disable via direct database access

## 🧪 Testing

Test the implementation:

1. **Setup Flow**: Complete 2FA setup process
2. **Login Flow**: Test TOTP and backup code verification
3. **Disable Flow**: Ensure proper cleanup when disabling
4. **Error Cases**: Test invalid codes and expired sessions
5. **Mobile Experience**: Verify responsive design

## 🚀 Production Considerations

- **Backup Code Security**: Advise users to store codes securely
- **Session Management**: Monitor and clean expired sessions
- **Error Monitoring**: Track 2FA-related authentication failures
- **User Education**: Provide clear setup instructions
- **Recovery Process**: Have admin procedure for 2FA lockouts

## 🔄 Future Enhancements

Potential improvements:
- SMS-based 2FA option
- WebAuthn/FIDO2 support
- Admin 2FA management dashboard
- Audit logging for 2FA events
- Multiple device support
- Remember device option

---

**Security Note**: This implementation follows TOTP RFC 6238 standards and includes proper security measures for production use.