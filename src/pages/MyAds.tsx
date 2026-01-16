import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const MyAds = () => {
  const [userAds] = useState([
    {
      id: 1,
      title: 'Алексей, 28 лет',
      description: 'Ищу девушку для серьезных отношений. Люблю активный отдых, путешествия.',
      age: 28,
      location: 'Москва',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      status: 'active',
      date: '2 дня назад'
    },
    {
      id: 2,
      title: 'Алексей, 28 лет',
      description: 'Предприниматель, ищу спутницу для совместных путешествий.',
      age: 28,
      location: 'Москва',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      status: 'paused',
      date: '5 дней назад'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500">Активно</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">Приостановлено</Badge>;
      case 'stopped':
        return <Badge className="bg-red-500">Остановлено</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                Мои объявления
              </h1>
              <Button className="gap-2 rounded-2xl">
                <Icon name="Plus" size={20} />
                Создать объявление
              </Button>
            </div>

            {userAds.length === 0 ? (
              <Card className="rounded-3xl border-2 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Icon name="FileText" size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-2">У вас пока нет объявлений</h3>
                  <p className="text-muted-foreground mb-6">Создайте первое объявление, чтобы начать знакомства</p>
                  <Button className="gap-2 rounded-2xl">
                    <Icon name="Plus" size={20} />
                    Создать объявление
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {userAds.map((ad) => (
                  <Card key={ad.id} className="rounded-3xl border-2 shadow-xl overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-64 h-64 overflow-hidden">
                          <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold mb-2">{ad.title}</h3>
                              {getStatusBadge(ad.status)}
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-nowrap">{ad.date}</p>
                          </div>
                          
                          <p className="text-muted-foreground mb-4">
                            {ad.description}
                          </p>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                            <Icon name="MapPin" size={14} />
                            {ad.location}
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            <Button variant="outline" className="gap-2 rounded-xl">
                              <Icon name="Edit" size={16} />
                              Редактировать
                            </Button>
                            
                            {ad.status === 'active' && (
                              <Button variant="outline" className="gap-2 rounded-xl">
                                <Icon name="Pause" size={16} />
                                Приостановить
                              </Button>
                            )}
                            
                            {ad.status === 'paused' && (
                              <Button variant="outline" className="gap-2 rounded-xl">
                                <Icon name="Play" size={16} />
                                Возобновить
                              </Button>
                            )}
                            
                            {(ad.status === 'active' || ad.status === 'paused') && (
                              <Button variant="destructive" className="gap-2 rounded-xl">
                                <Icon name="StopCircle" size={16} />
                                Остановить
                              </Button>
                            )}
                            
                            {ad.status === 'stopped' && (
                              <Button variant="outline" className="gap-2 rounded-xl">
                                <Icon name="Play" size={16} />
                                Возобновить
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
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

export default MyAds;
