import Navigation from '@/components/Navigation';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import AdsFilters from '@/components/ads/AdsFilters';
import AdCard from '@/components/ads/AdCard';
import InviteDialog from '@/components/ads/InviteDialog';

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
  is_favorite?: boolean;
}

const Ads = () => {
  const [activeCategory, setActiveCategory] = useState('go');
  const [activeEventType, setActiveEventType] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
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

  useEffect(() => {
    loadAds();
  }, [activeCategory]);

  const loadAds = async () => {
    setLoading(true);
    try {
      const oppositeAction = activeCategory === 'go' ? 'invite' : 'go';
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`https://functions.poehali.dev/975a1308-86d5-457a-8069-dd843f483056?action=${oppositeAction}`, { headers });
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

  const handleToggleFavorite = async (adId: number) => {
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

    const ad = ads.find(a => a.id === adId);
    if (!ad) return;

    try {
      const action = ad.is_favorite ? 'favorite' : 'favorite';
      const method = ad.is_favorite ? 'DELETE' : 'POST';
      
      const response = await fetch(
        `https://functions.poehali.dev/975a1308-86d5-457a-8069-dd843f483056?action=${action}`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ad_id: adId })
        }
      );

      if (response.ok) {
        setAds(ads.map(a => 
          a.id === adId ? { ...a, is_favorite: !a.is_favorite } : a
        ));
        toast({
          title: ad.is_favorite ? 'Удалено из избранного' : 'Добавлено в избранное',
          description: ad.is_favorite ? '' : 'Объявление сохранено в разделе Избранное'
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
    'cinema': 'Кино',
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

  const parseSchedule = (schedule: string): Date | null => {
    try {
      const date = new Date(schedule);
      if (!isNaN(date.getTime())) {
        return date;
      }
      return null;
    } catch {
      return null;
    }
  };

  const getFilteredAds = () => {
    let filtered = ads;
    
    if (selectedCity !== 'Все города') {
      filtered = filtered.filter(ad => ad.city === selectedCity);
    }
    
    if (selectedGender !== 'all') {
      filtered = filtered.filter(ad => ad.gender === selectedGender);
    }
    
    filtered = filterAdsByEventType(filtered);
    
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(ad => {
        const eventDate = parseSchedule(ad.schedule);
        if (!eventDate) return false;
        
        if (dateRange.from && dateRange.to) {
          return eventDate >= dateRange.from && eventDate <= dateRange.to;
        } else if (dateRange.from) {
          return eventDate >= dateRange.from;
        } else if (dateRange.to) {
          return eventDate <= dateRange.to;
        }
        return true;
      });
    }
    
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
      // Получаем текущего пользователя
      const profileResponse = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!profileResponse.ok) {
        toast({ title: 'Ошибка', description: 'Не удалось загрузить профиль', variant: 'destructive' });
        setSending(false);
        return;
      }
      
      const userData = await profileResponse.json();

      // Отправляем заявку
      const response = await fetch('https://functions.poehali.dev/e92df60f-beeb-4c37-9515-8ad54d3ef4b5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ad_id: selectedAd?.id,
          sender_id: userData.id,
          message: inviteMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({ 
          title: 'Успех!', 
          description: 'Заявка отправлена. Перейдите в сообщения для продолжения диалога.',
          action: (
            <Button size="sm" onClick={() => navigate('/messages', { state: { openChatId: data.conversation_id } })}>
              Открыть чат
            </Button>
          )
        });
        setSelectedAd(null);
        setInviteMessage('');
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error || 'Не удалось отправить заявку', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const filteredAds = getFilteredAds();

  return (
    <div className="min-h-screen bg-background lg:overflow-auto overflow-y-auto overflow-x-hidden">
      <Navigation />
      
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            <AdsFilters
              selectedCity={selectedCity}
              selectedGender={selectedGender}
              activeCategory={activeCategory}
              activeEventType={activeEventType}
              dateRange={dateRange}
              onCityClick={() => navigate('/select-city', { state: { currentCity: selectedCity, returnTo: '/ads' } })}
              onGenderChange={setSelectedGender}
              onCategoryChange={setActiveCategory}
              onEventTypeChange={setActiveEventType}
              onDateRangeChange={setDateRange}
            />

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
                  <AdCard
                    key={ad.id}
                    ad={ad}
                    onInvite={handleInvite}
                    onToggleFavorite={handleToggleFavorite}
                    getTimeAgo={getTimeAgo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <InviteDialog
        selectedAd={selectedAd}
        inviteMessage={inviteMessage}
        sending={sending}
        onClose={() => setSelectedAd(null)}
        onMessageChange={setInviteMessage}
        onSend={sendInvite}
      />
    </div>
  );
};

export default Ads;