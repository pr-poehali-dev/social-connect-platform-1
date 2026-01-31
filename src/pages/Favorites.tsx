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

const Favorites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [favoriteProfiles, setFavoriteProfiles] = useState<any[]>([]);
  const [favoriteAds, setFavoriteAds] = useState<any[]>([]);
  const [favoriteServices, setFavoriteServices] = useState<any[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<any[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadAllFavorites();
  }, []);

  const loadAllFavorites = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    
    try {
      const profilesRes = await fetch('https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Profiles response status:', profilesRes.status);
      if (profilesRes.ok) {
        const data = await profilesRes.json();
        setFavoriteProfiles(data.profiles || []);
      } else {
        console.error('Profiles error:', profilesRes.status, await profilesRes.text());
      }
    } catch (error) {
      console.error('Profiles fetch error:', error);
    }

    try {
      const adsRes = await fetch('https://functions.poehali.dev/975a1308-86d5-457a-8069-dd843f483056?action=favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Ads response status:', adsRes.status);
      if (adsRes.ok) {
        const data = await adsRes.json();
        setFavoriteAds(data.ads || []);
      } else {
        console.error('Ads error:', adsRes.status, await adsRes.text());
      }
    } catch (error) {
      console.error('Ads fetch error:', error);
    }

    try {
      const servicesRes = await fetch('https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?action=favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Services response status:', servicesRes.status);
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setFavoriteServices(data.services || []);
      } else {
        console.error('Services error:', servicesRes.status, await servicesRes.text());
      }
    } catch (error) {
      console.error('Services fetch error:', error);
    }

    try {
      const eventsRes = await fetch('https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8?action=favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Events response status:', eventsRes.status);
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setFavoriteEvents(data.events || []);
      } else {
        console.error('Events error:', eventsRes.status, await eventsRes.text());
      }
    } catch (error) {
      console.error('Events fetch error:', error);
    }

    setLoading(false);
  };

  const handleRemoveFromFavorites = async (type: string, id: number) => {
    const token = localStorage.getItem('access_token');

    try {
      if (type === 'profile') {
        const response = await fetch('https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=unfavorite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profile_id: id })
        });

        if (response.ok) {
          toast({ title: 'Удалено из избранного' });
          loadAllFavorites();
        }
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить из избранного', variant: 'destructive' });
    }
  };

  const handleJoinEvent = async (eventId: number) => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
      toast({
        title: 'Войдите в аккаунт',
        description: 'Для записи на мероприятие необходимо авторизоваться',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    const isJoined = joinedEvents.has(eventId);

    try {
      const response = await fetch('https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isJoined ? 'leave' : 'join',
          event_id: eventId,
          user_id: user.id
        })
      });

      if (response.ok) {
        if (isJoined) {
          setJoinedEvents(prev => {
            const newSet = new Set(prev);
            newSet.delete(eventId);
            return newSet;
          });
          setFavoriteEvents(prev => prev.map(e => 
            e.id === eventId ? { ...e, participants: Math.max(0, e.participants - 1) } : e
          ));
          toast({
            title: 'Вы отменили участие',
          });
        } else {
          setJoinedEvents(prev => new Set(prev).add(eventId));
          setFavoriteEvents(prev => prev.map(e => 
            e.id === eventId ? { ...e, participants: e.participants + 1 } : e
          ));
          toast({
            title: 'Вы записались на мероприятие',
          });
        }
      }
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить участие',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-32 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Избранное</h1>
              <p className="text-muted-foreground">
                Сохранённые анкеты, объявления, услуги и мероприятия
              </p>
            </div>

            <Tabs defaultValue="profiles" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profiles" className="gap-2">
                  <Icon name="Heart" size={18} />
                  Анкеты ({favoriteProfiles.length})
                </TabsTrigger>
                <TabsTrigger value="ads" className="gap-2">
                  <Icon name="Radio" size={18} />
                  LIVE ({favoriteAds.length})
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2">
                  <Icon name="Briefcase" size={18} />
                  Услуги ({favoriteServices.length})
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2">
                  <Icon name="Calendar" size={18} />
                  Мероприятия ({favoriteEvents.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profiles" className="space-y-4">
                {favoriteProfiles.length === 0 ? (
                  <Card className="rounded-3xl border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                        <Icon name="Heart" size={40} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Нет избранных анкет</h3>
                      <p className="text-muted-foreground text-center mb-6">
                        Добавляйте понравившиеся анкеты в избранное
                      </p>
                      <Button onClick={() => navigate('/dating')} className="gap-2 rounded-xl">
                        <Icon name="Heart" size={18} />
                        Перейти к знакомствам
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteProfiles.map((profile) => (
                      <Card key={profile.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl overflow-hidden border-2">
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={profile.image}
                            alt={profile.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-4 right-4 rounded-full"
                            onClick={() => handleRemoveFromFavorites('profile', profile.id)}
                          >
                            <Icon name="Star" size={20} className="fill-yellow-400 text-yellow-400" />
                          </Button>
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold">{profile.name}, {profile.age}</h3>
                              {profile.is_verified && (
                                <Icon name="BadgeCheck" size={18} className="text-blue-500" />
                              )}
                            </div>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Icon name="MapPin" size={14} />
                              {profile.city}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-6">
                            {(profile.interests || []).map((interest, index) => (
                              <Badge key={index} variant="secondary" className="rounded-full">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1 rounded-xl gap-2"
                              onClick={() => navigate(`/${profile.nickname}`)}
                            >
                              <Icon name="Eye" size={18} />
                              Профиль
                            </Button>
                            <Button 
                              className="flex-1 rounded-xl gap-2 bg-gradient-to-r from-pink-500 to-rose-500"
                              onClick={() => navigate(`/chat/${profile.nickname}`)}
                            >
                              <Icon name="MessageCircle" size={18} />
                              Написать
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ads" className="space-y-4">
                {favoriteAds.length === 0 ? (
                  <Card className="rounded-3xl border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                        <Icon name="MessageSquare" size={40} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Нет избранных объявлений</h3>
                      <p className="text-muted-foreground text-center mb-6">
                        Сохраняйте интересные объявления
                      </p>
                      <Button onClick={() => navigate('/ads')} className="gap-2 rounded-xl">
                        <Icon name="MessageSquare" size={18} />
                        Посмотреть объявления
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteAds.map((ad) => (
                      <Card key={ad.id} className="rounded-3xl border-2 hover:shadow-lg transition-shadow overflow-hidden">
                        <div className="relative h-48">
                          <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-4 right-4 rounded-full"
                            onClick={() => handleRemoveFromFavorites('ad', ad.id)}
                          >
                            <Icon name="Star" size={20} className="fill-yellow-400 text-yellow-400" />
                          </Button>
                        </div>
                        <CardContent className="p-6">
                          <Badge variant="secondary" className="mb-2 rounded-full">{ad.category}</Badge>
                          <h3 className="font-semibold text-lg mb-2">{ad.title}</h3>
                          <p className="text-2xl font-bold text-primary mb-2">{ad.price}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="MapPin" size={14} />
                              {ad.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Clock" size={14} />
                              {ad.date}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                {favoriteServices.length === 0 ? (
                  <Card className="rounded-3xl border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                        <Icon name="Briefcase" size={40} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Нет избранных услуг</h3>
                      <p className="text-muted-foreground text-center mb-6">
                        Сохраняйте интересные услуги
                      </p>
                      <Button onClick={() => navigate('/services')} className="gap-2 rounded-xl">
                        <Icon name="Briefcase" size={18} />
                        Посмотреть услуги
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {favoriteServices.map((service) => (
                      <Card key={service.id} className="rounded-3xl border-2 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="relative">
                              <Avatar className="w-16 h-16 border-2 border-primary">
                                {service.avatar ? (
                                  <AvatarImage src={service.avatar} alt={service.name} />
                                ) : (
                                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                                    {service.name.charAt(0)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{service.name}</h3>
                              <p className="text-sm text-muted-foreground">@{service.nickname} • {service.age} лет</p>
                              <p className="text-sm text-muted-foreground">{service.city}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFromFavorites('service', service.id)}
                            >
                              <Icon name="Star" size={20} className="fill-yellow-400 text-yellow-400" />
                            </Button>
                          </div>
                          <div className="space-y-2 mb-4">
                            <p className="font-medium">{service.service}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Icon name="Star" size={16} className="text-yellow-400 fill-yellow-400" />
                                <span className="font-semibold">{service.rating}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">({service.reviews} отзывов)</span>
                            </div>
                            <p className="text-xl font-bold text-primary">{service.price}</p>
                          </div>
                          <Button 
                            className="w-full rounded-xl"
                            onClick={() => navigate(`/services/${service.nickname}`)}
                          >
                            Подробнее
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                {favoriteEvents.length === 0 ? (
                  <Card className="rounded-3xl border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                        <Icon name="Calendar" size={40} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Нет избранных мероприятий</h3>
                      <p className="text-muted-foreground text-center mb-6">
                        Сохраняйте интересные мероприятия
                      </p>
                      <Button onClick={() => navigate('/events')} className="gap-2 rounded-xl">
                        <Icon name="Calendar" size={18} />
                        Посмотреть мероприятия
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteEvents.map((event) => (
                      <Card key={event.id} className="rounded-3xl border-2 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white/90 text-primary rounded-full">
                              {event.category}
                            </Badge>
                          </div>
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="rounded-full h-8 w-8"
                              onClick={() => handleRemoveFromFavorites('event', event.id)}
                            >
                              <Icon name="Star" size={16} className="fill-yellow-400 text-yellow-400" />
                            </Button>
                            {event.price === 0 && (
                              <Badge className="bg-green-500 rounded-full">Бесплатно</Badge>
                            )}
                          </div>
                        </div>

                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold mb-2 line-clamp-1">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="Calendar" size={16} className="text-primary" />
                              <span>{event.date} в {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="MapPin" size={16} className="text-primary" />
                              <span className="line-clamp-1">{event.location}, {event.city}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="Users" size={16} className="text-primary" />
                              <span>{event.participants} / {event.maxParticipants} участников</span>
                            </div>
                            {event.price > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <Icon name="Wallet" size={16} className="text-primary" />
                                <span className="font-semibold">{event.price} ₽</span>
                              </div>
                            )}
                          </div>

                          <div 
                            className="flex items-center gap-3 pb-4 border-b mb-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                            onClick={() => navigate(`/profile/${event.author?.id}`)}
                          >
                            <img
                              src={event.author?.avatar}
                              alt={event.author?.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium">{event.author?.name}</p>
                              <p className="text-xs text-muted-foreground">Организатор</p>
                            </div>
                          </div>

                          {event.price === 0 ? (
                            <Button 
                              className={`w-full rounded-xl gap-2 ${joinedEvents.has(event.id) ? 'bg-green-500 hover:bg-green-600' : ''}`}
                              onClick={() => handleJoinEvent(event.id)}
                              disabled={event.participants >= event.maxParticipants}
                            >
                              <Icon name="Check" size={18} />
                              {joinedEvents.has(event.id) ? 'Вы идёте' : event.participants >= event.maxParticipants ? 'Мест нет' : 'Пойду'}
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button 
                                variant={joinedEvents.has(event.id) ? "default" : "outline"}
                                className={`flex-1 rounded-xl gap-2 ${joinedEvents.has(event.id) ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                onClick={() => handleJoinEvent(event.id)}
                                disabled={event.participants >= event.maxParticipants}
                              >
                                <Icon name="Check" size={18} />
                                {joinedEvents.has(event.id) ? 'Вы идёте' : 'Пойду'}
                              </Button>
                              <Button 
                                className="flex-1 rounded-xl gap-2"
                                onClick={() => {
                                  if (event.paymentUrl) {
                                    window.open(event.paymentUrl, '_blank');
                                  } else {
                                    toast({
                                      title: "Ссылка недоступна",
                                      description: "Организатор не добавил ссылку на оплату"
                                    });
                                  }
                                }}
                              >
                                <Icon name="CreditCard" size={18} />
                                Купить
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Favorites;