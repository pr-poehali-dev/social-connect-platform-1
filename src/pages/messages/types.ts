export interface Chat {
  id: number;
  type: 'personal' | 'group' | 'deal' | 'live' | 'sos';
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
  participants?: number;
  dealStatus?: string;
  vkId?: string;
  userId?: number;
  sosRequestId?: number;
  isSos?: boolean;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  createdAt: string;
  isRead: boolean;
}
