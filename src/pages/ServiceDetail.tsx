import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const ServiceDetail = () => {
  const { nickname } = useParams<{ nickname: string }>();
  const navigate = useNavigate();

  const user = {
    id: 1,
    name: 'Иван Петров',
    nickname: 'ivan_petrov',
    age: 28,
    city: 'Москва',
    district: 'Центральный',
    avatar: null,
    rating: 4.9,
    reviews: 127,
    serviceType: 'it',
    description: 'Профессиональный веб-разработчик с опытом более 5 лет. Специализируюсь на создании современных веб-сайтов и мобильных приложений. Работаю с React, Node.js, TypeScript.',
    online: true
  };

  const priceList = [
    { id: 1, service: 'Лендинг (1 страница)', price: '50 000 ₽', time: '3-5 дней' },
    { id: 2, service: 'Корпоративный сайт (до 10 страниц)', price: '150 000 ₽', time: '2-3 недели' },
    { id: 3, service: 'Интернет-магазин', price: '300 000 ₽', time: '1-2 месяца' },
    { id: 4, service: 'Мобильное приложение', price: '400 000 ₽', time: '2-3 месяца' },
    { id: 5, service: 'Доработка сайта (час работы)', price: '5 000 ₽', time: '1 час' }
  ];

  const reviews = [
    {
      id: 1,
      author: 'Александр К.',
      rating: 5,
      date: '15 января 2026',
      text: 'Отличная работа! Сайт сделан качественно и в срок. Все пожелания были учтены. Рекомендую!',
      verified: true
    },
    {
      id: 2,
      author: 'Елена М.',
      rating: 5,
      date: '10 января 2026',
      text: 'Профессиональный подход, быстрая обратная связь. Результат превзошёл ожидания. Буду обращаться ещё!',
      verified: true
    },
    {
      id: 3,
      author: 'Дмитрий С.',
      rating: 4,
      date: '5 января 2026',
      text: 'Хорошая работа, но были небольшие задержки по срокам. В целом доволен результатом.',
      verified: true
    }
  ];

  const handleOpenChat = () => {
    navigate(`/chat/${nickname}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Button 
              variant="ghost" 
              className="mb-6 gap-2 rounded-xl"
              onClick={() => navigate('/services')}
            >
              <Icon name="ArrowLeft" size={18} />
              Назад к услугам
            </Button>

            <Card className="rounded-3xl border-2 shadow-2xl mb-6">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <Avatar className="w-32 h-32 border-4 border-primary">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                        <p className="text-muted-foreground mb-2">{user.age} лет</p>
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Icon name="MapPin" size={16} className="text-muted-foreground" />
                          <span>{user.city}, {user.district}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Icon name="Star" size={18} className="text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-lg">{user.rating}</span>
                          </div>
                          <span className="text-muted-foreground">({user.reviews} отзывов)</span>
                        </div>
                      </div>
                    </div>

                    {user.online && (
                      <Badge variant="secondary" className="rounded-full mb-4">
                        <Icon name="Wifi" size={14} className="mr-1" />
                        Работает онлайн
                      </Badge>
                    )}

                    <p className="text-muted-foreground mb-6">{user.description}</p>

                    <Button 
                      size="lg" 
                      className="w-full md:w-auto rounded-xl gap-2"
                      onClick={handleOpenChat}
                    >
                      <Icon name="MessageCircle" size={20} />
                      Обсудить сделку
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="prices" className="mb-8">
              <TabsList className="w-full justify-start rounded-2xl">
                <TabsTrigger value="prices" className="gap-2 rounded-xl">
                  <Icon name="DollarSign" size={16} />
                  Прайс-лист
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-2 rounded-xl">
                  <Icon name="Star" size={16} />
                  Отзывы ({reviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="prices" className="mt-6">
                <Card className="rounded-3xl border-2">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {priceList.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{item.service}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Icon name="Clock" size={14} />
                              {item.time}
                            </p>
                          </div>
                          <p className="text-xl font-bold text-primary">{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="rounded-3xl border-2">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{review.author}</h3>
                              {review.verified && (
                                <Badge variant="secondary" className="rounded-full text-xs">
                                  <Icon name="CheckCircle" size={12} className="mr-1" />
                                  Оплатил услугу
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Icon 
                                key={i}
                                name="Star" 
                                size={16} 
                                className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetail;
