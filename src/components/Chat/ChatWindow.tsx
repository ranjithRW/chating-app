// import React, { useState, useEffect, useRef } from 'react';
// import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
// import { db } from '../../lib/firebase';
// import { Message, User as UserType, Chat } from '../../types';
// // Added ArrowLeft for the new back button
// import { Send, Smile, Paperclip, MoreVertical, ArrowLeft } from 'lucide-react'; 
// import { format } from 'date-fns';

// interface ChatWindowProps {
//   currentUser: UserType;
//   chatId: string;
//   chat: Chat;
//   onBack: () => void; // <-- 1. Add the onBack prop to the interface
// }

// export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, chatId, chat, onBack }) => { // <-- 2. Destructure onBack from props
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null); // Add ref for input element

//   useEffect(() => {
//     if (!chatId) return;

//     const q = query(
//       collection(db, 'chats', chatId, 'messages'),
//       orderBy('timestamp', 'asc')
//     );
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const messageData = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         timestamp: doc.data().timestamp?.toDate() || new Date()
//       })) as Message[];
      
//       setMessages(messageData);
//     });

//     return unsubscribe;
//   }, [chatId]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newMessage.trim() || loading) return;

//     setLoading(true);
//     const messageText = newMessage.trim();
//     setNewMessage('');

//     try {
//       const messageData = {
//         text: messageText,
//         senderId: currentUser.uid,
//         senderName: currentUser.displayName || currentUser.email || 'Unknown',
//         timestamp: new Date(),
//         chatId,
//         type: 'text',
//         status: 'sent'
//       };

//       await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

//       await updateDoc(doc(db, 'chats', chatId), {
//         lastMessage: messageData,
//         lastMessageTimestamp: new Date()
//       });

//     } catch (error) {
//       console.error('Error sending message:', error);
//     } finally {
//       setLoading(false);
//       // Focus the input after sending message
//       setTimeout(() => {
//         inputRef.current?.focus();
//       }, 0);
//     }
//   };

//   const getOtherParticipantName = (): string => {
//     if (chat.type === 'group') return chat.name ?? 'Unknown';

//     const otherUserId = chat.participants.find(id => id !== currentUser.uid);
//     if (!otherUserId) return 'Unknown';

//     return chat.participantNames?.[otherUserId] ?? 'Unknown';
//   };

//   const formatMessageTime = (timestamp: Date) => {
//     return format(timestamp, 'HH:mm');
//   };

//   const isMessageFromCurrentUser = (message: Message) => {
//     return message.senderId === currentUser.uid;
//   };

//   return (
//     <div className="flex-1 flex flex-col h-full bg-white">
//       {/* Chat Header */}
//       <div className="bg-gray-50 border-b border-gray-200 p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2"> {/* Reduced space-x for better fit */}
//             {/* 3. Add the Back Button for Mobile */}
//             <button
//               onClick={onBack}
//               className="p-2 -ml-2 hover:bg-gray-200 rounded-full transition-colors md:hidden"
//             >
//               <ArrowLeft className="w-5 h-5 text-gray-600" />
//             </button>
//             <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
//               <span className="text-gray-600 font-medium">
//                 {getOtherParticipantName().charAt(0).toUpperCase()}
//               </span>
//             </div>
//             <div>
//               <h3 className="font-semibold text-gray-900 truncate">{getOtherParticipantName()}</h3>
//               <p className="text-sm text-gray-500">Online</p>
//             </div>
//           </div>
//           <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
//             <MoreVertical className="w-5 h-5 text-gray-600" />
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
//         {messages.length === 0 ? (
//           <div className="text-center text-gray-500 mt-8">
//             <p>No messages yet. Start the conversation!</p>
//           </div>
//         ) : (
//           messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex ${isMessageFromCurrentUser(message) ? 'justify-end' : 'justify-start'}`}
//             >
//               <div
//                 className={`max-w-xs lg:max-w-md h-auto px-4 py-2 rounded-2xl break-words ${
//                   isMessageFromCurrentUser(message)
//                     ? 'bg-green-500 text-white'
//                     : 'bg-white text-gray-900 shadow-sm'
//                 }`}
//               >
//                 <p className="text-sm leading-relaxed">{message.text}</p>
//                 <div className="flex items-center justify-end mt-1 space-x-1">
//                   <span
//                     className={`text-xs ${
//                       isMessageFromCurrentUser(message) ? 'text-green-100' : 'text-gray-500'
//                     }`}
//                   >
//                     {formatMessageTime(message.timestamp)}
//                   </span>
//                   {isMessageFromCurrentUser(message) && (
//                     <div className="text-green-100">
//                       <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
//                         <path
//                           fillRule="evenodd"
//                           d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Message Input */}
//       <div className="bg-white border-t border-gray-200 p-4">
//         <form onSubmit={sendMessage} className="flex items-center space-x-4">
//           <button
//             type="button"
//             className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <Paperclip className="w-5 h-5" />
//           </button>
          
