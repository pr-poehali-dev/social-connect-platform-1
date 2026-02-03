import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const ADMIN_API = 'https://functions.poehali.dev/1a9ecaa4-2882-4498-965a-c16eb32920ec';

interface VerificationRequest {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  status: 'pending' | 'approved' | 'rejected';
  selfie_photo_url: string;
  document_photo_url: string;
  comment: string;
  admin_comment: string;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
}

const AdminVerification = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadVerificationRequests();
  }, [filter]);

  const loadVerificationRequests = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const response = await fetch(`${ADMIN_API}?action=verification_list&filter=${filter}`, {
        headers: {
          'X-Authorization': `Bearer ${token}`
        }
      });

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
      console.error('Failed to load verification requests:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    }
  };

  const handleDecision = async (requestId: number, decision: 'approve' | 'reject') => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${ADMIN_API}?action=verification_decision`, {
        method: 'POST',
        headers: {
          'X-Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_id: requestId,
          decision: decision,
          admin_comment: adminComment
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: decision === 'approve' ? 'Заявка одобрена' : 'Заявка отклонена',
        });
        setSelectedRequest(null);
        setAdminComment('');
        loadVerificationRequests();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.error || 'Не удалось обработать заявку',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to process decision:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">На рассмотрении</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Одобрена</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Отклонена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Верификация пользователей</h1>
          <p className="text-muted-foreground">Рассмотрение заявок на верификацию</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          Назад
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Ожидают ({requests.filter(r => r.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Все заявки
        </Button>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Нет заявок для отображения</p>
            </CardContent>
          </Card>
        ) : (
          requests.map(request => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {request.user_name}
                      {getStatusBadge(request.status)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{request.user_email}</p>
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    <p>Подано: {new Date(request.created_at).toLocaleDateString('ru-RU')}</p>
                    {request.reviewed_at && (
                      <p>Рассмотрено: {new Date(request.reviewed_at).toLocaleDateString('ru-RU')}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {request.comment && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Комментарий пользователя:</p>
                    <p className="text-sm">{request.comment}</p>
                  </div>
                )}
                
                {request.admin_comment && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Комментарий администратора:</p>
                    <p className="text-sm">{request.admin_comment}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequest(request)}
                    className="flex-1"
                  >
                    <Icon name="Eye" size={16} className="mr-2" />
                    Просмотреть фото
                  </Button>
                  
                  {request.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        onClick={() => {
                          setSelectedRequest(request);
                          setAdminComment('');
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Icon name="Check" size={16} className="mr-2" />
                        Одобрить
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSelectedRequest(request);
                          setAdminComment('');
                        }}
                      >
                        <Icon name="X" size={16} className="mr-2" />
                        Отклонить
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={selectedRequest !== null} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Заявка на верификацию: {selectedRequest?.user_name}</DialogTitle>
            <DialogDescription>
              ID пользователя: {selectedRequest?.user_id} | Email: {selectedRequest?.user_email}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Camera" size={18} />
                    Селфи
                  </h3>
                  <img
                    src={selectedRequest.selfie_photo_url}
                    alt="Selfie"
                    className="w-full rounded-lg border"
                  />
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="FileText" size={18} />
                    Документ
                  </h3>
                  <img
                    src={selectedRequest.document_photo_url}
                    alt="Document"
                    className="w-full rounded-lg border"
                  />
                </div>
              </div>

              {selectedRequest.comment && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Комментарий пользователя:</p>
                  <p className="text-sm">{selectedRequest.comment}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Комментарий администратора (необязательно)
                    </label>
                    <Textarea
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Укажите причину решения или дополнительные комментарии..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleDecision(selectedRequest.id, 'approve')}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Icon name="Check" size={18} className="mr-2" />
                      Одобрить верификацию
                    </Button>
                    <Button
                      onClick={() => handleDecision(selectedRequest.id, 'reject')}
                      disabled={loading}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Icon name="X" size={18} className="mr-2" />
                      Отклонить заявку
                    </Button>
                  </div>
                </>
              )}

              {selectedRequest.status !== 'pending' && (
                <div className={`p-4 rounded-lg ${
                  selectedRequest.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <p className="font-semibold mb-2">
                    Статус: {selectedRequest.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                  </p>
                  {selectedRequest.admin_comment && (
                    <p className="text-sm">Комментарий: {selectedRequest.admin_comment}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerification;