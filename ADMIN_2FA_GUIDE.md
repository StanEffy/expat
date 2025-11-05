# How to Activate 2FA for Admin Panel

This guide explains how to activate Two-Factor Authentication (2FA) for the admin panel.

## Overview

2FA is **required** for all admin panel access. When you first log in as an admin, you'll be prompted to set up 2FA if it's not already enabled.

## Prerequisites

1. **Admin Account**: You must have an account with the "admin" role
2. **Authenticator App**: Install one of these apps on your mobile device:
   - Google Authenticator (iOS/Android)
   - Authy (iOS/Android/Desktop)
   - Microsoft Authenticator (iOS/Android)
   - Any other TOTP-compatible authenticator app

## Step-by-Step Activation Process

### Step 1: Log In as Admin

1. Go to `/login` on the frontend
2. Sign in with your admin credentials
3. After successful login, you'll be automatically redirected to the admin panel (default path: `/app-console`, configurable via `VITE_ADMIN_PANEL_PATH`)

### Step 2: Automatic 2FA Setup Prompt

When you first access the admin panel (or if 2FA is not enabled), you'll see a modal dialog titled **"Set Up Two-Factor Authentication"**.

### Step 3: Scan QR Code

1. **Open your authenticator app** on your mobile device
2. **Add a new account** in the app:
   - Google Authenticator: Tap the "+" button
   - Authy: Tap "Add Account"
   - Other apps: Look for "Add Account" or "Scan QR Code"
3. **Scan the QR code** displayed in the modal with your authenticator app
4. The app will automatically add the account and start generating 6-digit codes

### Step 4: Verify Setup

1. After scanning, your authenticator app will show a 6-digit code that changes every 30 seconds
2. **Enter the current 6-digit code** in the input field in the modal
3. Click **"Enable 2FA"** button
4. If successful, the modal will close and you'll be taken to the admin dashboard

### Step 5: Backup Secret (Optional but Recommended)

- A **backup secret** is displayed below the QR code
- **Copy this secret** and store it in a secure location (password manager, encrypted file, etc.)
- This allows you to manually add the account if you can't scan the QR code
- You can also use this to recover access if you lose your device

## After Setup - Daily Usage

### Every Session

After setting up 2FA, you'll need to verify your identity **each time** you access the admin panel:

1. Log in normally at `/login`
2. If you're an admin, you'll be redirected to the admin panel (default: `/app-console`)
3. A **"Verify Two-Factor Authentication"** modal will appear
4. Open your authenticator app and get the current 6-digit code
5. Enter the code in the modal
6. Click **"Verify"**
7. You'll have access to the admin panel for the session (typically 8 hours)

### Session Expiration

- 2FA session tokens expire after **8 hours** (configurable on backend)
- If your session expires, you'll need to verify again with a fresh code
- A warning badge will appear in the admin header if your session is expired

## Troubleshooting

### "Invalid token" Error

- **Check the code**: Make sure you're entering all 6 digits
- **Check the time**: Your device's clock must be synchronized (authenticator apps require accurate time)
- **Use a fresh code**: The code changes every 30 seconds - make sure you're using the current one

### Can't Scan QR Code

- **Use the backup secret**: Copy the secret key displayed and manually enter it in your authenticator app
- **Manual entry**: In your authenticator app, choose "Enter setup key" or "Manual entry"
- **Enter the details**:
  - Account name: `Expat App: admin@expat.fi` (or your email)
  - Secret key: The backup secret from the modal
  - Type: TOTP (Time-based)

### Lost Device / Can't Access Authenticator

- If you saved the **backup secret**, you can set up the account again on a new device
- If you didn't save the backup secret, contact the system administrator to reset your 2FA

### Session Always Expires

- Sessions expire after 8 hours of inactivity
- This is a security feature - you'll need to verify again after expiration
- Consider keeping your authenticator app easily accessible

## Technical Details

### What Happens Behind the Scenes

1. **Setup Flow**:
   - Frontend calls `GET /management/2fa/setup`
   - Backend generates a TOTP secret and QR code URL
   - Frontend displays QR code and secret
   - User scans QR code and enters verification code
   - Frontend calls `POST /management/2fa/enable` with the code
   - Backend verifies and enables 2FA for the user

2. **Verification Flow**:
   - Frontend calls `POST /management/2fa/verify` with the 6-digit code
   - Backend verifies the code and returns a session token
   - Frontend stores the session token in `sessionStorage` (not `localStorage`)
   - Session token is sent in `X-Admin-2FA-Session` header for all admin requests

3. **Session Management**:
   - Session tokens are stored in `sessionStorage` (cleared when browser closes)
   - Tokens expire after 8 hours (backend configurable)
   - Frontend automatically checks session validity on each admin route access

## Security Best Practices

1. **Don't share your authenticator app** - Keep it secure on your personal device
2. **Save the backup secret** - Store it securely (password manager, encrypted file)
3. **Use a dedicated device** - Consider using a separate device for admin access
4. **Regular backups** - If you use Authy, it can backup your accounts
5. **Don't screenshot the QR code** - Only scan it directly into your app

## Testing 2FA Setup

To test the 2FA setup in development:

1. Ensure backend is running with 2FA endpoints enabled
2. Create an admin user (or assign admin role to existing user)
3. Log in as admin
4. You should see the 2FA setup modal automatically
5. Use a TOTP authenticator app to scan and verify
6. After setup, log out and log back in to test verification flow

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify backend 2FA endpoints are working
3. Ensure your device clock is synchronized
4. Try using the backup secret for manual entry
5. Contact your system administrator


