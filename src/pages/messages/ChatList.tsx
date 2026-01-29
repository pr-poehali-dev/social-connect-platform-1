import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
  vkId?: string;
}

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  selectedChat: number | null;
  onSelectChat: (chatId: number) => void;
  onDeleteChat?: (chatId: number) => void;
  activeTab: 'personal' | 'group' | 'deal';
  onTabChange: (tab: 'personal' | 'group' | 'deal') => void;
}

const ChatList = ({ chats, loading, selectedChat, onSelectChat, onDeleteChat, activeTab, onTabChange }: ChatListProps) => {
  const [swipedChat, setSwipedChat] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchOffset, setTouchOffset] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'personal' | 'group' | 'deal'>('personal');

  const handleTouchStart = (e: React.TouchEvent, chatId: number, chatType: 'personal' | 'group' | 'deal') => {
    if (chatType !== 'personal' || window.innerWidth >= 1024) return;
    setTouchStart(e.touches[0].clientX);
    setSwipedChat(chatId);
  };

  const handleTouchMove = (e: React.TouchEvent, chatId: number) => {
    if (touchStart === null || swipedChat !== chatId || window.innerWidth >= 1024) return;
    
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    
    if (diff > 0 && diff <= 120) {
      setTouchOffset(diff);
    }
  };

  const handleTouchEnd = (chatId: number, chatType: 'personal' | 'group' | 'deal') => {
    if (chatType !== 'personal' || window.innerWidth >= 1024) return;
    
    if (touchOffset > 100) {
      handleDelete(chatId);
    } else if (touchOffset > 40) {
      setTouchOffset(80);
    } else {
      setTouchOffset(0);
      setSwipedChat(null);
    }
    setTouchStart(null);
  };

  const handleDelete = (chatId: number) => {
    onDeleteChat?.(chatId);
    setTouchOffset(0);
    setSwipedChat(null);
  };

  const displayChats = window.innerWidth < 1024 
    ? chats.filter(chat => chat.type === activeFilter)
    : chats.filter(chat => chat.type === activeTab);

  return (
    <Card className="rounded-3xl border-2 lg:col-span-1">
      <CardContent className="p-0">
        <div className="p-4 border-b space-y-3">
          <div className="hidden lg:flex gap-1 mb-3">
            <Button
              variant={activeTab === 'personal' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 rounded-xl gap-1 text-xs px-2 h-8"
              onClick={() => onTabChange('personal')}
            >
              <Icon name="MessageCircle" size={14} />
              Личные
              {chats.filter(c => c.type === 'personal').reduce((sum, c) => sum + (c.unread || 0), 0) > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                  {chats.filter(c => c.type === 'personal').reduce((sum, c) => sum + (c.unread || 0), 0)}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'group' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 rounded-xl gap-1 text-xs px-2 h-8"
              onClick={() => onTabChange('group')}
            >
              <Icon name="Radio" size={14} />
              Встречи
              {chats.filter(c => c.type === 'group').reduce((sum, c) => sum + (c.unread || 0), 0) > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                  {chats.filter(c => c.type === 'group').reduce((sum, c) => sum + (c.unread || 0), 0)}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'deal' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 rounded-xl gap-1 text-xs px-2 h-8"
              onClick={() => onTabChange('deal')}
            >
              <Icon name="Briefcase" size={14} />
              Сделки
              {chats.filter(c => c.type === 'deal').reduce((sum, c) => sum + (c.unread || 0), 0) > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                  {chats.filter(c => c.type === 'deal').reduce((sum, c) => sum + (c.unread || 0), 0)}
                </Badge>
              )}
            </Button>
          </div>
          
          <div className="flex gap-2 lg:hidden">
            <Button
              variant={activeFilter === 'personal' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 rounded-xl text-xs"
              onClick={() => setActiveFilter('personal')}
            >
              Личные
            </Button>
            <Button
              variant={activeFilter === 'group' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 rounded-xl text-xs"
              onClick={() => setActiveFilter('group')}
            >
              Встречи
            </Button>
            <Button
              variant={activeFilter === 'deal' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 rounded-xl text-xs"
              onClick={() => setActiveFilter('deal')}
            >
              Сделки
            </Button>
          </div>
          
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
          ) : displayChats.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Нет чатов</p>
              <p className="text-sm text-muted-foreground">Начните общение с другими пользователями</p>
            </div>
          ) : (
            displayChats.map((chat) => (
              <div
                key={chat.id}
                className="relative overflow-hidden border-b"
              >
                <div
                  className={`absolute inset-y-0 right-0 w-20 bg-destructive flex items-center justify-center transition-opacity ${
                    swipedChat === chat.id && touchOffset > 40 ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-destructive/90"
                    onClick={() => handleDelete(chat.id)}
                  >
                    <Icon name="Trash2" size={20} />
                  </Button>
                </div>

                <div
                  className={`p-4 cursor-pointer hover:bg-accent/50 transition-all ${
                    selectedChat === chat.id ? 'bg-accent' : ''
                  }`}
                  style={{
                    transform: swipedChat === chat.id ? `translateX(-${touchOffset}px)` : 'translateX(0)',
                    transition: touchStart === null ? 'transform 0.2s ease-out' : 'none',
                  }}
                  onClick={() => onSelectChat(chat.id)}
                  onTouchStart={(e) => handleTouchStart(e, chat.id, chat.type)}
                  onTouchMove={(e) => handleTouchMove(e, chat.id)}
                  onTouchEnd={() => handleTouchEnd(chat.id, chat.type)}
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
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatList;