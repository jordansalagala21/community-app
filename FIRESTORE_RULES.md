# Firestore Security Rules

Your Firestore is likely blocking the user document creation. You need to update your Firestore security rules in the Firebase Console.

## Go to Firebase Console:

1. Go to https://console.firebase.google.com
2. Select your project
3. Click on **Firestore Database** in the left menu
4. Click on the **Rules** tab
5. Replace the rules with the following:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - allow users to create their own document during signup
    match /users/{userId} {
      // Allow user to read their own document
      allow read: if request.auth != null && request.auth.uid == userId;

      // Allow user to create their own document during signup
      allow create: if request.auth != null &&
                       request.auth.uid == userId;

      // Allow user to update their own document (for profile updates)
      allow update: if request.auth != null && request.auth.uid == userId;

      // Allow admins to read, update, and delete any user
      allow read, write, delete: if request.auth != null &&
                                    request.auth.token.email.matches('.*admin.*');
    }

    // Events collection
    match /events/{eventId} {
      // Anyone can read events
      allow read: if true;

      // Authenticated users can update availableTickets (for bookings)
      allow update: if request.auth != null &&
                       request.resource.data.diff(resource.data).affectedKeys().hasOnly(['availableTickets']);

      // Only admins can create and delete
      allow create, delete: if request.auth != null &&
                               request.auth.token.email.matches('.*admin.*');
      allow read: if true;

      // Only admins can write
      allow write: if request.auth != null &&
                      request.auth.token.email.matches('.*admin.*');
    }

    // Clubhouse reservations
    match /clubhouse/{reservationId} {
      // Anyone can read
      allow read: if true;

      // Authenticated users can create reservations
      allow create: if request.auth != null;

      // Only admins can update and delete
      allow update, delete: if request.auth != null &&
                               request.auth.token.email.matches('.*admin.*');
    }

    // Event bookings
    match /bookings/{bookingId} {
      // Authenticated users can read and create bookings
      allow read, create: if request.auth != null;

      // Admins can do everything
      allow read, write, delete: if request.auth != null &&
                                    request.auth.token.email.matches('.*admin.*');
    }
  }
}
```

## After updating rules:

1. Click **Publish** to save the rules
2. Try signing up again

The key rule that was missing is:

```javascript
allow create: if request.auth != null &&
               request.auth.uid == userId &&
               request.resource.data.role == 'resident' &&
               request.resource.data.isApproved == false &&
               request.resource.data.status == 'pending';
```

This allows authenticated users to create their own user document during signup, but only with specific fields set correctly (role=resident, isApproved=false, status=pending).
