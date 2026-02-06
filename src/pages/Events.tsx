import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const useTypingPlaceholder = (text: string, speed: number = 50) => {
  const [placeholder, setPlaceholder] = useState('');
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setPlaceholder(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return placeholder;
};

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  category: string;
  price: number;
  participants: number;
  maxParticipants: number;
  image: string;
  paymentUrl?: string;
  is_favorite?: boolean;
}

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedEvents, setJoinedEvents] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const placeholder = useTypingPlaceholder('Поиск мероприятий');
  
  // Умное определение города по умолчанию
  const getUserCity = () => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        return profile.city || 'Все города';
      } catch {
        return 'Все города';
      }
    }
    return 'Все города';
  };
  
  const [selectedCity, setSelectedCity] = useState(getUserCity());

  useEffect(() => {
    if (location.state?.selectedCity) {
      setSelectedCity(location.state.selectedCity);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const url = new URL('https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8');
        const response = await fetch(url, { headers });
        const data = await response.json();
        
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        if (user) {
          const joinedResponse = await fetch(`https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8?action=user_joined&user_id=${user.id}`);
          const joinedData = await joinedResponse.json();
          setJoinedEvents(new Set(joinedData.event_ids || []));
        }
        
        const formattedEvents = data.map((evt: any) => ({
          id: evt.id,
          title: evt.title,
          description: evt.description || '',
          date: evt.event_date,
          time: evt.event_time,
          location: evt.location,
          city: evt.city,
          author: {
            id: evt.user_id || 0,
            name: evt.author_name || 'Организатор',
            avatar: evt.author_avatar || 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
          },
          category: evt.category || 'entertainment',
          price: Number(evt.price) || 0,
          participants: evt.participants || 0,
          maxParticipants: evt.max_participants || 10,
          image: evt.image_url || 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
          paymentUrl: evt.payment_url,
          is_favorite: evt.is_favorite || false
        }));
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить мероприятия',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [toast]);

  const categories = [
    { value: 'all', label: 'Все', icon: 'Calendar' },
    { value: 'sports', label: 'Спорт', icon: 'Dumbbell' },
    { value: 'culture', label: 'Культура', icon: 'Music' },
    { value: 'education', label: 'Обучение', icon: 'GraduationCap' },
    { value: 'entertainment', label: 'Развлечения', icon: 'PartyPopper' },
    { value: 'business', label: 'Бизнес', icon: 'Briefcase' },
  ];



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleToggleFavorite = async (eventId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    try {
      const action = 'favorite';
      const method = event.is_favorite ? 'DELETE' : 'POST';
      
      const response = await fetch(
        `https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8?action=${action}`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ event_id: eventId })
        }
      );

      if (response.ok) {
        setEvents(events.map(e => 
          e.id === eventId ? { ...e, is_favorite: !e.is_favorite } : e
        ));
        toast({
          title: event.is_favorite ? 'Удалено из избранного' : 'Добавлено в избранное',
          description: event.is_favorite ? '' : 'Мероприятие сохранено в разделе Избранное'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось обновить избранное',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить избранное',
        variant: 'destructive',
      });
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
          setEvents(prev => prev.map(e => 
            e.id === eventId ? { ...e, participants: Math.max(0, e.participants - 1) } : e
          ));
          toast({
            title: 'Вы отменили участие',
          });
        } else {
          setJoinedEvents(prev => new Set(prev).add(eventId));
          setEvents(prev => prev.map(e => 
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesCity = selectedCity === 'Все города' || event.city === selectedCity;
    const isNotTestEvent = event.title !== 'Test Event';
    return matchesSearch && matchesCategory && matchesCity && isNotTestEvent;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка мероприятий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 lg:overflow-auto overflow-y-auto overflow-x-hidden">
      <Navigation />
      
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 py-6 rounded-2xl text-left overflow-x-auto"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/select-city', { state: { currentCity: selectedCity } })}
                  className="w-full sm:w-[200px] justify-between rounded-2xl py-6"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon name="MapPin" size={16} className="flex-shrink-0" />
                    <span className="truncate">{selectedCity}</span>
                  </div>
                  <Icon name="ChevronRight" size={16} className="ml-2 opacity-50 flex-shrink-0" />
                </Button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    className="gap-2 rounded-full flex-shrink-0"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    <Icon name={category.icon} size={16} />
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
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
                        {categories.find(c => c.value === event.category)?.label}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(event.id);
                        }}
                      >
                        <Icon 
                          name="Star" 
                          size={16} 
                          className={event.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"} 
                        />
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
                        <span>{formatDate(event.date)} в {event.time}</span>
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
                      onClick={() => navigate(`/profile/${event.author.id}`)}
                    >
                      <img
                        src={event.author.avatar}
                        alt={event.author.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{event.author.name}</p>
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
                          <Icon name="ShoppingCart" size={18} />
                          Купить
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <Card className="max-w-md mx-auto text-center p-12 rounded-3xl">
                <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl font-semibold mb-2">Мероприятий не найдено</p>
                <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Events;