//           <div className="flex-1 relative">
//             <input
//               ref={inputRef} // Add ref to input
//               type="text"
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               placeholder="Type a message..."
//               className="w-full px-4 py-3 pr-12 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
//               disabled={loading}
//               autoFocus // Auto focus on component mount
//             />
//             <button
//               type="button"
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <Smile className="w-5 h-5" />
//             </button>
//           </div>

//           <button
//             type="submit"
//             disabled={!newMessage.trim() || loading}
//             className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//           >
//             <Send className="w-5 h-5" />
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };


import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Message, User as UserType, Chat } from '../../types';
import { Send, Smile, Paperclip, MoreVertical, ArrowLeft } from 'lucide-react'; 
import { format } from 'date-fns';

interface ChatWindowProps {
  currentUser: UserType;
  chatId: string;
  chat: Chat;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, chatId, chat, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get other user ID
  useEffect(() => {
    if (chat.type !== 'group') {
      const otherUser = chat.participants.find(id => id !== currentUser.uid);
      setOtherUserId(otherUser || null);
    }
  }, [chat.participants, currentUser.uid, chat.type]);

  // Listen to messages
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
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

  // Listen to other user's online status for direct chats
  useEffect(() => {
    if (!otherUserId || chat.type === 'group') return;

    const userDocRef = doc(db, 'users', otherUserId);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setIsOtherUserOnline(userData.isOnline || false);
      } else {
        setIsOtherUserOnline(false);
      }
    }, (error) => {
      console.error('Error listening to user status:', error);
      setIsOtherUserOnline(false);
    });

    return unsubscribe;
  }, [otherUserId, chat.type]);

  // Auto-scroll to bottom when new messages arrive
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

      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: messageData,
        lastMessageTimestamp: new Date()
      });

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      // Focus the input after sending message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
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

  // Function to get status text and color
  const getStatusDisplay = () => {
    if (chat.type === 'group') {
      return { text: `${chat.participants.length} participants`, color: 'text-gray-500' };
    }
    
    return {
      text: isOtherUserOnline ? 'Online' : 'Offline',
      color: isOtherUserOnline ? 'text-green-500' : 'text-gray-500'
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Fixed Header at Top */}
      <div className="fixed top-0 left-0 right-0 bg-gray-50 border-b border-gray-200 p-4 z-10 md:relative md:top-auto md:left-auto md:right-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Back Button for Mobile */}
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-200 rounded-full transition-colors md:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 font-medium">
                {getOtherParticipantName().charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 truncate">{getOtherParticipantName()}</h3>
              <p className={`text-sm ${statusDisplay.color} flex items-center`}>
                {/* Online dot indicator */}
                {chat.type !== 'group' && (
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    isOtherUserOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}></span>
                )}
                {statusDisplay.text}
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Container with Auto-scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 pt-20 pb-20 md:pt-0 md:pb-0">
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
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl break-words ${
                  isMessageFromCurrentUser(message)
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
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

      {/* Fixed Message Input at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 md:relative md:bottom-auto md:left-auto md:right-auto">
        <form onSubmit={sendMessage} className="flex items-center space-x-4">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 pr-12 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
              disabled={loading}
              autoFocus
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