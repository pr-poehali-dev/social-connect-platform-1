import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface CallRecord {
  id: number;
  caller_id: number;
  recipient_id: number;
  call_type: 'audio' | 'video';
  status: 'initiated' | 'connected' | 'ended' | 'missed' | 'declined' | 'failed';
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  caller_name: string;
  caller_avatar: string;
  recipient_name: string;
  recipient_avatar: string;
}

const CallHistory = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    loadCallHistory();
  }, []);

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

  const loadCallHistory = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        'https://functions.poehali.dev/103317da-ee6e-47c4-b6a3-3e12513ed2db?action=history',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setCalls(data.calls || []);
      } else {
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить историю звонков',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load call history:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} мин назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч назад`;
    } else if (diffDays < 7) {
      return `${diffDays} дн назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ended':
        return { label: 'Завершен', variant: 'default' as const, icon: 'Phone' };
      case 'missed':
        return { label: 'Пропущен', variant: 'destructive' as const, icon: 'PhoneMissed' };
      case 'declined':
        return { label: 'Отклонен', variant: 'secondary' as const, icon: 'PhoneOff' };
      case 'failed':
        return { label: 'Не удался', variant: 'destructive' as const, icon: 'PhoneOff' };
      case 'initiated':
        return { label: 'Начат', variant: 'outline' as const, icon: 'Phone' };
      default:
        return { label: status, variant: 'outline' as const, icon: 'Phone' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-32 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">История звонков</h1>
                <p className="text-muted-foreground">
                  Все ваши VK звонки в одном месте
                </p>
              </div>
              <Button
                variant="outline"
                onClick={loadCallHistory}
                className="rounded-2xl"
              >
                <Icon name="RefreshCw" size={18} className="mr-2" />
                Обновить
              </Button>
            </div>

            <Card className="rounded-3xl border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="PhoneCall" size={24} />
                  Все звонки
                  <Badge variant="secondary" className="ml-auto">
                    {calls.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {loading ? (
                    <div className="text-center py-12">
                      <Icon name="Loader2" size={48} className="mx-auto mb-4 text-muted-foreground animate-spin" />
                      <p className="text-muted-foreground">Загрузка истории...</p>
                    </div>
                  ) : calls.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="Phone" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Нет звонков</h3>
                      <p className="text-muted-foreground mb-4">
                        История звонков пока пуста
                      </p>
                      <Button
                        onClick={() => navigate('/messages')}
                        className="rounded-2xl"
                      >
                        <Icon name="MessageCircle" size={18} className="mr-2" />
                        Перейти к сообщениям
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {calls.map((call) => {
                        const isOutgoing = call.caller_id === currentUserId;
                        const otherUser = isOutgoing
                          ? { name: call.recipient_name, avatar: call.recipient_avatar }
                          : { name: call.caller_name, avatar: call.caller_avatar };
                        const statusInfo = getStatusInfo(call.status);

                        return (
                          <div
                            key={call.id}
                            className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => navigate('/messages')}
                          >
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                                <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold truncate">
                                    {otherUser.name}
                                  </h3>
                                  {call.call_type === 'video' && (
                                    <Icon name="Video" size={16} className="text-blue-600 flex-shrink-0" />
                                  )}
                                  {call.call_type === 'audio' && (
                                    <Icon name="Phone" size={16} className="text-green-600 flex-shrink-0" />
                                  )}
                                  <Icon 
                                    name={isOutgoing ? 'PhoneOutgoing' : 'PhoneIncoming'} 
                                    size={16} 
                                    className={isOutgoing ? 'text-blue-500' : 'text-green-500'}
                                  />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{formatDate(call.started_at)}</span>
                                  {call.duration_seconds > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{formatDuration(call.duration_seconds)}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <Badge variant={statusInfo.variant} className="flex-shrink-0">
                                <Icon name={statusInfo.icon} size={14} className="mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CallHistory;
