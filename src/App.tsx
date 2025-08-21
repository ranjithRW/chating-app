import React, { useEffect, useState } from 'react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/Auth/AuthForm';
import { ChatLayout } from './components/Layout/ChatLayout';
import { User as UserType } from './types';

function App() {
  const { user, loading, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    if (user) {
      const userData: UserType = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        isOnline: true,
        lastSeen: new Date()
      };

      setCurrentUser(userData);

      // Update user's online status
      const updateUserStatus = async () => {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            // ==========================================================
            // THE FIX: Ensure the email is always lowercase when updating the document
            email: user.email?.toLowerCase() || '',
            // ==========================================================
            displayName: user.displayName,
            photoURL: user.photoURL,
            isOnline: true,
            lastSeen: new Date()
          }, { merge: true });
        } catch (error) {
          console.error('Error updating user status:', error);
        }
      };

      updateUserStatus();

      // Set up offline status update when user leaves
      const handleBeforeUnload = async () => {
        await updateDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastSeen: new Date()
        });
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        // Update offline status when component unmounts
        if (user) {
          updateDoc(doc(db, 'users', user.uid), {
            isOnline: false,
            lastSeen: new Date()
          }).catch(console.error);
        }
      };
    } else {
      setCurrentUser(null);
    }
  }, [user]);

  const handleAuthSuccess = () => {
    // Auth state will be handled by useAuth hook
  };

  const handleLogout = async () => {
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          isOnline: false,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Error updating offline status:', error);
      }
    }
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !currentUser) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return <ChatLayout currentUser={currentUser} onLogout={handleLogout} />;
}

export default App;