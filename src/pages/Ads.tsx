import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

const Ads = () => {
  const [activeCategory, setActiveCategory] = useState('go_together');

  const categories = [
    { id: 'go_together', label: 'СХОЖУ', icon: 'MapPin' },
    { id: 'invite', label: 'ПРИГЛАШУ', icon: 'Sparkles' }
  ];

  const ads = {
    go_together: [
      {
        id: 1,
        title: 'Алексей, 28 лет',
        description: 'Схожу в кино на новый блокбастер. Ищу компанию для просмотра.',
        gender: 'men',
        age: 28,
        location: 'Москва',
        image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
        date: '2 часа назад'
      },
      {
        id: 2,
        title: 'Анна, 25 лет',
        description: 'Планирую сходить на выставку современного искусства. Буду рада компании!',
        gender: 'women',
        age: 25,
        location: 'Санкт-Петербург',
        image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
        date: '5 часов назад'
      },
      {
        id: 3,
        title: 'Дмитрий, 32 года',
        description: 'Хочу сходить в боулинг и попробовать новый бар. Жду классную компанию.',
        gender: 'men',
        age: 32,
        location: 'Казань',
        image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
        date: '1 день назад'
      },
      {
        id: 4,
        title: 'Мария, 23 года',
        description: 'Ищу компанию для похода в караоке в эти выходные.',
        gender: 'women',
        age: 23,
        location: 'Москва',
        image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
        date: '3 часа назад'
      }
    ],
    invite: [
      {
        id: 5,
        title: 'Игорь, 35 лет',
        description: 'Приглашаю в элитный ресторан White Rabbit. Ужин и шампанское от меня.',
        gender: 'men',
        age: 35,
        location: 'Москва',
        image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
        date: '1 час назад'
      },
      {
        id: 6,
        title: 'Виктория, 27 лет',
        description: 'Приглашаю на вечеринку в клуб Gipsy. VIP-столик уже забронирован.',
        gender: 'women',
        age: 27,
        location: 'Москва',
        image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
        date: '3 часа назад'
      },
      {
        id: 7,
        title: 'Александр, 40 лет',
        description: 'Приглашаю на яхту в Сочи на этих выходных. Всё включено.',
        gender: 'men',
        age: 40,
        location: 'Сочи',
        image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
        date: '2 часа назад'
      },
      {
        id: 8,
        title: 'Елена, 30 лет',
        description: 'Приглашаю в премиум кальянную Smoke Lounge. Приятная атмосфера гарантирована!',
        gender: 'women',
        age: 30,
        location: 'Санкт-Петербург',
        image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
        date: '4 часа назад'
      }
    ]
  };

  const currentAds = ads[activeCategory as keyof typeof ads];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-32 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                <span className="animate-pulse text-5xl">🔴</span>
                <span>LIVE</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Живые предложения и приглашения
              </p>
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentAds.map((ad) => (
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