import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VerificationRequest {
  id: number;
  user_id: number;
  status: string;
  comment: string;
  admin_comment: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  first_name: string;
  last_name: string;
  name: string;
  avatar_url: string;
  email: string;
}

const AdminVerification = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/3d79d23d-1d79-4ac6-a56b-a5f9b8edeca8?action=list'
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить заявки',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/3d79d23d-1d79-4ac6-a56b-a5f9b8edeca8?action=review',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            request_id: requestId,
            status,
            admin_comment: adminComment,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: status === 'approved' ? 'Заявка одобрена' : 'Заявка отклонена',
          description: 'Пользователь будет уведомлён',
        });
        setSelectedRequest(null);
        setAdminComment('');
        loadRequests();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось обработать заявку',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to review request:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">На рассмотрении</span>;
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Одобрено</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Отклонено</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Icon name="Loader2" size={48} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Заявки на верификацию</h1>
            <p className="text-muted-foreground">
              Всего заявок: {requests.length} | 
              Ожидают: {requests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <Button onClick={loadRequests} variant="outline" size="icon">
            <Icon name="RotateCw" size={20} />
          </Button>
        </div>

        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="p-6 rounded-2xl">
              <div className="flex items-start gap-4">
                <img
                  src={request.avatar_url || 'https://via.placeholder.com/80'}
                  alt={request.first_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {request.first_name} {request.last_name || request.name}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{request.email}</p>
                  
                  {request.comment && (
                    <div className="bg-muted/50 p-3 rounded-lg mb-3">
                      <p className="text-sm"><strong>Комментарий:</strong> {request.comment}</p>
                    </div>
                  )}
                  
                  {request.admin_comment && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <p className="text-sm"><strong>Ответ администратора:</strong> {request.admin_comment}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Создана: {formatDate(request.created_at)}</span>
                    {request.reviewed_at && (
                      <span>Обработана: {formatDate(request.reviewed_at)}</span>
                    )}
                  </div>
                </div>
                
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedRequest(request)}
                      size="sm"
                      variant="outline"
                    >
                      Обработать
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {requests.length === 0 && (
            <Card className="p-12 text-center rounded-3xl">
              <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold mb-2">Нет заявок</p>
              <p className="text-muted-foreground">Все заявки на верификацию обработаны</p>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Обработка заявки</DialogTitle>
            <DialogDescription>
              Одобрить или отклонить заявку на верификацию
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedRequest.avatar_url || 'https://via.placeholder.com/60'}
                  alt={selectedRequest.first_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">
                    {selectedRequest.first_name} {selectedRequest.last_name || selectedRequest.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                </div>
              </div>
              
              {selectedRequest.comment && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Комментарий пользователя:</p>
                  <p className="text-sm">{selectedRequest.comment}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Комментарий администратора (опционально)
                </label>
                <Textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Укажите причину или дополнительную информацию..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleReview(selectedRequest.id, 'approved')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Icon name="Check" size={18} className="mr-2" />
                  Одобрить
                </Button>
                <Button
                  onClick={() => handleReview(selectedRequest.id, 'rejected')}
                  variant="destructive"
                  className="flex-1"
                >
                  <Icon name="X" size={18} className="mr-2" />
                  Отклонить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerification;
