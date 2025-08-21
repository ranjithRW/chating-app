export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  lastSeen?: Date;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  chatId: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  lastMessage?: Message;
  lastMessageTimestamp?: Date;
  unreadCount?: { [key: string]: number };
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
}