import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import FavoriteProfilesTab from '@/components/favorites/FavoriteProfilesTab';
import FavoriteAdsTab from '@/components/favorites/FavoriteAdsTab';
import FavoriteServicesTab from '@/components/favorites/FavoriteServicesTab';
import FavoriteEventsTab from '@/components/favorites/FavoriteEventsTab';

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
                <FavoriteProfilesTab
                  favoriteProfiles={favoriteProfiles}
                  onRemoveFromFavorites={handleRemoveFromFavorites}
                  onNavigate={navigate}
                />
              </TabsContent>

              <TabsContent value="ads" className="space-y-4">
                <FavoriteAdsTab
                  favoriteAds={favoriteAds}
                  onRemoveFromFavorites={handleRemoveFromFavorites}
                  onNavigate={navigate}
                />
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <FavoriteServicesTab
                  favoriteServices={favoriteServices}
                  onRemoveFromFavorites={handleRemoveFromFavorites}
                  onNavigate={navigate}
                />
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <FavoriteEventsTab
                  favoriteEvents={favoriteEvents}
                  joinedEvents={joinedEvents}
                  onRemoveFromFavorites={handleRemoveFromFavorites}
                  onJoinEvent={handleJoinEvent}
                  onNavigate={navigate}
                  onToast={toast}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Favorites;
