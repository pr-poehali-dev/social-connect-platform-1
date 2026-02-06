import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: number;
  ad_id: number;
  inviter_id: number;
  inviter_name: string;
  inviter_avatar: string;
  message: string;
  status: string;
  created_at: string;
  ad_title: string;
}

const Applications = () => {
  const { adId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadApplications();
  }, [adId]);

  const loadApplications = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      toast({ title: 'Ошибка', description: 'Войдите в систему', variant: 'destructive' });
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        `https://functions.poehali.dev/91952046-1c2f-403b-a4a2-82416f982e8c?ad_id=${adId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось загрузить заявки', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: number, newStatus: string) => {
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch('https://functions.poehali.dev/60ab18f2-4446-4005-a356-00089ae33d8e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          invitation_id: applicationId,
          status: newStatus
        })
      });

      if (response.ok) {
        toast({ 
          title: 'Успешно', 
          description: newStatus === 'accepted' ? 'Приглашение принято' : 'Приглашение отклонено' 
        });
        loadApplications();
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось обновить статус', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Ожидает', variant: 'secondary' },
      accepted: { label: 'Принято', variant: 'default' },
      rejected: { label: 'Отклонено', variant: 'destructive' }
    };
    
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 lg:overflow-auto overflow-y-auto overflow-x-hidden">
      <Navigation />
      
      <main className="pt-32 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/my-ads')}
                className="rounded-full"
              >
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <h1 className="text-3xl font-bold">Заявки на объявление</h1>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : applications.length === 0 ? (
              <Card className="rounded-3xl border-2">
                <CardContent className="p-12 text-center">
                  <Icon name="Inbox" size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-xl text-muted-foreground">Пока нет заявок</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Когда работодатели отправят вам приглашения, они появятся здесь
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <Card key={app.id} className="rounded-3xl border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {app.inviter_avatar ? (
                            <img
                              src={app.inviter_avatar}
                              alt={app.inviter_name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                              <Icon name="User" size={32} className="text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold">{app.inviter_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {getTimeAgo(app.created_at)}
                              </p>
                            </div>
                            {getStatusBadge(app.status)}
                          </div>

                          {app.message && (
                            <div className="bg-muted/50 rounded-2xl p-4 mb-4">
                              <p className="text-sm">{app.message}</p>
                            </div>
                          )}

                          {app.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => updateStatus(app.id, 'accepted')}
                                className="rounded-xl gap-2"
                              >
                                <Icon name="Check" size={16} />
                                Принять
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => updateStatus(app.id, 'rejected')}
                                className="rounded-xl gap-2"
                              >
                                <Icon name="X" size={16} />
                                Отклонить
                              </Button>
                            </div>
                          )}
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

export default Applications;