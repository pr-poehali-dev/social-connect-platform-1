import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Ad {
  id: number;
  user_id: number;
  action: string;
  schedule: string;
  name: string;
  nickname: string;
  avatar_url: string;
  gender: string;
  city: string;
  age: number;
  created_at: string;
  events: { event_type: string; details: string }[];
}

const Ads = () => {
  const [activeCategory, setActiveCategory] = useState('go');
  const [activeEventType, setActiveEventType] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

  const eventTypes = [
    { id: 'all', label: 'Все', icon: 'Grid3x3' },
    { id: 'date', label: 'Свидание', icon: 'Heart' },
    { id: 'dinner', label: 'Ужин', icon: 'UtensilsCrossed' },
    { id: 'concert', label: 'Концерт', icon: 'Music' },
    { id: 'party', label: 'Вечеринка', icon: 'PartyPopper' },
    { id: 'tour', label: 'Совместный ТУР', icon: 'Plane' }
  ];

  useEffect(() => {
    loadAds();
  }, [activeCategory]);

  const loadAds = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/975a1308-86d5-457a-8069-dd843f483056?action=${activeCategory}`);
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось загрузить объявления', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diff < 3600) return `${Math.floor(diff / 60)} минут назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} часов назад`;
    return `${Math.floor(diff / 86400)} дней назад`;
  };

  const eventTypeMapping: { [key: string]: string } = {
    'date': 'Свидание',
    'dinner': 'Ужин',
    'concert': 'Концерт',
    'party': 'Вечеринка',
    'tour': 'Совместный ТУР'
  };

  const filterAdsByEventType = (ads: Ad[]) => {
    if (activeEventType === 'all') {
      return ads;
    }
    
    const eventTypeLabel = eventTypeMapping[activeEventType];
    return ads.filter(ad => 
      ad.events.some(event => event.event_type === eventTypeLabel)
    );
  };

  const getFilteredAds = () => {
    let filtered = ads;
    
    // Фильтр по городу
    if (selectedCity !== 'Все города') {
      filtered = filtered.filter(ad => ad.city === selectedCity);
    }
    
    // Фильтр по полу
    if (selectedGender !== 'all') {
      filtered = filtered.filter(ad => ad.gender === selectedGender);
    }
    
    // Фильтр по типу мероприятия
    filtered = filterAdsByEventType(filtered);
    
    return filtered;
  };

  const handleInvite = (ad: Ad) => {
    setSelectedAd(ad);
    setInviteMessage('');
  };

  const sendInvite = async () => {
    if (!inviteMessage.trim()) {
      toast({ title: 'Ошибка', description: 'Введите сообщение', variant: 'destructive' });
      return;
    }

    setSending(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('https://functions.poehali.dev/6b2f5e52-63ea-4c72-bc0c-e5ff6ccf7ffc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_id: selectedAd?.user_id,
          message: inviteMessage
        })
      });

      if (response.ok) {
        toast({ title: 'Успех!', description: 'Приглашение отправлено' });
        setSelectedAd(null);
        setInviteMessage('');
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось отправить приглашение', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const filteredAds = getFilteredAds();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Заголовок */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Объявления</h1>
              <p className="text-muted-foreground">Найдите компанию для мероприятий</p>
            </div>

            {/* Фильтры */}
            <Card className="mb-6 p-4 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Фильтр: Город */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Город</label>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/select-city', { state: { currentCity: selectedCity, returnTo: '/ads' } })}
                    className="w-full justify-between rounded-xl"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon name="MapPin" size={16} className="flex-shrink-0" />
                      <span className="truncate">{selectedCity}</span>
                    </div>
                    <Icon name="ChevronRight" size={16} className="ml-2 opacity-50 flex-shrink-0" />
                  </Button>
                </div>

                {/* Фильтр: Пол */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Пол</label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Все" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="male">Мужчины</SelectItem>
                      <SelectItem value="female">Женщины</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Фильтр: Намерение */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Намерение</label>
                  <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="go">
                        <div className="flex items-center gap-2">
                          <Icon name="MapPin" size={16} />
                          Схожу
                        </div>
                      </SelectItem>
                      <SelectItem value="invite">
                        <div className="flex items-center gap-2">
                          <Icon name="Sparkles" size={16} />
                          Приглашу
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Фильтр: Тип мероприятия */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Тип мероприятия</label>
                  <Select value={activeEventType} onValueChange={setActiveEventType}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((eventType) => (
                        <SelectItem key={eventType.id} value={eventType.id}>
                          <div className="flex items-center gap-2">
                            <Icon name={eventType.icon} size={16} />
                            {eventType.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Результаты поиска */}
            <div className="mb-4 text-sm text-muted-foreground">
              Найдено объявлений: <span className="font-semibold text-foreground">{filteredAds.length}</span>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : filteredAds.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="SearchX" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Нет объявлений по выбранным фильтрам</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAds.map((ad) => (
                  <Card key={ad.id} className="p-4 rounded-2xl hover:shadow-lg transition-shadow">
                    <div className="flex gap-4">
                      
                      {/* Аватар */}
                      <div className="flex-shrink-0">
                        {ad.avatar_url ? (
                          <img
                            src={ad.avatar_url}
                            alt={ad.name}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                            <Icon name="User" size={32} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Контент */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                              {ad.name}, {ad.age}
                              <Badge variant="secondary" className="rounded-full">
                                <Icon name={ad.gender === 'male' ? 'User' : 'Heart'} size={12} className="mr-1" />
                                {ad.gender === 'male' ? 'М' : 'Ж'}
                              </Badge>
                            </h3>
                            <p className="text-sm text-muted-foreground">@{ad.nickname}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {getTimeAgo(ad.created_at)}
                          </span>
                        </div>

                        {/* События */}
                        <div className="mb-3 space-y-1">
                          {ad.events.map((event, idx) => (
                            <div key={idx} className="text-sm">
                              <Badge variant="outline" className="rounded-lg mr-2">
                                {event.event_type}
                              </Badge>
                              <span className="text-muted-foreground">{event.details || 'Без деталей'}</span>
                            </div>
                          ))}
                        </div>

                        {/* Город и кнопка */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Icon name="MapPin" size={14} />
                            {ad.city}
                          </div>
                          <Button
                            size="sm"
                            className="rounded-xl gap-2"
                            onClick={() => handleInvite(ad)}
                          >
                            <Icon name="MessageCircle" size={14} />
                            Написать
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Диалог приглашения */}
      <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Отправить сообщение</DialogTitle>
            <DialogDescription>
              {selectedAd?.name}, {selectedAd?.age} лет
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Напишите сообщение..."
              className="rounded-2xl min-h-[120px]"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedAd(null)}
                className="flex-1 rounded-2xl"
              >
                Отмена
              </Button>
              <Button
                onClick={sendInvite}
                disabled={sending}
                className="flex-1 rounded-2xl"
              >
                {sending ? 'Отправка...' : 'Отправить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Ads;
