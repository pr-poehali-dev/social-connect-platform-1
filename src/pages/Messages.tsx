import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { VkCallModal } from '@/components/VkCallModal';

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

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={activeTab === tab.value ? 'default' : 'outline'}
                  className="gap-2 rounded-2xl flex-shrink-0"
                  onClick={() => setActiveTab(tab.value as 'personal' | 'group' | 'deal' | 'calls' | 'contacts')}
                >
                  <Icon name={tab.icon} size={18} />
                  {tab.label}
                  {!['calls', 'contacts'].includes(tab.value) && (
                    <Badge variant={activeTab === tab.value ? 'secondary' : 'outline'}>
                      {chats.filter(c => c.type === tab.value).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {activeTab === 'calls' ? (
              <Card className="rounded-3xl border-2">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Icon name="PhoneCall" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">История звонков</h3>
                    <p className="text-muted-foreground">Здесь будет отображаться история ваших звонков</p>
                  </div>
                </CardContent>
              </Card>
            ) : activeTab === 'contacts' ? (
              <Card className="rounded-3xl border-2">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Icon name="BookUser" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Телефонная книга</h3>
                    <p className="text-muted-foreground">Здесь будут отображаться ваши контакты</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="rounded-3xl border-2 lg:col-span-1">
                  <CardContent className="p-0">
                    <div className="p-4 border-b">
                      <div className="relative">
                        <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Поиск чатов..."
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>

                    <ScrollArea className="h-[600px]">
                      {loading ? (
                        <div className="text-center py-12">
                          <Icon name="Loader2" size={48} className="mx-auto mb-4 text-muted-foreground animate-spin" />
                          <p className="text-muted-foreground">Загрузка чатов...</p>
                        </div>
                      ) : filteredChats.length === 0 ? (
                        <div className="text-center py-12">
                          <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">Нет чатов</p>
                          <p className="text-sm text-muted-foreground">Начните общение с другими пользователями</p>
                        </div>
                      ) : (
                      filteredChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
                            selectedChat === chat.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => setSelectedChat(chat.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={chat.avatar} alt={chat.name} />
                                <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {chat.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                  {chat.time}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm text-muted-foreground truncate">
                                  {chat.lastMessage}
                                </p>
                                {chat.unread > 0 && (
                                  <Badge className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs flex-shrink-0">
                                    {chat.unread}
                                  </Badge>
                                )}
                              </div>

                              {chat.type === 'group' && chat.participants && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <Icon name="Users" size={12} />
                                  {chat.participants} участников
                                </div>
                              )}

                              {chat.type === 'deal' && chat.dealStatus && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {chat.dealStatus}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-2 lg:col-span-2">
                {currentChat ? (
                  <CardContent className="p-0 flex flex-col h-[730px]">
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={currentChat.avatar} alt={currentChat.name} />
                          <AvatarFallback>{currentChat.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{currentChat.name}</h3>
                          {currentChat.type === 'personal' && (
                            <p className="text-xs text-muted-foreground">
                              {currentChat.online ? 'В сети' : 'Не в сети'}
                            </p>
                          )}
                          {currentChat.type === 'group' && (
                            <p className="text-xs text-muted-foreground">
                              {currentChat.participants} участников
                            </p>
                          )}
                          {currentChat.type === 'deal' && (
                            <p className="text-xs text-muted-foreground">
                              {currentChat.dealStatus}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {currentChat.type === 'personal' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full hover:bg-blue-50"
                              onClick={() => {
                                if (!currentChat.vkId) {
                                  toast({
                                    title: 'Звонок недоступен',
                                    description: 'Пользователь зарегистрирован не через VK. Звонки доступны только для пользователей VK',
                                    variant: 'destructive',
                                  });
                                  return;
                                }
                                setCallModal({ isOpen: true, type: 'audio' });
                              }}
                              disabled={!currentChat.vkId}
                            >
                              <Icon name="Phone" size={20} className={currentChat.vkId ? "text-blue-600" : "text-gray-400"} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full hover:bg-blue-50"
                              onClick={() => {
                                if (!currentChat.vkId) {
                                  toast({
                                    title: 'Видеозвонок недоступен',
                                    description: 'Пользователь зарегистрирован не через VK. Видеозвонки доступны только для пользователей VK',
                                    variant: 'destructive',
                                  });
                                  return;
                                }
                                setCallModal({ isOpen: true, type: 'video' });
                              }}
                              disabled={!currentChat.vkId}
                            >
                              <Icon name="Video" size={20} className={currentChat.vkId ? "text-blue-600" : "text-gray-400"} />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Icon name="MoreVertical" size={20} />
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center text-muted-foreground py-12">
                            <Icon name="MessageCircle" size={48} className="mx-auto mb-2 opacity-50" />
                            <p>Нет сообщений. Начните переписку!</p>
                          </div>
                        ) : (
                          messages.map((msg) => (
                            <div 
                              key={msg.id} 
                              className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className="max-w-[70%]">
                                {msg.senderId !== currentUserId && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage src={msg.senderAvatar} alt={msg.senderName} />
                                      <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium">{msg.senderName}</span>
                                  </div>
                                )}
                                <div 
                                  className={`rounded-2xl p-3 ${
                                    msg.senderId === currentUserId 
                                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                      : 'bg-accent rounded-tl-none'
                                  }`}
                                >
                                  <p className="text-sm">{msg.content}</p>
                                </div>
                                <p className={`text-xs text-muted-foreground mt-1 ${
                                  msg.senderId === currentUserId ? 'text-right mr-2' : 'ml-2'
                                }`}>
                                  {(() => {
                                    const date = new Date(msg.createdAt);
                                    const hours = String(date.getHours()).padStart(2, '0');
                                    const minutes = String(date.getMinutes()).padStart(2, '0');
                                    return `${hours}:${minutes}`;
                                  })()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>

                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                          <Icon name="Paperclip" size={20} />
                        </Button>
                        <Input
                          placeholder="Введите сообщение..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="rounded-2xl"
                        />
                        <Button 
                          size="icon" 
                          className="rounded-full flex-shrink-0"
                          onClick={handleSendMessage}
                        >
                          <Icon name="Send" size={20} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="flex flex-col items-center justify-center h-[730px]">
                    <Icon name="MessageCircle" size={64} className="text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Выберите чат</h3>
                    <p className="text-muted-foreground text-center">
                      Выберите чат из списка слева, чтобы начать общение
                    </p>
                  </CardContent>
                )}
              </Card>
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