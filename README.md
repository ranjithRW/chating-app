# WhatsApp Clone - Real-time Chat Application

A modern real-time chat application built with React, TypeScript, Tailwind CSS, and Firebase. Features include user authentication, real-time messaging, and a beautiful WhatsApp-inspired interface.

## Features

- 🔐 **User Authentication**: Email/password signup and login with Firebase Auth
- 💬 **Real-time Messaging**: Instant message delivery using Firestore real-time updates
- 👥 **User Search**: Find and start conversations with other users by email
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Clean, WhatsApp-inspired interface with smooth animations
- ⚡ **Real-time Status**: Online/offline user status tracking
- 🔍 **Chat Search**: Search through your conversations
- 💾 **Message History**: Persistent chat history stored in Firestore

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend/Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Real-time Updates**: Firestore real-time listeners
- **Icons**: Lucide React
- **Build Tool**: Vite

## Prerequisites

- Node.js 16+ installed
- Firebase project set up
- Firebase configuration keys

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** with Email/Password provider
3. Enable **Firestore Database** in production mode
4. Get your Firebase configuration from Project Settings

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Update Firebase configuration in `src/lib/firebase.ts`:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Firestore Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat documents
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages in chats
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/chats/$(chatId)) &&
        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
  }
}
```

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   └── AuthForm.tsx          # Login/signup form
│   ├── Chat/
│   │   ├── ChatSidebar.tsx       # Chat list sidebar
│   │   ├── ChatWindow.tsx        # Main chat interface
│   │   └── NewChatModal.tsx      # New chat creation modal
│   └── Layout/
│       └── ChatLayout.tsx        # Main app layout
├── hooks/
│   └── useAuth.ts                # Authentication hook
├── lib/
│   └── firebase.ts               # Firebase configuration
├── types/
│   └── index.ts                  # TypeScript type definitions
├── App.tsx                       # Main app component
└── main.tsx                      # App entry point
```

## Features Overview

### Authentication
- Email/password registration and login
- User profile creation and management
- Online/offline status tracking
- Secure logout with status updates

### Chat System
- One-on-one messaging
- Real-time message delivery
- Message timestamps and delivery status
- Chat history persistence
- User search by email address

### User Interface
- WhatsApp-inspired design
- Responsive layout for all devices
- Smooth animations and transitions
- Dark/light theme support
- Intuitive navigation

## Development

To run the development server:

```bash
npm run dev
```

To build for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Deployment

The app can be deployed to any static hosting service like:
- Netlify
- Vercel
- Firebase Hosting
- GitHub Pages

Build the project and upload the `dist` folder to your hosting provider.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.