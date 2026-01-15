import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const Ads = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Все', icon: 'Grid3x3' },
    { id: 'dating', label: 'Познакомлюсь', icon: 'Heart' },
    { id: 'buysell', label: 'Куплю/продам', icon: 'ShoppingCart' },
    { id: 'events', label: 'Приглашу/пойду', icon: 'Calendar' },
    { id: 'apartments', label: 'Аренда квартир', icon: 'Home' },
    { id: 'cars', label: 'Аренда авто', icon: 'Car' },
    { id: 'flowers', label: 'Доставка цветов', icon: 'Flower2' },
    { id: 'jobs', label: 'Работа', icon: 'Briefcase' }
  ];

  const ads = [
    {
      id: 1,
      title: 'iPhone 15 Pro Max 256GB',
      price: '120 000 ₽',
      category: 'Электроника',
      location: 'Москва',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      date: '2 часа назад'
    },
    {
      id: 2,
      title: 'Toyota Camry 2022',
      price: '3 200 000 ₽',
      category: 'Авто',
      location: 'Санкт-Петербург',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      date: '5 часов назад'
    },
    {
      id: 3,
      title: '2-комнатная квартира',
      price: '8 500 000 ₽',
      category: 'Недвижимость',
      location: 'Казань',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      date: '1 день назад'
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
                  <TabsTrigger key={category.id} value={category.id} className="gap-2 rounded-xl">
                    <Icon name={category.icon} size={16} />
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <Card key={ad.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer rounded-3xl overflow-hidden border-2">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="rounded-full">
                        {ad.category}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{ad.date}</p>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{ad.title}</h3>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <Icon name="MapPin" size={14} />
                      {ad.location}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-primary">{ad.price}</p>
                      <Button size="icon" variant="ghost" className="rounded-full">
                        <Icon name="Heart" size={20} />
                      </Button>
                    </div>
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