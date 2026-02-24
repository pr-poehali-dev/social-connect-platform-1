import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Chat, Message } from './types';

const MESSAGES_URL = 'https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d';

export const useMessagesData = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'personal' | 'group' | 'deal' | 'live'>('personal');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [callModal, setCallModal] = useState<{ isOpen: boolean; type: 'audio' | 'video' }>({ isOpen: false, type: 'audio' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reminders, setReminders] = useState<any[]>([]);
  const { toast } = useToast();
  const conversationsCache = useRef<Record<string, Chat[]>>({});
  const messagesCache = useRef<Record<number, Message[]>>({});

  useEffect(() => {
    loadUserData();
    loadReminders();
    loadSosChats();
     
  }, []);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  useEffect(() => {
    const state = location.state as { openChatId?: number };
    if (state?.openChatId && chats.length > 0) {
      console.log('[Messages] Opening chat from state:', state.openChatId);
      console.log('[Messages] Total chats loaded:', chats.length);
      console.log('[Messages] Available chats:', chats.map(c => ({ id: c.id, name: c.name, lastMessage: c.lastMessage })));
      const chatExists = chats.find(c => c.id === state.openChatId);
      if (chatExists) {
        console.log('[Messages] Chat found! Opening:', chatExists);
        setSelectedChat(state.openChatId);
      } else {
        console.warn('[Messages] Chat not found in loaded chats, reloading conversations');
        loadConversations().then(() => {
          console.log('[Messages] After reload, setting chat to:', state.openChatId);
          setSelectedChat(state.openChatId);
        });
      }
      window.history.replaceState({}, document.title);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (conversationsCache.current[activeTab]) {
      setChats(conversationsCache.current[activeTab]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d?action=conversations&type=${activeTab}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        const conversations = data.conversations || [];
        conversationsCache.current[activeTab] = conversations;
        setChats(conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast({ title: 'Ошибка загрузки', description: 'Не удалось загрузить чаты', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !selectedChat) return;

    if (messagesCache.current[selectedChat]) {
      setMessages(messagesCache.current[selectedChat]);
      return;
    }

    try {
      const response = await fetch(
        `https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d?action=messages&conversationId=${selectedChat}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        const msgs = data.messages || [];
        messagesCache.current[selectedChat] = msgs;
        setMessages(msgs);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ conversationId: selectedChat, content: messageText })
      });

      if (response.ok) {
        setMessageText('');
        delete messagesCache.current[selectedChat!];
        loadMessages();
      } else {
        toast({ title: 'Ошибка отправки', description: 'Не удалось отправить сообщение', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({ title: 'Ошибка отправки', description: 'Проверьте подключение к интернету', variant: 'destructive' });
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
        { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-cache' }
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditReminder = async (id: number, data: any) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/2bc01794-3584-4941-b485-aec60ee947a8', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
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
        `https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d?conversationId=${chatId}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        toast({ title: 'Успех', description: 'Чат удален' });
        if (selectedChat === chatId) setSelectedChat(null);
        loadConversations();
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось удалить чат', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проверьте подключение к интернету', variant: 'destructive' });
    }
  };

  const handleClearChat = async (chatId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'clear', conversationId: chatId })
      });
      if (response.ok) {
        toast({ title: 'Успех', description: 'Чат очищен' });
        loadMessages();
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось очистить чат', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проверьте подключение к интернету', variant: 'destructive' });
    }
  };

  const handleBlockUser = async (userId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'block', userId })
      });
      if (response.ok) {
        toast({
          title: 'Пользователь заблокирован',
          description: 'Вы больше не будете получать сообщения от этого пользователя',
          variant: 'destructive'
        });
        if (selectedChat) setSelectedChat(null);
        loadConversations();
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось заблокировать пользователя', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проверьте подключение к интернету', variant: 'destructive' });
    }
  };

  const loadSosChats = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch(
        `${MESSAGES_URL}?action=sos-active`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const sosChats: Chat[] = (data.requests || []).map((r: { conversation_id: number; creator_name: string; reason: string; id: number }) => ({
        id: r.conversation_id,
        type: 'sos' as const,
        name: `SOS: ${r.creator_name}`,
        avatar: '',
        lastMessage: r.reason,
        time: '',
        unread: 0,
        isSos: true,
        sosRequestId: r.id,
      }));
      setChats(prev => {
        const withoutSos = prev.filter(c => c.type !== 'sos');
        return [...sosChats, ...withoutSos];
      });
    } catch { /* ignore */ }
  };

  const handleSosCreated = (conversationId: number) => {
    delete conversationsCache.current['sos'];
    loadSosChats().then(() => {
      setSelectedChat(conversationId);
    });
  };

  const handleSosResolve = async (sosRequestId: number, conversationId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch(
        `${MESSAGES_URL}?action=sos-resolve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ sosId: sosRequestId }),
        }
      );
      if (res.ok) {
        toast({ title: '✅ Проблема решена', description: 'Чат SOS закрыт для всех участников' });
        setSelectedChat(null);
        setChats(prev => prev.filter(c => c.id !== conversationId));
      }
    } catch { /* ignore */ }
  };

  const currentChat = chats.find(chat => chat.id === selectedChat);

  const messageCounts = {
    personal: chats.filter(c => c.type === 'personal').length,
    group: chats.filter(c => c.type === 'group').length,
    deal: chats.filter(c => c.type === 'deal').length,
  };

  return {
    activeTab, setActiveTab,
    selectedChat, setSelectedChat,
    messageText, setMessageText,
    chats, setChats,
    messages,
    loading,
    currentUserId,
    callModal, setCallModal,
    reminders,
    toast,
    currentChat,
    messageCounts,
    handleSendMessage,
    handleCall,
    handleAddReminder,
    handleEditReminder,
    handleDeleteReminder,
    handleToggleComplete,
    handleDeleteChat,
    handleClearChat,
    handleBlockUser,
    handleSosCreated,
    handleSosResolve,
  };
};
