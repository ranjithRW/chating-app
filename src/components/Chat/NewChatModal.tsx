import React, {useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User as UserType } from '../../types';
import { X, Search, UserPlus } from 'lucide-react';

interface NewChatModalProps {
  currentUser: UserType;
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onChatCreated
}) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!searchEmail.trim()) {
      setSearchedUsers([]);
      return;
    }

    setLoading(true);
    try {
      // --- START OF DEBUGGING AND FIX ---
      const emailToSearch = searchEmail.toLowerCase();
      console.log("1. Searching for email field with value:", emailToSearch);

      // This query now correctly looks for a field named 'email'
      const q = query(
        collection(db, 'users'),
        where('email', '==', emailToSearch)
      );

      const snapshot = await getDocs(q);
      console.log("2. Firestore query returned:", snapshot.size, "documents.");

      if (snapshot.size > 0) {
        snapshot.docs.forEach(doc => {
          console.log("3. Found document data:", doc.id, doc.data());
        });
      }
      // --- END OF DEBUGGING AND FIX ---

      const users = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() } as UserType))
        .filter(user => user.uid !== currentUser.uid);
      
      setSearchedUsers(users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (otherUser: UserType) => {
    try {
      // Check if chat already exists
      const existingChatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', currentUser.uid)
      );
      
      const existingChats = await getDocs(existingChatsQuery);
      const existingChat = existingChats.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(otherUser.uid) && data.participants.length === 2;
      });

      if (existingChat) {
        onChatCreated(existingChat.id);
        onClose();
        return;
      }

      // Create new chat
      const chatData = {
        participants: [currentUser.uid, otherUser.uid],
        participantNames: {
          [currentUser.uid]: currentUser.displayName || currentUser.email || 'Unknown',
          [otherUser.uid]: otherUser.displayName || otherUser.email || 'Unknown'
        },
        type: 'direct',
        createdAt: new Date(),
        lastMessageTimestamp: new Date()
      };

      const chatRef = await addDoc(collection(db, 'chats'), chatData);
      onChatCreated(chatRef.id);
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Using a debounce effect is good practice for search inputs
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Start New Chat</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Search by email address..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>

          {loading && (
            <div className="text-center py-4 text-gray-500">
              Searching...
            </div>
          )}

          {!loading && searchedUsers.length === 0 && searchEmail && (
            <div className="text-center py-4 text-gray-500">
              No users found with that email address
            </div>
          )}

          {searchedUsers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Found Users</h3>
              {searchedUsers.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.displayName || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => createChat(user)}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};