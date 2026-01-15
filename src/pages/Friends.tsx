import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const Friends = () => {
  const navigate = useNavigate();

  const [friends] = useState([
    {
      id: 1,
      nickname: 'anna_moscow',
      name: 'Анна',
      age: 28,
      city: 'Москва',
      avatar: null,
      online: true,
      mutual_friends: 5
    },
    {
      id: 2,
      nickname: 'dmitry_spb',
      name: 'Дмитрий',
      age: 32,
      city: 'Санкт-Петербург',
      avatar: null,
      online: false,
      mutual_friends: 3
    }
  ]);

  const [requests] = useState([
    {
      id: 3,
      nickname: 'elena_kazan',
      name: 'Елена',
      age: 26,
      city: 'Казань',
      avatar: null,
      mutual_friends: 2,
      sent_at: '2 часа назад'
    },
    {
      id: 4,
      nickname: 'alex_nsk',
      name: 'Александр',
      age: 30,
      city: 'Новосибирск',
      avatar: null,
      mutual_friends: 0,
      sent_at: '5 часов назад'
    }
  ]);

  const handleAcceptRequest = (id: number) => {
    console.log('Accept request:', id);
  };

  const handleRejectRequest = (id: number) => {
    console.log('Reject request:', id);
  };

  const handleRemoveFriend = (id: number) => {
    console.log('Remove friend:', id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
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
                  Заявки ({requests.length})
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
                    <Card key={friend.id} className="rounded-3xl border-2 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="w-16 h-16 border-2 border-primary">
                              {friend.avatar ? (
                                <AvatarImage src={friend.avatar} alt={friend.name} />
                              ) : (
                                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                                  {friend.name.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            {friend.online && (
                              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{friend.name}</h3>
                              {friend.online && (
                                <Badge variant="secondary" className="rounded-full text-xs">
                                  онлайн
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              @{friend.nickname} • {friend.age} лет • {friend.city}
                            </p>
                            {friend.mutual_friends > 0 && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Icon name="Users" size={12} />
                                {friend.mutual_friends} общих друзей
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl"
                              onClick={() => navigate(`/${friend.nickname}`)}
                            >
                              <Icon name="Eye" size={18} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl"
                              onClick={() => navigate(`/chat/${friend.nickname}`)}
                            >
                              <Icon name="MessageCircle" size={18} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl text-destructive hover:text-destructive"
                              onClick={() => handleRemoveFriend(friend.id)}
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

              <TabsContent value="requests" className="space-y-4">
                {requests.length === 0 ? (
                  <Card className="rounded-3xl border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                        <Icon name="UserPlus" size={40} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Нет заявок в друзья</h3>
                      <p className="text-muted-foreground text-center">
                        Здесь появятся входящие заявки в друзья
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  requests.map((request) => (
                    <Card key={request.id} className="rounded-3xl border-2 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16 border-2 border-primary">
                            {request.avatar ? (
                              <AvatarImage src={request.avatar} alt={request.name} />
                            ) : (
                              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                                {request.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>

                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{request.name}</h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              @{request.nickname} • {request.age} лет • {request.city}
                            </p>
                            {request.mutual_friends > 0 && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                <Icon name="Users" size={12} />
                                {request.mutual_friends} общих друзей
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {request.sent_at}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl"
                              onClick={() => navigate(`/${request.nickname}`)}
                            >
                              <Icon name="Eye" size={18} />
                            </Button>
                            <Button
                              className="gap-2 rounded-xl"
                              onClick={() => handleAcceptRequest(request.id)}
                            >
                              <Icon name="Check" size={18} />
                              Принять
                            </Button>
                            <Button
                              variant="outline"
                              className="gap-2 rounded-xl text-destructive hover:text-destructive"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              <Icon name="X" size={18} />
                              Отклонить
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
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
