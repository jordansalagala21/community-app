# Admin Authentication Setup Guide

## Overview

The admin authentication system is now set up using Firebase Authentication. This allows secure access to the admin dashboard.

## What Was Created

### 1. Authentication Context (`src/contexts/AuthContext.tsx`)

- Manages user authentication state
- Provides login/logout functions
- Checks if user is an admin based on email
- Used throughout the app via `useAuth()` hook

### 2. Protected Route Component (`src/components/ProtectedRoute.tsx`)

- Protects admin-only pages
- Shows loading spinner while checking auth
- Redirects unauthorized users
- Can require admin privileges

### 3. Admin Login Page (`src/pages/admin-login.tsx`)

- Clean, modern login interface
- Email/password authentication
- Error handling
- Matches the navy blue theme

### 4. Admin Dashboard (`src/pages/dashboard.tsx`)

- Overview statistics (residents, events, reservations, announcements)
- Recent activity feed
- Quick action buttons
- Pending items section
- Protected route (admin-only access)

## Setup Instructions

### Step 1: Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enable Authentication:

   - Go to Authentication → Sign-in method
   - Enable "Email/Password"

3. Get your config:

   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the Firebase configuration

4. Create `.env` file in project root:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 2: Create Admin User

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter admin email (must be one of these):
   - `admin@yourcommunity.com`
   - `office@yourcommunity.com`
   - Or any email containing "admin"
4. Set a strong password
5. Click "Add user"

### Step 3: Test Authentication

1. Start the dev server:

```bash
npm run dev
```

2. Navigate to `/admin/login`

3. Sign in with the admin credentials you created

4. You should be redirected to `/admin/dashboard`

## How It Works

### Admin Check Logic

The system determines if a user is an admin based on their email:

```typescript
// These are considered admin emails:
const adminEmails = ["admin@yourcommunity.com", "office@yourcommunity.com"];

// Or any email containing "admin"
isAdmin = adminEmails.includes(email) || email.includes("admin");
```

### Protected Routes

The dashboard uses the `ProtectedRoute` component:

```tsx
<ProtectedRoute requireAdmin={true}>
  <DashboardContent />
</ProtectedRoute>
```

This ensures:

- User must be logged in
- User must be an admin
- Non-admins are shown an access denied page

## Available Routes

- `/` - Public home page
- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard (requires admin authentication)

## Customizing Admin Access

To customize who can access the admin panel, edit:

**File:** `src/contexts/AuthContext.tsx`

```typescript
// Method 1: Use specific email addresses
const adminEmails = ["admin@yourcommunity.com", "youremail@example.com"];

// Method 2: Use email pattern
setIsAdmin(user.email?.includes("@yourcommunity.com") || false);

// Method 3: Use Firestore (recommended for production)
// Store admin status in Firestore and check here
```

## Security Best Practices

### 1. Firebase Security Rules

Set up Firestore security rules to prevent unauthorized access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null &&
                      request.auth.token.email.matches('.*admin.*');
    }
  }
}
```

### 2. Environment Variables

- Never commit `.env` file to git
- `.env` is already in `.gitignore`
- Use `.env.example` as a template

### 3. Production Recommendations

- Use Custom Claims for role management
- Implement email verification
- Add password reset functionality
- Set up admin approval workflow
- Enable Firebase App Check

## Next Steps

### Add More Admin Features

1. Create event management page
2. Add announcement creation form
3. Build reservation approval system
4. Add resident management
5. Create settings page

### Enhance Security

1. Add multi-factor authentication
2. Implement role-based permissions
3. Add audit logging
4. Set up session management

### Improve UX

1. Add "Remember me" functionality
2. Implement password reset
3. Add email verification
4. Create onboarding flow

## Troubleshooting

### "Failed to log in"

- Check Firebase credentials in `.env`
- Verify Email/Password is enabled in Firebase Console
- Ensure user exists in Firebase Authentication

### "Access Denied" when logged in

- Check if email matches admin criteria
- Look at console logs for `isAdmin` value
- Verify AuthContext logic

### Can't access dashboard

- Make sure you're navigating to `/admin/dashboard`
- Check browser console for errors
- Verify Firebase is initialized correctly

## Support

For issues or questions:

1. Check Firebase Console for authentication errors
2. Look at browser console for JavaScript errors
3. Review Firebase documentation
4. Check the project's GitHub issues

---

**Note:** This is a basic authentication setup. For production use, consider implementing additional security measures like email verification, rate limiting, and proper role management using Firebase Custom Claims.
