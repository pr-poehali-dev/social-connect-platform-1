import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const MyAds = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userAds, setUserAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://functions.poehali.dev/975a1308-86d5-457a-8069-dd843f483056?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserAds(data);
      }
    } catch (error) {
      console.error('Failed to load ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAdStatus = async (adId: number, newStatus: string) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    try {
      const response = await fetch(`https://functions.poehali.dev/975a1308-86d5-457a-8069-dd843f483056?user_id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: adId,
          status: newStatus
        })
      });

      if (response.ok) {
        await loadAds();
        toast({
          title: 'Статус обновлен',
          description: 'Статус объявления успешно изменен',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

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
              <Button className="gap-2 rounded-2xl" onClick={() => navigate('/create-ad')}>
                <Icon name="Plus" size={20} />
                Создать объявление
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : (
              <>
                {userAds.length > 0 && (
                  <div className="flex gap-2 mb-6">
                    <Button
                      variant={activeTab === 'active' ? 'default' : 'outline'}
                      className="rounded-2xl flex-1"
                      onClick={() => setActiveTab('active')}
                    >
                      <Icon name="CheckCircle" size={20} className="mr-2" />
                      Активные ({userAds.filter(ad => ad.status === 'active' || ad.status === 'paused').length})
                    </Button>
                    <Button
                      variant={activeTab === 'completed' ? 'default' : 'outline'}
                      className="rounded-2xl flex-1"
                      onClick={() => setActiveTab('completed')}
                    >
                      <Icon name="Archive" size={20} className="mr-2" />
                      Завершенные ({userAds.filter(ad => ad.status === 'stopped').length})
                    </Button>
                  </div>
                )}

                {userAds.length === 0 ? (
                  <Card className="rounded-3xl border-2 shadow-xl">
                    <CardContent className="p-12 text-center">
                      <Icon name="FileText" size={64} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-2xl font-bold mb-2">У вас пока нет объявлений</h3>
                      <p className="text-muted-foreground mb-6">Создайте первое объявление, чтобы начать знакомства</p>
                      <Button className="gap-2 rounded-2xl" onClick={() => navigate('/create-ad')}>
                        <Icon name="Plus" size={20} />
                        Создать объявление
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                {userAds.filter(ad => 
                  activeTab === 'active' 
                    ? (ad.status === 'active' || ad.status === 'paused')
                    : ad.status === 'stopped'
                ).map((ad) => {
                  const eventLabels: Record<string, string> = {
                    'date': 'Свидание',
                    'cinema': 'Кино',
                    'dinner': 'Ужин',
                    'concert': 'Концерт',
                    'party': 'Вечеринка',
                    'tour': 'Совместный ТУР'
                  };
                  
                  return (
                    <Card key={ad.id} className="rounded-3xl border-2 shadow-xl overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold mb-2">{ad.name}, {ad.age || '28'} лет</h3>
                            {getStatusBadge(ad.status)}
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(ad.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="font-semibold mb-2">Действие: {ad.action === 'invite' ? 'Пригласить' : 'Сходить'}</p>
                          <div className="space-y-2">
                            <p className="font-semibold">Мероприятия:</p>
                            {ad.events && ad.events.map((event: any, idx: number) => (
                              <div key={idx} className="ml-4">
                                <p className="font-medium">• {eventLabels[event.event_type] || event.event_type}</p>
                                {event.details && <p className="text-sm text-muted-foreground ml-4">{event.details}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <p className="font-semibold mb-1">График:</p>
                          <p className="text-muted-foreground">{ad.schedule}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" className="gap-2 rounded-xl">
                            <Icon name="Edit" size={16} />
                            Редактировать
                          </Button>
                          
                          {ad.status === 'active' && (
                            <Button 
                              variant="outline" 
                              className="gap-2 rounded-xl"
                              onClick={() => updateAdStatus(ad.id, 'paused')}
                            >
                              <Icon name="Pause" size={16} />
                              Приостановить
                            </Button>
                          )}
                          
                          {ad.status === 'paused' && (
                            <Button 
                              variant="outline" 
                              className="gap-2 rounded-xl"
                              onClick={() => updateAdStatus(ad.id, 'active')}
                            >
                              <Icon name="Play" size={16} />
                              Возобновить
                            </Button>
                          )}
                          
                          {(ad.status === 'active' || ad.status === 'paused') && (
                            <Button 
                              variant="destructive" 
                              className="gap-2 rounded-xl"
                              onClick={() => updateAdStatus(ad.id, 'stopped')}
                            >
                              <Icon name="StopCircle" size={16} />
                              Остановить
                            </Button>
                          )}
                          
                          {ad.status === 'stopped' && (
                            <Button 
                              variant="outline" 
                              className="gap-2 rounded-xl"
                              onClick={() => updateAdStatus(ad.id, 'active')}
                            >
                              <Icon name="Play" size={16} />
                              Возобновить
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {userAds.filter(ad => 
                  activeTab === 'active' 
                    ? (ad.status === 'active' || ad.status === 'paused')
                    : ad.status === 'stopped'
                ).length === 0 && (
                  <Card className="rounded-3xl border-2 shadow-xl">
                    <CardContent className="p-12 text-center">
                      <Icon name="FileText" size={64} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-bold mb-2">
                        {activeTab === 'active' ? 'Нет активных объявлений' : 'Нет завершенных объявлений'}
                      </h3>
                      <p className="text-muted-foreground">
                        {activeTab === 'active' ? 'Создайте новое объявление' : 'Здесь будут остановленные объявления'}
                      </p>
                    </CardContent>
                  </Card>
                )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyAds;