import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { VkCallModal } from '@/components/VkCallModal';
import MessagesTabs from './messages/MessagesTabs';
import EmptyState from './messages/EmptyState';
import ChatList from './messages/ChatList';
import ChatWindow from './messages/ChatWindow';
import ContactsList from './messages/ContactsList';

interface Chat {
  id: number;
  type: 'personal' | 'group' | 'deal';
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
  participants?: number;
  dealStatus?: string;
  vkId?: string;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  createdAt: string;
  isRead: boolean;
}

const Messages = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'personal' | 'group' | 'deal' | 'calls' | 'contacts'>('personal');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [callModal, setCallModal] = useState<{ isOpen: boolean; type: 'audio' | 'video' }>({ isOpen: false, type: 'audio' });
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    loadConversations();
  }, [activeTab]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    const state = location.state as { openChatId?: number };
    if (state?.openChatId && chats.length > 0) {
      setSelectedChat(state.openChatId);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, chats]);

  const loadUserData = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    }
  };

  const loadConversations = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d?action=conversations&type=${activeTab}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setChats(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить чаты',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !selectedChat) return;

    try {
      const response = await fetch(
        `https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d?action=messages&conversationId=${selectedChat}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const tabs = [
    { value: 'personal', label: 'Личные сообщения', icon: 'MessageCircle' },
    { value: 'group', label: 'Групповые чаты', icon: 'Users' },
    { value: 'deal', label: 'Обсуждение сделок', icon: 'Briefcase' },
    { value: 'calls', label: 'Звонки', icon: 'PhoneCall' },
    { value: 'contacts', label: 'Телефонная книга', icon: 'BookUser' },
  ];

  const filteredChats = chats.filter(chat => chat.type === activeTab);
  const currentChat = chats.find(chat => chat.id === selectedChat);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: selectedChat,
          content: messageText
        })
      });

      if (response.ok) {
        setMessageText('');
        loadMessages();
        loadConversations();
      } else {
        toast({
          title: 'Ошибка отправки',
          description: 'Не удалось отправить сообщение',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Ошибка отправки',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    }
  };

  const handleCall = (type: 'audio' | 'video') => {
    setCallModal({ isOpen: true, type });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-32 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">
                {activeTab === 'calls' && 'Звонки'}
                {activeTab === 'contacts' && 'Телефонная книга'}
                {!['calls', 'contacts'].includes(activeTab) && 'Сообщения'}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === 'calls' && 'История ваших звонков'}
                {activeTab === 'contacts' && 'Ваши контакты'}
                {!['calls', 'contacts'].includes(activeTab) && 'Все ваши чаты в одном месте'}
              </p>
            </div>

            <MessagesTabs
              tabs={tabs}
              activeTab={activeTab}
              chats={chats}
              onTabChange={(tab) => setActiveTab(tab as 'personal' | 'group' | 'deal' | 'calls' | 'contacts')}
            />

            {activeTab === 'calls' ? (
              <EmptyState type="calls" />
            ) : activeTab === 'contacts' ? (
              <ContactsList userId={currentUserId} toast={toast} />
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <ChatList
                  chats={filteredChats}
                  loading={loading}
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                />

                <ChatWindow
                  currentChat={currentChat}
                  messages={messages}
                  currentUserId={currentUserId}
                  messageText={messageText}
                  setMessageText={setMessageText}
                  onSendMessage={handleSendMessage}
                  onCall={handleCall}
                  toast={toast}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <VkCallModal
        isOpen={callModal.isOpen}
        onClose={() => setCallModal({ ...callModal, isOpen: false })}
        recipientId={currentChat?.vkId ? parseInt(currentChat.vkId) : undefined}
        recipientName={currentChat?.name || 'Пользователь'}
        callType={callModal.type}
      />
    </div>
  );
};

export default Messages;