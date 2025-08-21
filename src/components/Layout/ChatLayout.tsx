import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Chat, User as UserType } from '../../types';
import { ChatSidebar } from '../Chat/ChatSidebar';
import { ChatWindow } from '../Chat/ChatWindow';
import { NewChatModal } from '../Chat/NewChatModal';
import { MessageCircle, Plus } from 'lucide-react';

interface ChatLayoutProps {
  currentUser: UserType;
  onLogout: () => void;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ currentUser, onLogout }) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  useEffect(() => {
    if (!selectedChatId) {
      setSelectedChat(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'chats', selectedChatId), (doc) => {
      if (doc.exists()) {
        setSelectedChat({ id: doc.id, ...doc.data() } as Chat);
      }
    });

    return unsubscribe;
  }, [selectedChatId]);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  // New handler to allow returning to the chat list on mobile
  const handleBackToSidebar = () => {
    setSelectedChatId(null);
  };

  const handleChatCreated = (chatId: string) => {
    setSelectedChatId(chatId);
    setShowNewChatModal(false);
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* 
        Responsive Sidebar Container
        - On mobile: Only visible when no chat is selected (`selectedChatId` is null).
        - On desktop (`md:`): Always visible.
      */}
      <div
        className={`
          ${selectedChatId ? 'hidden md:flex' : 'flex'}
          w-full md:w-80 flex-shrink-0
        `}
      >
        <ChatSidebar
          currentUser={currentUser}
          selectedChatId={selectedChatId}
          onChatSelect={handleChatSelect}
          onLogout={onLogout}
        />
      </div>

      {/* 
        Responsive Main Content Container (Chat Window or Welcome Screen)
        - On mobile: Only visible when a chat is selected.
        - On desktop (`md:`): Always visible.
      */}
      <div
        className={`
          ${selectedChatId ? 'flex' : 'hidden md:flex'}
          flex-1 flex flex-col
        `}
      >
        {selectedChat && selectedChatId ? (
          <ChatWindow
            currentUser={currentUser}
            chatId={selectedChatId}
            chat={selectedChat}
            // IMPORTANT: Pass the 'onBack' handler to ChatWindow.
            // You will need to modify ChatWindow to show a back button on mobile
            // that calls this function.
            onBack={handleBackToSidebar}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center p-4"> {/* Added padding for small screens */}
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to ChatApp
              </h2>
              <p className="text-gray-500 mb-8 max-w-md">
                Select a chat from the sidebar to start messaging, or create a new chat to begin a conversation.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 
        Floating Action Button for Mobile
        - Only shows on mobile (`md:hidden`) and when the chat list is visible.
      */}
      {!selectedChatId && (
        <button
          onClick={() => setShowNewChatModal(true)}
          className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 z-50"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
      {selectedChatId && (
        <button
          onClick={() => setShowNewChatModal(true)}
          className="hidden md:flex fixed bottom-6 left-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 z-50"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}


      <NewChatModal
        currentUser={currentUser}
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};