import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const VerificationRequest = () => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkExistingRequest();
  }, []);

  const checkExistingRequest = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        'https://functions.poehali.dev/3d79d23d-1d79-4ac6-a56b-a5f9b8edeca8?action=status',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExistingRequest(data);
      }
    } catch (error) {
      console.error('Failed to check existing request:', error);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/3d79d23d-1d79-4ac6-a56b-a5f9b8edeca8?action=request',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ comment }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Заявка отправлена',
          description: 'Администратор рассмотрит вашу заявку в ближайшее время',
        });
        navigate('/profile');
      } else {
        const data = await response.json();
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить заявку',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: 'Clock',
          title: 'Заявка на рассмотрении',
          description: 'Администратор рассмотрит вашу заявку в ближайшее время',
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
        };
      case 'approved':
        return {
          icon: 'CheckCircle',
          title: 'Заявка одобрена',
          description: 'Ваш профиль верифицирован!',
          color: 'text-green-600',
          bg: 'bg-green-50',
        };
      case 'rejected':
        return {
          icon: 'XCircle',
          title: 'Заявка отклонена',
          description: 'К сожалению, ваша заявка была отклонена',
          color: 'text-red-600',
          bg: 'bg-red-50',
        };
      default:
        return null;
    }
  };

  if (existingRequest) {
    const statusInfo = getStatusInfo(existingRequest.status);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navigation />
        
        <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
          <Card className="p-8 rounded-3xl">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${statusInfo?.bg} mb-4`}>
                <Icon name={statusInfo?.icon as any} size={32} className={statusInfo?.color} />
              </div>
              <h1 className="text-2xl font-bold mb-2">{statusInfo?.title}</h1>
              <p className="text-muted-foreground">{statusInfo?.description}</p>
            </div>

            {existingRequest.admin_comment && (
              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <p className="text-sm font-medium mb-2">Комментарий администратора:</p>
                <p className="text-sm">{existingRequest.admin_comment}</p>
              </div>
            )}

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Дата подачи:</span>
                <span>{new Date(existingRequest.created_at).toLocaleDateString('ru-RU')}</span>
              </div>
              {existingRequest.updated_at && existingRequest.updated_at !== existingRequest.created_at && (
                <div className="flex justify-between">
                  <span>Последнее обновление:</span>
                  <span>{new Date(existingRequest.updated_at).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => navigate('/profile')} className="flex-1">
                Вернуться в профиль
              </Button>
              {existingRequest.status === 'rejected' && (
                <Button
                  onClick={() => {
                    setExistingRequest(null);
                    setComment('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Подать заново
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        <Card className="p-8 rounded-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
              <Icon name="BadgeCheck" size={32} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Запрос на верификацию</h1>
            <p className="text-muted-foreground">
              Подтвердите свою личность и получите значок верификации
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="Info" size={18} />
                Что даёт верификация?
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Синий значок рядом с именем</li>
                <li>• Больше доверия от других пользователей</li>
                <li>• Приоритет в поиске знакомств</li>
                <li>• Защита от мошенников</li>
              </ul>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Расскажите о себе (опционально)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Почему вы хотите верифицировать аккаунт? Дополнительная информация поможет администратору быстрее обработать заявку..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Администратор рассмотрит вашу заявку в течение 1-3 дней
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-12"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={18} className="mr-2" />
                    Отправить заявку
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                className="h-12 px-6"
              >
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerificationRequest;
