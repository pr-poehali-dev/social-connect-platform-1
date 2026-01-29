import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface ChatWindowProps {
  currentChat: Chat | undefined;
  messages: Message[];
  currentUserId: number | null;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: () => void;
  onCall: (type: 'audio' | 'video') => void;
  toast: any;
  onClose?: () => void;
}

const IMAGE_STICKERS = [
  'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/64302c20-3531-4a16-80ad-ca6760943f00.jpg',
  'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/36ff3966-eb01-48d0-bddc-9b4603f7364b.jpg',
  'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/107cec0c-a79e-4b36-a5d2-6c438edf4b6b.jpg',
  'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/023bd8ec-beda-4bc1-926f-5b450f58b8aa.jpg',
  'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/f11de093-66a1-4df4-a9f0-d2506c4c7e9a.jpg',
  'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/17988fa2-9d82-4173-acda-b019c0b18d64.jpg'
];

const EMOJI_STICKERS = [
  '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜',
  '🤔', '🤗', '🥳', '😎', '🤩', '😇', '🙃', '😉',
  '👍', '👏', '🙌', '👋', '🤝', '💪', '✌️', '🤞',
  '❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡',
  '🎉', '🎊', '🎈', '🎁', '🌹', '🌺', '🌸', '🌼',
  '⭐', '✨', '💫', '🔥', '💯', '👑', '🏆', '🎯'
];

const ChatWindow = ({
  currentChat,
  messages,
  currentUserId,
  messageText,
  setMessageText,
  onSendMessage,
  onCall,
  toast,
  onClose
}: ChatWindowProps) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [stickerTab, setStickerTab] = useState<'image' | 'emoji'>('image');

  const handleClearChat = () => {
    toast({
      title: 'Чат очищен',
      description: 'Все сообщения удалены',
    });
  };

  const handleDeleteDialog = () => {
    toast({
      title: 'Диалог удалён',
      description: 'Диалог удалён из списка',
    });
  };

  const handleBlockUser = () => {
    toast({
      title: 'Пользователь заблокирован',
      description: 'Вы больше не будете получать сообщения от этого пользователя',
      variant: 'destructive'
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStickerClick = (sticker: string) => {
    setMessageText(messageText + sticker);
    setShowStickers(false);
  };

  const handleImageStickerClick = (url: string) => {
    setMessageText(messageText + `[sticker:${url}]`);
    setShowStickers(false);
  };
  if (!currentChat) {
    return (
      <Card className="rounded-3xl border-2 lg:col-span-2">
        <CardContent className="flex flex-col items-center justify-center h-[730px]">
          <Icon name="MessageCircle" size={64} className="text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Выберите чат</h3>
          <p className="text-muted-foreground text-center">
            Выберите чат из списка слева, чтобы начать общение
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-2 lg:col-span-2 h-full">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-4 pb-8 lg:pb-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full lg:hidden flex-shrink-0"
                onClick={onClose}
              >
                <Icon name="ArrowLeft" size={20} />
              </Button>
            )}
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={currentChat.avatar} alt={currentChat.name} />
              <AvatarFallback>{currentChat.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{currentChat.name}</h3>
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
                    onCall('audio');
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
                    onCall('video');
                  }}
                  disabled={!currentChat.vkId}
                >
                  <Icon name="Video" size={20} className={currentChat.vkId ? "text-blue-600" : "text-gray-400"} />
                </Button>
              </>
            )}
            {currentChat.type === 'personal' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Icon name="MoreVertical" size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleClearChat}>
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Очистить чат
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteDialog}>
                    <Icon name="X" size={16} className="mr-2" />
                    Удалить диалог
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleBlockUser} className="text-red-600">
                    <Icon name="Ban" size={16} className="mr-2" />
                    Заблокировать
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
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
                        <Avatar className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/profile/${msg.senderId}`)}>
                          <AvatarImage src={msg.senderAvatar} alt={msg.senderName} />
                          <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium cursor-pointer hover:underline" onClick={() => navigate(`/profile/${msg.senderId}`)}>{msg.senderName}</span>
                      </div>
                    )}
                    <div 
                      className={`rounded-2xl ${
                        msg.content.startsWith('[sticker:') ? 'p-1' : 'p-3'
                      } ${
                        msg.senderId === currentUserId 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-accent rounded-tl-none'
                      }`}
                    >
                      {msg.content.startsWith('[sticker:') ? (
                        <img 
                          src={msg.content.slice(9, -1)} 
                          alt="sticker" 
                          className="w-32 h-32 object-cover rounded-xl"
                        />
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
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
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
              <Icon name="Paperclip" size={20} />
            </Button>
            <Popover open={showStickers} onOpenChange={setShowStickers}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                  <Icon name="Smile" size={20} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="start">
                <div className="flex gap-2 mb-3 border-b pb-2">
                  <Button
                    variant={stickerTab === 'image' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setStickerTab('image')}
                  >
                    Love Is
                  </Button>
                  <Button
                    variant={stickerTab === 'emoji' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setStickerTab('emoji')}
                  >
                    Эмодзи
                  </Button>
                </div>
                {stickerTab === 'image' ? (
                  <div className="grid grid-cols-3 gap-2">
                    {IMAGE_STICKERS.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageStickerClick(url)}
                        className="hover:bg-accent rounded-lg p-1 transition-colors aspect-square"
                      >
                        <img src={url} alt="sticker" className="w-full h-full object-cover rounded" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-8 gap-2">
                    {EMOJI_STICKERS.map((sticker, index) => (
                      <button
                        key={index}
                        onClick={() => handleStickerClick(sticker)}
                        className="text-2xl hover:bg-accent rounded-lg p-2 transition-colors"
                      >
                        {sticker}
                      </button>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
            <Input
              placeholder="Введите сообщение..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
              className="rounded-2xl"
            />
            <Button 
              size="icon" 
              className="rounded-full flex-shrink-0"
              onClick={onSendMessage}
            >
              <Icon name="Send" size={20} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;