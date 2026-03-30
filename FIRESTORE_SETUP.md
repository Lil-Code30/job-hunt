# Firestore Setup

## 1. Create Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project `job-hunt-3b2da`
3. Click **Firestore Database** in left sidebar
4. Click **Create database**
5. Choose **Start in test mode** (for development)
6. Select a location closest to you
7. Click **Enable**

---

## 2. Collections Structure

Collections are created automatically when you add documents. The app handles this for you.

### `jobs` collection

```
jobs/{jobId}
├── userId: string           // Firebase Auth user UID
├── title: string            // "Senior Frontend Engineer"
├── company: string          // "Acme Inc."
├── location: string         // "Montreal, QC"
├── remote: boolean          // true/false
├── url: string (optional)   // "https://linkedin.com/jobs/..."
├── source: string           // "LinkedIn", "Wellfound", etc.
├── status: string          // "bookmarked", "applied", etc.
├── tags: array<string>      // ["react", "senior"]
├── salary: object (optional)
│   ├── min: number
│   ├── max: number
│   └── currency: string
├── description: string     // Markdown text
├── notes: string            // Markdown timeline
├── contacts: array<object>  // [{id, name, role, ...}]
├── createdAt: timestamp
└── updatedAt: timestamp
```

### `statusHistory` subcollection

```
jobs/{jobId}/statusHistory/{entryId}
├── status: string
├── changedAt: timestamp
└── note: string (optional)
```

---

## 3. Security Rules

Go to **Firestore → Rules** and paste:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    match /jobs/{jobId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.userId);
      
      match /statusHistory/{entryId} {
        allow read, create: if isOwner(get(/databases/$(database)/documents/jobs/$(jobId)).data.userId);
      }
    }
  }
}
```

Click **Publish**.

---

## 4. Composite Index (Optional)

For better query performance:

1. Go to **Firestore → Indexes**
2. Click **Add Index**
3. Collection: `jobs`
4. Fields: `userId` (Ascending), `updatedAt` (Descending)
5. Click **Create**

---

## 5. Enable Authentication

1. Go to **Authentication → Get started**
2. Enable **Google** (and **Email/Password** if needed)
3. Add your domain to **Authorized domains**:
   - `localhost` (for development)
   - Your deployment domain (e.g., `job-hunt.vercel.app`)

---

That's it! The app will create collections and documents automatically when you add jobs.
