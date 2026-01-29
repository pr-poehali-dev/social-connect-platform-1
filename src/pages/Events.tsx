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
    name: string;
    avatar: string;
  };
  category: string;
  price: number;
  participants: number;
  maxParticipants: number;
  image: string;
  paymentUrl?: string;
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
        const url = new URL('https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8');
        const response = await fetch(url);
        const data = await response.json();
        
        const formattedEvents = data.map((evt: any) => ({
          id: evt.id,
          title: evt.title,
          description: evt.description || '',
          date: evt.event_date,
          time: evt.event_time,
          location: evt.location,
          city: evt.city,
          author: {
            name: evt.author_name || 'Организатор',
            avatar: evt.author_avatar || 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
          },
          category: evt.category || 'entertainment',
          price: Number(evt.price) || 0,
          participants: evt.participants || 0,
          maxParticipants: evt.max_participants || 10,
          image: evt.image_url || 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
          paymentUrl: evt.payment_url
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

    try {
      const response = await fetch('https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join',
          event_id: eventId,
          user_id: user.id
        })
      });

      if (response.ok) {
        setJoinedEvents(prev => new Set(prev).add(eventId));
        setEvents(prev => prev.map(e => 
          e.id === eventId ? { ...e, participants: e.participants + 1 } : e
        ));
        toast({
          title: 'Вы записались на мероприятие',
        });
      }
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось записаться на мероприятие',
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
    return matchesSearch && matchesCategory && matchesCity;
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
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
                    {event.price === 0 && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500 rounded-full">Бесплатно</Badge>
                      </div>
                    )}
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

                    <div className="flex items-center gap-3 pb-4 border-b mb-4">
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