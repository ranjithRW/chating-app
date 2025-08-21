import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Message, User as UserType, Chat } from '../../types';
import { Send, Smile, Paperclip, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface ChatWindowProps {
  currentUser: UserType;
  chatId: string;
  chat: Chat;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, chatId, chat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    console.log("Chat ID:", q);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Message[];
      
      setMessages(messageData);
    });

    return unsubscribe;
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    // --- START OF DEBUGGING ---
    console.log("Attempting to send message...");
    console.log("Current User UID:", currentUser.uid);
    console.log("Chat ID:", chatId);

    try {
      const messageData = {
        text: messageText,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email || 'Unknown',
        timestamp: new Date(),
        chatId,
        type: 'text',
        status: 'sent'
      };
      console.log("1. Message data prepared:", messageData);

      // Add message to chat's messages subcollection
      const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
      console.log("2. Successfully added message to subcollection with ID:", messageRef.id);

      // Update chat's last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: messageData,
        lastMessageTimestamp: new Date()
      });
      console.log("3. Successfully updated parent chat document's lastMessage.");
      // --- END OF DEBUGGING ---

    } catch (error) {
      // This will catch any errors, especially permission errors from Firestore rules
      console.error('!!! ERROR SENDING MESSAGE !!!:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipantName = (): string => {
    if (chat.type === 'group') return chat.name ?? 'Unknown';

    const otherUserId = chat.participants.find(id => id !== currentUser.uid);
    if (!otherUserId) return 'Unknown';

    return chat.participantNames?.[otherUserId] ?? 'Unknown';
  };

  const formatMessageTime = (timestamp: Date) => {
    return format(timestamp, 'HH:mm');
  };

  const isMessageFromCurrentUser = (message: Message) => {
    return message.senderId === currentUser.uid;
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {getOtherParticipantName().charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{getOtherParticipantName()}</h3>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isMessageFromCurrentUser(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isMessageFromCurrentUser(message)
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <span
                    className={`text-xs ${
                      isMessageFromCurrentUser(message) ? 'text-green-100' : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.timestamp)}
                  </span>
                  {isMessageFromCurrentUser(message) && (
                    <div className="text-green-100">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex items-center space-x-4">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 pr-12 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};