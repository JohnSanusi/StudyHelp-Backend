# OAuth Setup Guide

This guide will help you set up Google OAuth for the StudyHub backend.

## Prerequisites

- Google Cloud Console account
- Access to your `.env` file

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name (e.g., "StudyHub") and click **Create**

### Step 2: Enable Google+ API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:

   - User Type: **External**
   - App name: **StudyHub**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Click **Save and Continue** (default scopes are fine)
   - Test users: Add your email for testing
   - Click **Save and Continue**

4. Back to Create OAuth client ID:

   - Application type: **Web application**
   - Name: **StudyHub Backend**
   - Authorized redirect URIs:
     - Add: `http://localhost:5000/api/auth/google/callback`
     - For production, also add: `https://yourdomain.com/api/auth/google/callback`
   - Click **Create**

5. Copy the **Client ID** and **Client Secret**

### Step 4: Add to Environment Variables

Add to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## Session Secret

Generate a secure session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to your `.env` file:

```env
SESSION_SECRET=your-generated-secret-here
```

---

## Complete .env File

Your `.env` file should now include:

```env
# Existing variables
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session Secret
SESSION_SECRET=your-session-secret
```

---

## Testing OAuth

### Start the Server

```bash
npm run dev
```

### Test Google OAuth

1. Open browser and navigate to: `http://localhost:5000/api/auth/google`
2. Sign in with your Google account
3. Grant permissions
4. You should be redirected to your frontend with a token

---

## Production Setup

When deploying to production:

1. **Update OAuth Redirect URIs** in Google Cloud Console:

   - Replace `http://localhost:5000` with your production domain
   - Use HTTPS: `https://yourdomain.com/api/auth/google/callback`

2. **Update Environment Variables**:

   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourfrontend.com
   NODE_ENV=production
   ```

3. **Verify OAuth App**:
   - Submit Google OAuth app for verification if needed

---

## Troubleshooting

### "Redirect URI mismatch"

- Ensure the callback URL in your `.env` matches exactly what's in the Google Cloud Console
- Check for trailing slashes or http vs https mismatches

### "Access blocked: This app's request is invalid"

- Make sure you've added your email as a test user in Google OAuth consent screen
- Verify the OAuth consent screen is configured
