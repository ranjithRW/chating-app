import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Chat, User as UserType } from '../../types';
import { Search, MessageCircle, MoreVertical, Settings } from 'lucide-react';
import { format } from 'date-fns';

interface ChatSidebarProps {
  currentUser: UserType;
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onLogout: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentUser,
  selectedChatId,
  onChatSelect,
  onLogout
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          ...data,
          // ✅ Convert Firestore Timestamp to JS Date (or null if missing)
          lastMessageTimestamp: data.lastMessageTimestamp
            ? (data.lastMessageTimestamp.toDate
              ? data.lastMessageTimestamp.toDate()
              : new Date(data.lastMessageTimestamp))
            : null,
        } as Chat;
      });

      setChats(chatData);
    });

    return unsubscribe;
  }, [currentUser]);

  const filteredChats = chats.filter(chat => {
    const chatName =
      chat.name ||
      chat.participantNames[
        Object.keys(chat.participantNames).find(id => id !== currentUser.uid) || ''
      ] ||
      'Unknown';

    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherParticipantName = (chat: Chat): string => {
    if (chat.type === 'group') return chat.name ?? 'Unknown';

    const otherUserId = chat.participants.find(id => id !== currentUser.uid);
    if (!otherUserId) return 'Unknown';

    return chat.participantNames?.[otherUserId] ?? 'Unknown';
  };

  const formatLastMessageTime = (timestamp?: Date | null) => {
    if (!timestamp) return '';
    try {
      return format(timestamp, 'HH:mm');
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {currentUser.displayName || 'You'}
              </h2>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setShowSettings(false);
                    // Add profile settings logic here
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No chats yet</p>
            <p className="text-sm mt-2">Start a conversation to see it here</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChatId === chat.id
                    ? 'bg-green-50 border-l-4 border-green-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {getOtherParticipantName(chat).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {getOtherParticipantName(chat)}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(chat.lastMessageTimestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {chat.lastMessage?.text || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
