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
import CalendarView from './messages/CalendarView';

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
  const [activeTab, setActiveTab] = useState<'personal' | 'group' | 'deal' | 'calls' | 'contacts' | 'calendar'>('personal');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [callModal, setCallModal] = useState<{ isOpen: boolean; type: 'audio' | 'video' }>({ isOpen: false, type: 'audio' });
  const [reminders, setReminders] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
    loadReminders();
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
    { value: 'group', label: 'Чаты', icon: 'Users' },
    { value: 'deal', label: 'Обсуждение сделок', icon: 'Briefcase' },
    { value: 'calls', label: 'Звонки', icon: 'PhoneCall' },
    { value: 'contacts', label: 'Контакты', icon: 'BookUser' },
    { value: 'calendar', label: 'Ежедневник', icon: 'Calendar' },
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

  const loadReminders = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const currentDate = new Date();
      const response = await fetch(
        `https://functions.poehali.dev/2bc01794-3584-4941-b485-aec60ee947a8?action=list&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-cache'
        }
      );
      
      if (!response.ok) return;
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      
      const text = await response.text();
      if (!text || text.trim().startsWith('<')) return;
      
      try {
        const data = JSON.parse(text);
        setReminders(data.reminders || []);
      } catch {
        return;
      }
    } catch {
      return;
    }
  };

  const handleAddReminder = async (data: { title: string; description?: string; date: string; time?: string }) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/2bc01794-3584-4941-b485-aec60ee947a8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({ title: 'Успех', description: 'Напоминание создано' });
        loadReminders();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать напоминание', variant: 'destructive' });
    }
  };

  const handleEditReminder = async (id: number, data: any) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/2bc01794-3584-4941-b485-aec60ee947a8', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, ...data })
      });

      if (response.ok) {
        toast({ title: 'Успех', description: 'Напоминание обновлено' });
        loadReminders();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить напоминание', variant: 'destructive' });
    }
  };

  const handleDeleteReminder = async (id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(
        `https://functions.poehali.dev/2bc01794-3584-4941-b485-aec60ee947a8?id=${id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        toast({ title: 'Успех', description: 'Напоминание удалено' });
        loadReminders();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить напоминание', variant: 'destructive' });
    }
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    await handleEditReminder(id, { completed });
  };

  const handleDeleteChat = async (chatId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(
        `https://functions.poehali.dev/b4b60a51-ac3b-4b06-956c-f4f867e9e764?conversationId=${chatId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        toast({ title: 'Успех', description: 'Чат удален' });
        if (selectedChat === chatId) {
          setSelectedChat(null);
        }
        setChats(chats.filter(c => c.id !== chatId));
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось удалить чат', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проверьте подключение к интернету', variant: 'destructive' });
    }
  };

  const messageCounts = {
    personal: chats.filter(c => c.type === 'personal').length,
    group: chats.filter(c => c.type === 'group').length,
    deal: chats.filter(c => c.type === 'deal').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation 
        showMessagesTabs={true}
        activeMessagesTab={activeTab}
        onMessagesTabChange={(tab) => setActiveTab(tab as 'personal' | 'group' | 'deal' | 'calls' | 'contacts' | 'calendar')}
        messageCounts={messageCounts}
      />
      
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'calls' ? (
              <EmptyState type="calls" />
            ) : activeTab === 'contacts' ? (
              <ContactsList userId={currentUserId} toast={toast} />
            ) : activeTab === 'calendar' ? (
              <CalendarView
                reminders={reminders}
                onAddReminder={handleAddReminder}
                onEditReminder={handleEditReminder}
                onDeleteReminder={handleDeleteReminder}
                onToggleComplete={handleToggleComplete}
              />
            ) : (
              <div className="grid lg:grid-cols-3 gap-6 relative">
                <div className={`${selectedChat ? 'hidden lg:block' : 'block'}`}>
                  <ChatList
                    chats={filteredChats}
                    loading={loading}
                    selectedChat={selectedChat}
                    onSelectChat={setSelectedChat}
                    onDeleteChat={handleDeleteChat}
                  />
                </div>

                {selectedChat && (
                  <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:col-span-2 pt-16 pb-0 lg:pt-0 lg:pb-0">
                    <div className="h-full lg:px-0">
                      <ChatWindow
                        currentChat={currentChat}
                        messages={messages}
                        currentUserId={currentUserId}
                        messageText={messageText}
                        setMessageText={setMessageText}
                        onSendMessage={handleSendMessage}
                        onCall={handleCall}
                        toast={toast}
                        onClose={() => setSelectedChat(null)}
                      />
                    </div>
                  </div>
                )}

                {!selectedChat && (
                  <div className="hidden lg:block lg:col-span-2">
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