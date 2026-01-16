import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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
}

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'Все', icon: 'Calendar' },
    { value: 'sports', label: 'Спорт', icon: 'Dumbbell' },
    { value: 'culture', label: 'Культура', icon: 'Music' },
    { value: 'education', label: 'Обучение', icon: 'GraduationCap' },
    { value: 'entertainment', label: 'Развлечения', icon: 'PartyPopper' },
    { value: 'business', label: 'Бизнес', icon: 'Briefcase' },
  ];

  const events: Event[] = [
    {
      id: 1,
      title: 'Йога в парке',
      description: 'Утренняя йога для начинающих на свежем воздухе. Принесите коврик и хорошее настроение!',
      date: '2026-01-20',
      time: '08:00',
      location: 'Парк Горького',
      city: 'Москва',
      author: {
        name: 'Анна Петрова',
        avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
      },
      category: 'sports',
      price: 0,
      participants: 12,
      maxParticipants: 20,
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 2,
      title: 'Мастер-класс по живописи',
      description: 'Научитесь рисовать акварелью под руководством профессионального художника.',
      date: '2026-01-22',
      time: '18:00',
      location: 'Арт-студия "Краски"',
      city: 'Москва',
      author: {
        name: 'Дмитрий Иванов',
        avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
      },
      category: 'culture',
      price: 1500,
      participants: 8,
      maxParticipants: 15,
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 3,
      title: 'Встреча программистов',
      description: 'Networking для IT-специалистов. Обсудим новые технологии и поделимся опытом.',
      date: '2026-01-25',
      time: '19:00',
      location: 'Коворкинг "Старт"',
      city: 'Санкт-Петербург',
      author: {
        name: 'Сергей Смирнов',
        avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
      },
      category: 'business',
      price: 0,
      participants: 25,
      maxParticipants: 50,
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 4,
      title: 'Концерт рок-группы',
      description: 'Выступление местной рок-группы "Звезды" в баре. Отличная атмосфера гарантирована!',
      date: '2026-01-27',
      time: '21:00',
      location: 'Бар "Звезда"',
      city: 'Казань',
      author: {
        name: 'Мария Сидорова',
        avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
      },
      category: 'entertainment',
      price: 500,
      participants: 45,
      maxParticipants: 100,
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 5,
      title: 'Курс английского языка',
      description: 'Интенсивный курс разговорного английского для начинающих. 8 занятий.',
      date: '2026-02-01',
      time: '10:00',
      location: 'Школа языков "Speak"',
      city: 'Москва',
      author: {
        name: 'Елена Кузнецова',
        avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
      },
      category: 'education',
      price: 8000,
      participants: 6,
      maxParticipants: 10,
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 6,
      title: 'Футбольный матч',
      description: 'Любительский футбольный матч. Ищем игроков в команду!',
      date: '2026-01-23',
      time: '15:00',
      location: 'Стадион "Динамо"',
      city: 'Москва',
      author: {
        name: 'Алексей Волков',
        avatar: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
      },
      category: 'sports',
      price: 0,
      participants: 18,
      maxParticipants: 22,
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleJoinEvent = (eventId: number) => {
    toast({
      title: 'Вы записались на мероприятие',
      description: 'Подробности отправлены на email',
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Мероприятия</h1>
              <p className="text-muted-foreground">Присоединяйтесь к интересным событиям в вашем городе</p>
            </div>

            <div className="mb-8">
              <div className="relative mb-6">
                <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск мероприятий..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 rounded-2xl"
                />
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

                    <div className="flex items-center gap-3 mb-4 pb-4 border-b">
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

                    <Button 
                      className="w-full rounded-xl gap-2"
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={event.participants >= event.maxParticipants}
                    >
                      <Icon name="UserPlus" size={18} />
                      {event.participants >= event.maxParticipants ? 'Мест нет' : 'Записаться'}
                    </Button>
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

            <div className="mt-12 text-center">
              <Button size="lg" className="gap-2 rounded-2xl">
                <Icon name="Plus" size={20} />
                Создать мероприятие
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Events;
