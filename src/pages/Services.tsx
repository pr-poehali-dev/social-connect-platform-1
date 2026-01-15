import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

const Services = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const services = [
    {
      id: 1,
      title: 'Создание веб-сайтов',
      seller: 'Иван Петров',
      rating: 4.9,
      reviews: 127,
      price: 'от 50 000 ₽',
      deliveryTime: '7 дней',
      category: 'IT & Разработка',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg'
    },
    {
      id: 2,
      title: 'Дизайн логотипа',
      seller: 'Анна Смирнова',
      rating: 5.0,
      reviews: 89,
      price: 'от 5 000 ₽',
      deliveryTime: '2 дня',
      category: 'Дизайн',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg'
    },
    {
      id: 3,
      title: 'Копирайтинг и SEO',
      seller: 'Мария Козлова',
      rating: 4.8,
      reviews: 56,
      price: 'от 3 000 ₽',
      deliveryTime: '3 дня',
      category: 'Контент',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                    Услуги
                  </h1>
                  <p className="text-muted-foreground">Безопасные сделки с защитой покупателей</p>
                </div>
                <Button className="gap-2 rounded-2xl">
                  <Icon name="Plus" size={20} />
                  Создать услугу
                </Button>
              </div>
              
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Найти услугу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 rounded-2xl"
                />
              </div>
            </div>

            <Card className="mb-8 rounded-3xl border-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Icon name="Shield" size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Безопасная сделка</h3>
                    <p className="text-sm text-muted-foreground">
                      Деньги удерживаются до завершения работы. Гарантия возврата при спорах.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer rounded-3xl overflow-hidden border-2">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="rounded-full mb-3">
                      {service.category}
                    </Badge>
                    
                    <h3 className="text-xl font-bold mb-3 line-clamp-2">{service.title}</h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-secondary text-white">
                          {service.seller.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-muted-foreground">{service.seller}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{service.rating}</span>
                        <span className="text-muted-foreground">({service.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Icon name="Clock" size={14} />
                        {service.deliveryTime}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary">{service.price}</p>
                      <Button size="sm" className="rounded-xl">
                        Заказать
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

export default Services;
