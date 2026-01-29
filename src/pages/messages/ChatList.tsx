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
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedChats, setSelectedChats] = useState<Set<number>>(new Set());
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent, chatId: number, chatType: 'personal' | 'group' | 'deal') => {
    if (selectionMode) return;
    if (chatType !== 'personal' || window.innerWidth >= 1024) return;
    setTouchStart(e.touches[0].clientX);
    setSwipedChat(chatId);
    
    const timer = setTimeout(() => {
      setSelectionMode(true);
      setSelectedChats(new Set([chatId]));
      setTouchStart(null);
      setSwipedChat(null);
      setTouchOffset(0);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleTouchMove = (e: React.TouchEvent, chatId: number) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    if (touchStart === null || swipedChat !== chatId || window.innerWidth >= 1024) return;
    
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    
    if (diff > 0 && diff <= 120) {
      setTouchOffset(diff);
    }
  };

  const handleTouchEnd = (chatId: number, chatType: 'personal' | 'group' | 'deal') => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
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

  const handleChatClick = (chatId: number) => {
    if (selectionMode) {
      setSelectedChats(prev => {
        const newSet = new Set(prev);
        if (newSet.has(chatId)) {
          newSet.delete(chatId);
        } else {
          newSet.add(chatId);
        }
        return newSet;
      });
    } else {
      onSelectChat(chatId);
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedChats(new Set());
  };

  const handleDeleteSelected = () => {
    selectedChats.forEach(chatId => {
      onDeleteChat?.(chatId);
    });
    setSelectionMode(false);
    setSelectedChats(new Set());
  };

  const displayChats = window.innerWidth < 1024 
    ? chats.filter(chat => chat.type === activeFilter)
    : chats.filter(chat => chat.type === activeTab);

  return (
    <Card className="rounded-3xl border-2 lg:col-span-1">
      <CardContent className="p-0">
        {selectionMode && (
          <div className="p-3 border-b bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelSelection}
                className="h-8 gap-1"
              >
                <Icon name="X" size={16} />
                Отмена
              </Button>
              <span className="text-sm font-medium">
                Выбрано: {selectedChats.size}
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={selectedChats.size === 0}
              className="h-8 gap-1"
            >
              <Icon name="Trash2" size={16} />
              Удалить
            </Button>
          </div>
        )}
        <div className="p-4 border-b space-y-3">
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
                    selectionMode
                      ? selectedChats.has(chat.id)
                        ? 'bg-primary/10'
                        : ''
                      : selectedChat === chat.id
                      ? 'bg-accent'
                      : ''
                  }`}
                  style={{
                    transform: swipedChat === chat.id && !selectionMode ? `translateX(-${touchOffset}px)` : 'translateX(0)',
                    transition: touchStart === null ? 'transform 0.2s ease-out' : 'none',
                  }}
                  onClick={() => handleChatClick(chat.id)}
                  onTouchStart={(e) => handleTouchStart(e, chat.id, chat.type)}
                  onTouchMove={(e) => handleTouchMove(e, chat.id)}
                  onTouchEnd={() => handleTouchEnd(chat.id, chat.type)}
                >
                  <div className="flex items-start gap-3">
                    {selectionMode && (
                      <div className="flex-shrink-0 pt-1">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedChats.has(chat.id)
                            ? 'bg-primary border-primary'
                            : 'border-gray-300'
                        }`}>
                          {selectedChats.has(chat.id) && (
                            <Icon name="Check" size={14} className="text-white" />
                          )}
                        </div>
                      </div>
                    )}
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