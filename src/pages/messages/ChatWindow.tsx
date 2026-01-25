import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
}

const ChatWindow = ({
  currentChat,
  messages,
  currentUserId,
  messageText,
  setMessageText,
  onSendMessage,
  onCall,
  toast
}: ChatWindowProps) => {
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
    <Card className="rounded-3xl border-2 lg:col-span-2">
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
