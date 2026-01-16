import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const Ads = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAds = async () => {
      const isAuth = !!localStorage.getItem('access_token');
      
      if (!isAuth) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('https://functions.poehali.dev/e4123cfd-1bed-41c3-afe8-325905b78c2c');
        const data = await response.json();
        setAds(data);
      } catch (error) {
        console.error('Failed to load ads:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAds();
  }, []);

  const categories = [
    { id: 'all', label: 'Все', icon: 'Users' },
    { id: 'men', label: 'Мужчины', icon: 'User' },
    { id: 'women', label: 'Девушки', icon: 'Heart' }
  ];

  const defaultAds = [
    {
      id: 1,
      title: 'Алексей, 28 лет',
      description: 'Ищу девушку для серьезных отношений. Люблю активный отдых, путешествия.',
      gender: 'men',
      age: 28,
      location: 'Москва',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      date: '2 часа назад'
    },
    {
      id: 2,
      title: 'Анна, 25 лет',
      description: 'Хочу познакомиться с интересным человеком для общения и встреч.',
      gender: 'women',
      age: 25,
      location: 'Санкт-Петербург',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      date: '5 часов назад'
    },
    {
      id: 3,
      title: 'Дмитрий, 32 года',
      description: 'Предприниматель, ищу спутницу жизни. Ценю честность и открытость.',
      gender: 'men',
      age: 32,
      location: 'Казань',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      date: '1 день назад'
    },
    {
      id: 4,
      title: 'Мария, 23 года',
      description: 'Студентка, люблю кино, музыку и прогулки по вечерам.',
      gender: 'women',
      age: 23,
      location: 'Москва',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      date: '3 часа назад'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="all" className="mb-8">
              <TabsList className="w-full justify-start overflow-x-auto rounded-2xl">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id} 
                    className="gap-2 rounded-xl"
                    onClick={() => {
                      if (category.id === 'men') {
                        window.location.href = '/ads/man';
                      } else if (category.id === 'women') {
                        window.location.href = '/ads/woman';
                      }
                    }}
                  >
                    <Icon name={category.icon} size={16} />
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12">Загрузка...</div>
              ) : (ads.length > 0 ? ads : defaultAds).map((ad: any) => (
                <Card key={ad.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer rounded-3xl overflow-hidden border-2">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Badge 
                      variant="secondary" 
                      className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur-sm"
                    >
                      <Icon name={ad.gender === 'men' ? 'User' : 'Heart'} size={12} className="mr-1" />
                      {ad.age} лет
                    </Badge>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold">{ad.title}</h3>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{ad.date}</p>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {ad.description}
                    </p>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <Icon name="MapPin" size={14} />
                      {ad.location}
                    </div>
                    
                    <Button className="w-full rounded-2xl gap-2">
                      <Icon name="MessageCircle" size={16} />
                      Написать
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Ads;