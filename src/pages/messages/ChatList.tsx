import { Card, CardContent } from '@/components/ui/card';
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
  vkId?: string;
}

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  selectedChat: number | null;
  onSelectChat: (chatId: number) => void;
}

const ChatList = ({ chats, loading, selectedChat, onSelectChat }: ChatListProps) => {
  return (
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
          ) : chats.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Нет чатов</p>
              <p className="text-sm text-muted-foreground">Начните общение с другими пользователями</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
                  selectedChat === chat.id ? 'bg-accent' : ''
                }`}
                onClick={() => onSelectChat(chat.id)}
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
  );
};

export default ChatList;
