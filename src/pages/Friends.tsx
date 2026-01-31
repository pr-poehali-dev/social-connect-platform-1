import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Friends = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      // Загружаем друзей
      const friendsRes = await fetch(
        'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=friends',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        console.log('Friends API response:', friendsData);
        setFriends(friendsData.friends || []);
      }

      // Загружаем входящие заявки
      const incomingRes = await fetch(
        'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=friend-requests&type=incoming',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (incomingRes.ok) {
        const incomingData = await incomingRes.json();
        console.log('Incoming requests API response:', incomingData);
        setIncomingRequests(incomingData.requests || []);
      }

      // Загружаем исходящие заявки
      const outgoingRes = await fetch(
        'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=friend-requests&type=outgoing',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (outgoingRes.ok) {
        const outgoingData = await outgoingRes.json();
        console.log('Outgoing requests API response:', outgoingData);
        setOutgoingRequests(outgoingData.requests || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(
        'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=accept-friend-request',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ request_id: requestId })
        }
      );

      if (response.ok) {
        toast({ title: 'Заявка принята' });
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось принять заявку', variant: 'destructive' });
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(
        'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=reject-friend-request',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ request_id: requestId })
        }
      );

      if (response.ok) {
        toast({ title: 'Заявка отклонена' });
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отклонить заявку', variant: 'destructive' });
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(
        'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=reject-friend-request',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ request_id: requestId })
        }
      );

      if (response.ok) {
        toast({ title: 'Заявка отменена' });
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отменить заявку', variant: 'destructive' });
    }
  };

  const handleRemoveFriend = async (friendUserId: number) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(
        'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=remove-friend',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ friend_user_id: friendUserId })
        }
      );

      if (response.ok) {
        toast({ title: 'Друг удалён' });
        loadData();
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось удалить друга', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить друга', variant: 'destructive' });
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'вчера';
    return `${diffDays} дн назад`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-32 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Мои друзья</h1>
              <p className="text-muted-foreground">
                Управляйте своими друзьями и заявками
              </p>
            </div>

            <Tabs defaultValue="friends" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="friends" className="gap-2">
                  <Icon name="Users" size={18} />
                  Друзья ({friends.length})
                </TabsTrigger>
                <TabsTrigger value="requests" className="gap-2">
                  <Icon name="UserPlus" size={18} />
                  Заявки ({incomingRequests.length + outgoingRequests.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="friends" className="space-y-4">
                {friends.length === 0 ? (
                  <Card className="rounded-3xl border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                        <Icon name="Users" size={40} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Пока нет друзей</h3>
                      <p className="text-muted-foreground text-center mb-6">
                        Найдите интересных людей в разделе Знакомства
                      </p>
                      <Button onClick={() => navigate('/dating')} className="gap-2 rounded-xl">
                        <Icon name="Heart" size={18} />
                        Перейти к знакомствам
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  friends.map((friend) => (
                    <Card key={friend.user_id} className="rounded-3xl border-2 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="w-16 h-16 border-2 border-primary">
                              {friend.avatar_url ? (
                                <AvatarImage src={friend.avatar_url} alt={friend.name} />
                              ) : (
                                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                                  {friend.name.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            {friend.is_online && (
                              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{friend.name}</h3>
                              {friend.is_online && (
                                <Badge variant="secondary" className="rounded-full text-xs">
                                  онлайн
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {friend.age ? `${friend.age} лет` : ''} {friend.city ? `• ${friend.city}` : ''}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl"
                              onClick={() => navigate(`/dating/${friend.user_id}`)}
                            >
                              <Icon name="Eye" size={18} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl"
                              onClick={() => navigate(`/messages`)}
                            >
                              <Icon name="MessageCircle" size={18} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl text-destructive hover:bg-destructive hover:text-white"
                              onClick={() => handleRemoveFriend(friend.user_id)}
                            >
                              <Icon name="UserMinus" size={18} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="requests" className="space-y-6">
                {incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
                  <Card className="rounded-3xl border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                        <Icon name="UserPlus" size={40} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Нет заявок в друзья</h3>
                      <p className="text-muted-foreground text-center">
                        Здесь появятся входящие и исходящие заявки
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {incomingRequests.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Icon name="Inbox" size={20} />
                          Входящие заявки ({incomingRequests.length})
                        </h3>
                        {incomingRequests.map((request) => (
                          <Card key={request.request_id} className="rounded-3xl border-2 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16 border-2 border-primary">
                                  {request.avatar_url ? (
                                    <AvatarImage src={request.avatar_url} alt={request.name} />
                                  ) : (
                                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                                      {request.name.charAt(0)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>

                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-1">{request.name}</h3>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    {request.age ? `${request.age} лет` : ''} {request.city ? `• ${request.city}` : ''}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatTime(request.created_at)}
                                  </p>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-xl"
                                    onClick={() => navigate(`/dating/${request.user_id}`)}
                                  >
                                    <Icon name="Eye" size={18} />
                                  </Button>
                                  <Button
                                    className="gap-2 rounded-xl"
                                    onClick={() => handleAcceptRequest(request.request_id)}
                                  >
                                    <Icon name="Check" size={18} />
                                    Принять
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="gap-2 rounded-xl text-destructive hover:text-destructive"
                                    onClick={() => handleRejectRequest(request.request_id)}
                                  >
                                    <Icon name="X" size={18} />
                                    Отклонить
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {outgoingRequests.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Icon name="Send" size={20} />
                          Исходящие заявки ({outgoingRequests.length})
                        </h3>
                        {outgoingRequests.map((request) => (
                          <Card key={request.request_id} className="rounded-3xl border-2 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16 border-2 border-primary">
                                  {request.avatar_url ? (
                                    <AvatarImage src={request.avatar_url} alt={request.name} />
                                  ) : (
                                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                                      {request.name.charAt(0)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>

                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-1">{request.name}</h3>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    {request.age ? `${request.age} лет` : ''} {request.city ? `• ${request.city}` : ''}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Отправлено {formatTime(request.created_at)}
                                  </p>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-xl"
                                    onClick={() => navigate(`/dating/${request.user_id}`)}
                                  >
                                    <Icon name="Eye" size={18} />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="gap-2 rounded-xl"
                                    onClick={() => handleCancelRequest(request.request_id)}
                                  >
                                    <Icon name="X" size={18} />
                                    Отменить
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Friends;