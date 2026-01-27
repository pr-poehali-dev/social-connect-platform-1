import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  category: string;
  price: number;
  participants: number;
  maxParticipants: number;
  image: string;
  status: 'active' | 'completed' | 'cancelled';
}

const MyEvents = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'my' | 'participating' | 'completed'>('my');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    city: '',
    category: 'entertainment',
    price: 0,
    maxParticipants: 10
  });

  const myEvents: Event[] = [
    {
      id: 1,
      title: 'Йога в парке',
      description: 'Утренняя йога для начинающих на свежем воздухе',
      date: '2026-01-20',
      time: '08:00',
      location: 'Парк Горького',
      city: 'Москва',
      category: 'sports',
      price: 0,
      participants: 12,
      maxParticipants: 20,
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      status: 'active'
    },
    {
      id: 2,
      title: 'Мастер-класс по живописи',
      description: 'Научитесь рисовать акварелью под руководством профессионального художника',
      date: '2026-01-22',
      time: '18:00',
      location: 'Арт-студия "Краски"',
      city: 'Москва',
      category: 'culture',
      price: 1500,
      participants: 8,
      maxParticipants: 15,
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      status: 'active'
    }
  ];

  const participatingEvents: Event[] = [
    {
      id: 3,
      title: 'Встреча программистов',
      description: 'Networking для IT-специалистов',
      date: '2026-01-25',
      time: '19:00',
      location: 'Коворкинг "Старт"',
      city: 'Санкт-Петербург',
      category: 'business',
      price: 0,
      participants: 25,
      maxParticipants: 50,
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      status: 'active'
    }
  ];

  const myCompletedEvents: Event[] = [
    {
      id: 4,
      title: 'Вечер настольных игр',
      description: 'Играли в Каркассон и Монополию',
      date: '2026-01-15',
      time: '19:00',
      location: 'Антикафе "Игровая"',
      city: 'Москва',
      category: 'entertainment',
      price: 500,
      participants: 12,
      maxParticipants: 15,
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      status: 'completed'
    },
    {
      id: 5,
      title: 'Лекция по психологии',
      description: 'Тема: "Эмоциональный интеллект в современном мире"',
      date: '2026-01-10',
      time: '18:30',
      location: 'Библиотека имени Ленина',
      city: 'Москва',
      category: 'education',
      price: 0,
      participants: 50,
      maxParticipants: 50,
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      status: 'completed'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleEditEvent = (eventId: number) => {
    toast({
      title: 'Редактирование',
      description: 'Функция в разработке',
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    toast({
      title: 'Мероприятие удалено',
      description: 'Ваше мероприятие было удалено',
    });
  };

  const handleCancelParticipation = (eventId: number) => {
    toast({
      title: 'Вы отменили участие',
      description: 'Вы больше не участвуете в этом мероприятии',
    });
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.city) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Мероприятие создано!',
      description: `"${newEvent.title}" успешно добавлено`,
    });

    setIsCreateModalOpen(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      city: '',
      category: 'entertainment',
      price: 0,
      maxParticipants: 10
    });
  };

  const currentEvents = activeTab === 'my' ? myEvents : activeTab === 'participating' ? participatingEvents : myCompletedEvents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Мои мероприятия</h1>
              <p className="text-muted-foreground">Управляйте своими мероприятиями и участием</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button
                variant={activeTab === 'my' ? 'default' : 'outline'}
                className="gap-2 rounded-2xl"
                onClick={() => setActiveTab('my')}
              >
                <Icon name="Calendar" size={18} />
                Мои мероприятия ({myEvents.length})
              </Button>
              <Button
                variant={activeTab === 'participating' ? 'default' : 'outline'}
                className="gap-2 rounded-2xl"
                onClick={() => setActiveTab('participating')}
              >
                <Icon name="UserPlus" size={18} />
                Участвую ({participatingEvents.length})
              </Button>
              <Button
                variant={activeTab === 'completed' ? 'default' : 'outline'}
                className="gap-2 rounded-2xl"
                onClick={() => setActiveTab('completed')}
              >
                <Icon name="CheckCircle2" size={18} />
                Завершенные ({myCompletedEvents.length})
              </Button>
              <Button
                className="gap-2 rounded-2xl ml-auto"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Icon name="Plus" size={18} />
                Создать новое мероприятие
              </Button>
            </div>

            {currentEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEvents.map((event) => (
                  <Card key={event.id} className="rounded-3xl border-2 overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      {event.status === 'active' && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-green-500 rounded-full">Активно</Badge>
                        </div>
                      )}
                      {event.status === 'completed' && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gray-500 rounded-full">Завершено</Badge>
                        </div>
                      )}
                      {event.price === 0 && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 text-primary rounded-full">Бесплатно</Badge>
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

                      {activeTab === 'my' ? (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            className="flex-1 rounded-xl gap-2"
                            onClick={() => handleEditEvent(event.id)}
                          >
                            <Icon name="Edit" size={16} />
                            Изменить
                          </Button>
                          <Button 
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      ) : activeTab === 'participating' ? (
                        <Button 
                          variant="outline"
                          className="w-full rounded-xl gap-2"
                          onClick={() => handleCancelParticipation(event.id)}
                        >
                          <Icon name="X" size={16} />
                          Отменить участие
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            className="flex-1 rounded-xl gap-2"
                            onClick={() => window.location.href = `/events/${event.id}`}
                          >
                            <Icon name="Eye" size={16} />
                            Смотреть
                          </Button>
                          <Button 
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="max-w-md mx-auto text-center p-12 rounded-3xl">
                <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl font-semibold mb-2">
                  {activeTab === 'my' ? 'У вас пока нет мероприятий' : 'Вы ни в чём не участвуете'}
                </p>
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'my' 
                    ? 'Создайте своё первое мероприятие' 
                    : 'Найдите интересные события и присоединяйтесь'}
                </p>
                {activeTab === 'my' && (
                  <Button className="gap-2 rounded-2xl" onClick={() => setIsCreateModalOpen(true)}>
                    <Icon name="Plus" size={18} />
                    Создать мероприятие
                  </Button>
                )}
              </Card>
            )}

            {activeTab === 'my' && currentEvents.length > 0 && (
              <div className="mt-8 text-center">
                <Button size="lg" className="gap-2 rounded-2xl" onClick={() => setIsCreateModalOpen(true)}>
                  <Icon name="Plus" size={20} />
                  Создать новое мероприятие
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Создать новое мероприятие</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название мероприятия *</Label>
              <Input
                id="title"
                placeholder="Например: Йога в парке"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Расскажите о мероприятии..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="rounded-xl min-h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Дата *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Время *</Label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Место проведения *</Label>
              <Input
                id="location"
                placeholder="Например: Парк Горького"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Город *</Label>
              <Input
                id="city"
                placeholder="Например: Москва"
                value={newEvent.city}
                onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select value={newEvent.category} onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sports">Спорт</SelectItem>
                  <SelectItem value="culture">Культура</SelectItem>
                  <SelectItem value="entertainment">Развлечения</SelectItem>
                  <SelectItem value="business">Бизнес</SelectItem>
                  <SelectItem value="education">Образование</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Цена (₽)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={newEvent.price}
                  onChange={(e) => setNewEvent({ ...newEvent, price: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Макс. участников</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  value={newEvent.maxParticipants}
                  onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Отмена
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={handleCreateEvent}
              >
                Создать мероприятие
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyEvents;