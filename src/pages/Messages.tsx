import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

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
}

const Messages = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'group' | 'deal'>('personal');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');

  const chats: Chat[] = [
    {
      id: 1,
      type: 'personal',
      name: 'Анна Петрова',
      avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      lastMessage: 'Привет! Как дела?',
      time: '10:30',
      unread: 2,
      online: true
    },
    {
      id: 2,
      type: 'personal',
      name: 'Дмитрий Иванов',
      avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      lastMessage: 'Спасибо за помощь!',
      time: '09:15',
      unread: 0,
      online: false
    },
    {
      id: 3,
      type: 'personal',
      name: 'Мария Сидорова',
      avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      lastMessage: 'До встречи завтра',
      time: 'Вчера',
      unread: 0,
      online: true
    },
    {
      id: 4,
      type: 'group',
      name: 'IT-специалисты',
      avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      lastMessage: 'Сергей: Кто идёт на встречу?',
      time: '11:20',
      unread: 5,
      participants: 24
    },
    {
      id: 5,
      type: 'group',
      name: 'Йога в парке',
      avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      lastMessage: 'Елена: Сегодня в 8 утра!',
      time: '07:45',
      unread: 1,
      participants: 12
    },
    {
      id: 6,
      type: 'group',
      name: 'Любители искусства',
      avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      lastMessage: 'Ольга: Новая выставка открылась',
      time: 'Вчера',
      unread: 0,
      participants: 8
    },
    {
      id: 7,
      type: 'deal',
      name: 'Продажа iPhone 14',
      avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      lastMessage: 'Алексей: Когда можем встретиться?',
      time: '12:00',
      unread: 3,
      dealStatus: 'В обсуждении'
    },
    {
      id: 8,
      type: 'deal',
      name: 'Аренда квартиры',
      avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      lastMessage: 'Вы: Документы готовы',
      time: '10:00',
      unread: 0,
      dealStatus: 'Завершено'
    },
    {
      id: 9,
      type: 'deal',
      name: 'Услуги дизайнера',
      avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      lastMessage: 'Кристина: Макеты отправлю сегодня',
      time: 'Вчера',
      unread: 0,
      dealStatus: 'В работе'
    }
  ];

  const tabs = [
    { value: 'personal', label: 'Личные сообщения', icon: 'MessageCircle' },
    { value: 'group', label: 'Групповые чаты', icon: 'Users' },
    { value: 'deal', label: 'Обсуждение сделок', icon: 'Briefcase' }
  ];

  const filteredChats = chats.filter(chat => chat.type === activeTab);
  const currentChat = chats.find(chat => chat.id === selectedChat);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">Сообщения</h1>
              <p className="text-muted-foreground">Все ваши чаты в одном месте</p>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={activeTab === tab.value ? 'default' : 'outline'}
                  className="gap-2 rounded-2xl flex-shrink-0"
                  onClick={() => setActiveTab(tab.value as 'personal' | 'group' | 'deal')}
                >
                  <Icon name={tab.icon} size={18} />
                  {tab.label}
                  <Badge variant={activeTab === tab.value ? 'secondary' : 'outline'}>
                    {chats.filter(c => c.type === tab.value).length}
                  </Badge>
                </Button>
              ))}
            </div>

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
                    {filteredChats.map((chat) => (
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

                            {chat.type === 'group' && (
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
                    ))}
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
                            <Button variant="ghost" size="icon" className="rounded-full">
                              <Icon name="Phone" size={20} />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full">
                              <Icon name="Video" size={20} />
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
                        <div className="flex justify-start">
                          <div className="max-w-[70%]">
                            <div className="bg-accent rounded-2xl rounded-tl-none p-3">
                              <p className="text-sm">{currentChat.lastMessage}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-2">
                              {currentChat.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <div className="max-w-[70%]">
                            <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-3">
                              <p className="text-sm">Отлично, спасибо!</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 mr-2 text-right">
                              10:32
                            </p>
                          </div>
                        </div>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
