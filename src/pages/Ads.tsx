import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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

  const categories = [
    { id: 'go', label: 'СХОЖУ', icon: 'MapPin' },
    { id: 'invite', label: 'ПРИГЛАШУ', icon: 'Sparkles' }
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

  const handleInvite = (ad: Ad) => {
    setSelectedAd(ad);
    setInviteMessage('');
  };

  const sendInvitation = async () => {
    if (!selectedAd) return;
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({ title: 'Ошибка', description: 'Войдите в систему', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const response = await fetch('https://functions.poehali.dev/b14e8b32-c495-4640-8f97-570d8802deb6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ad_id: selectedAd.id,
          message: inviteMessage
        })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Приглашение отправлено!' });
        setSelectedAd(null);
        setInviteMessage('');
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error || 'Не удалось отправить приглашение', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">


            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => navigate('/select-city', { state: { currentCity: selectedCity, returnTo: '/ads' } })}
                className="w-full sm:w-[200px] justify-between rounded-2xl py-6"
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon name="MapPin" size={16} className="flex-shrink-0" />
                  <span className="truncate">{selectedCity}</span>
                </div>
                <Icon name="ChevronRight" size={16} className="ml-2 opacity-50 flex-shrink-0" />
              </Button>
            </div>

            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
              <TabsList className="w-full justify-center rounded-2xl">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id} 
                    className="gap-2 rounded-xl text-base px-8 py-3"
                  >
                    <Icon name={category.icon} size={18} />
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : ads.filter(ad => selectedCity === 'Все города' || ad.city === selectedCity).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Нет объявлений в этом городе</p>
              </div>
            ) : (
              <>
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ads.filter(ad => selectedCity === 'Все города' || ad.city === selectedCity).map((ad) => (
                  <Card key={ad.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer rounded-3xl overflow-hidden border-2">
                    <div className="relative h-64 overflow-hidden">
                      {ad.avatar_url ? (
                        <img
                          src={ad.avatar_url}
                          alt={ad.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                          <Icon name="User" size={80} className="text-muted-foreground" />
                        </div>
                      )}
                      <Badge 
                        variant="secondary" 
                        className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur-sm"
                      >
                        <Icon name={ad.gender === 'male' ? 'User' : 'Heart'} size={12} className="mr-1" />
                        {ad.age} лет
                      </Badge>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold">{ad.name}, {ad.age} лет</h3>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{getTimeAgo(ad.created_at)}</p>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-4 space-y-2">
                        {ad.events.map((event, idx) => (
                          <div key={idx}>
                            <span className="font-medium">{event.event_type}:</span> {event.details || 'Без деталей'}
                          </div>
                        ))}
                      </div>
                      
                      {ad.city && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                          <Icon name="MapPin" size={14} />
                          {ad.city}
                        </div>
                      )}
                      
                      <Button 
                        className="w-full rounded-2xl gap-2"
                        onClick={() => handleInvite(ad)}
                      >
                        <Icon name="MessageCircle" size={16} />
                        Пригласить
                      </Button>
                    </CardContent>
                  </Card>
                  ))}
                </div>
                
                <div className="md:hidden relative">
                  <div 
                    className="overflow-hidden relative"
                    onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
                    onTouchMove={(e) => setTouchEnd(e.touches[0].clientX)}
                    onTouchEnd={() => {
                      const filteredAds = ads.filter(ad => selectedCity === 'Все города' || ad.city === selectedCity);
                      if (touchStart - touchEnd > 75 && currentIndex < filteredAds.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                      }
                      if (touchStart - touchEnd < -75 && currentIndex > 0) {
                        setCurrentIndex(currentIndex - 1);
                      }
                    }}
                  >
                    {ads.filter(ad => selectedCity === 'Все города' || ad.city === selectedCity).map((ad, index) => (
                      <Card 
                        key={ad.id} 
                        className={`group hover:shadow-2xl cursor-pointer rounded-3xl overflow-hidden border-2 absolute inset-0 transition-all duration-500 ease-in-out ${
                          index === currentIndex 
                            ? 'opacity-100 translate-x-0 z-10' 
                            : index < currentIndex 
                              ? 'opacity-0 -translate-x-full z-0' 
                              : 'opacity-0 translate-x-full z-0'
                        }`}
                        style={{ position: index === currentIndex ? 'relative' : 'absolute' }}
                      >
                        <div className="relative h-64 overflow-hidden">
                          {ad.avatar_url ? (
                            <img
                              src={ad.avatar_url}
                              alt={ad.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                              <Icon name="User" size={80} className="text-muted-foreground" />
                            </div>
                          )}
                          <Badge 
                            variant="secondary" 
                            className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur-sm"
                          >
                            <Icon name={ad.gender === 'male' ? 'User' : 'Heart'} size={12} className="mr-1" />
                            {ad.age} лет
                          </Badge>
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-bold">{ad.name}, {ad.age} лет</h3>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">{getTimeAgo(ad.created_at)}</p>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-4 space-y-2">
                            {ad.events.map((event, idx) => (
                              <div key={idx}>
                                <span className="font-medium">{event.event_type}:</span> {event.details || 'Без деталей'}
                              </div>
                            ))}
                          </div>
                          
                          {ad.city && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                              <Icon name="MapPin" size={14} />
                              {ad.city}
                            </div>
                          )}
                          
                          <Button 
                            className="w-full rounded-2xl gap-2"
                            onClick={() => handleInvite(ad)}
                          >
                            <Icon name="MessageCircle" size={16} />
                            Пригласить
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-center gap-2 mt-4">
                    {ads.filter(ad => selectedCity === 'Все города' || ad.city === selectedCity).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Отправить приглашение</DialogTitle>
            <DialogDescription>
              {selectedAd && `${selectedAd.name}, ${selectedAd.age} лет`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Напишите сообщение (необязательно)..."
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedAd(null)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={sendInvitation}
                disabled={sending}
                className="flex-1"
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