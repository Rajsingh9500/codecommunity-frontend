export type UserRole = "client" | "developer" | "admin";

export interface UserType {
  _id: string;
  name: string;
  role: UserRole;
  lastMessage?: string | null;
  lastMessageTime?: string | null;
  unreadCount?: number; // ✅ number of unread messages from this user
}

// ✅ Minimal user data for message sender/receiver
export interface MessageUser {
  _id: string;
  name: string;
  role: UserRole;
}

export interface MessageType {
  _id: string;
  sender: { _id: string; name: string; role: string };
  receiver: { _id: string; name: string; role: string };
  message: string;
  timestamp: string;
  delivered?: boolean;
  read?: boolean;
}


// ✅ Unread m
// essages info per conversation
export interface UnreadMessageType {
  fromUserId: string;   // sender's ID
  toUserId: string;     // receiver's ID
  count: number;        // number of unread messages
  lastMessage?: string;
  lastMessageTime?: string;
}


