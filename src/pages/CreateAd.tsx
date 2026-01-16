import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const CreateAd = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [action, setAction] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [eventDetails, setEventDetails] = useState<{ [key: string]: string }>({});
  const [schedule, setSchedule] = useState('');
  const [userName, setUserName] = useState('Алексей');
  const [userAge, setUserAge] = useState('28');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) setUserName(user.name);
  }, []);

  const events = [
    { id: 'date', label: 'Свидание', icon: 'Heart' },
    { id: 'cinema', label: 'Кино', icon: 'Film' },
    { id: 'dinner', label: 'Ужин', icon: 'UtensilsCrossed' },
    { id: 'concert', label: 'Концерт', icon: 'Music' },
    { id: 'party', label: 'Вечеринка', icon: 'PartyPopper' },
    { id: 'tour', label: 'Совместный ТУР', icon: 'Plane' }
  ];

  const toggleEvent = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId));
      const newDetails = { ...eventDetails };
      delete newDetails[eventId];
      setEventDetails(newDetails);
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const handleEventDetailChange = (eventId: string, value: string) => {
    setEventDetails({ ...eventDetails, [eventId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    if (!userId) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо войти в систему',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    const eventsData = selectedEvents.map(eventId => ({
      type: eventId,
      details: eventDetails[eventId] || ''
    }));

    try {
      const response = await fetch(`https://functions.poehali.dev/975a1308-86d5-457a-8069-dd843f483056?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          schedule,
          events: eventsData
        })
      });

      if (response.ok) {
        toast({
          title: 'Объявление создано',
          description: 'Ваше объявление успешно опубликовано',
        });
        navigate('/my-ads');
      } else {
        throw new Error('Failed to create ad');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать объявление',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => navigate('/my-ads')}
              >
                <Icon name="ArrowLeft" size={24} />
              </Button>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                Создать объявление
              </h1>
            </div>

            <Card className="rounded-3xl border-2 shadow-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Имя</Label>
                      <Input
                        value={userName}
                        disabled
                        className="rounded-xl bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Автоматически из профиля</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Возраст</Label>
                      <Input
                        value={userAge}
                        disabled
                        className="rounded-xl bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Автоматически из профиля</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="action">Действие *</Label>
                    <Select value={action} onValueChange={setAction} required>
                      <SelectTrigger id="action" className="rounded-xl">
                        <SelectValue placeholder="Выберите действие" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invite">Пригласить</SelectItem>
                        <SelectItem value="go">Сходить</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Мероприятия *</Label>
                    <p className="text-sm text-muted-foreground">Выберите одно или несколько мероприятий</p>
                    
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={event.id} className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={event.id}
                              checked={selectedEvents.includes(event.id)}
                              onCheckedChange={() => toggleEvent(event.id)}
                            />
                            <Label
                              htmlFor={event.id}
                              className="flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Icon name={event.icon as any} size={20} />
                              {event.label}
                            </Label>
                          </div>
                          
                          {selectedEvents.includes(event.id) && (
                            <div className="ml-9 space-y-2">
                              <Label className="text-sm">Пожелания и детали</Label>
                              <Textarea
                                placeholder="Опишите пожелания, название заведений, предпочтения..."
                                className="rounded-xl resize-none"
                                rows={3}
                                value={eventDetails[event.id] || ''}
                                onChange={(e) => handleEventDetailChange(event.id, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule">График свободного времени *</Label>
                    <Textarea
                      id="schedule"
                      placeholder="Укажите ваш свободный график: дни недели, время суток..."
                      className="rounded-xl resize-none"
                      rows={4}
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-2xl"
                      onClick={() => navigate('/my-ads')}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-2xl"
                      disabled={!action || selectedEvents.length === 0 || !schedule || isLoading}
                    >
                      <Icon name="Check" size={20} className="mr-2" />
                      {isLoading ? 'Публикация...' : 'Опубликовать'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateAd;