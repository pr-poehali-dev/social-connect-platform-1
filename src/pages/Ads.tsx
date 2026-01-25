import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
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
  const { toast } = useToast();

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



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-32 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">


            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-semibold text-muted-foreground whitespace-nowrap">
                Встречи, свидания
              </h2>
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1">
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
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : ads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Нет объявлений</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
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
                      
                      <Button className="w-full rounded-2xl gap-2">
                        <Icon name="MessageCircle" size={16} />
                        Написать
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Ads;