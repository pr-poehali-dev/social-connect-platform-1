import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

const VerificationRequest = () => {
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadExistingRequest = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/de844d47-7d8b-4431-8204-783aa2013212', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data) {
            setExistingRequest(data);
          }
        }
      } catch (error) {
        console.error('Failed to load verification request:', error);
      }
    };

    loadExistingRequest();
  }, [navigate]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (value: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Размер файла не должен превышать 10 МБ',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selfiePreview || !documentPreview) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо загрузить оба фото',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('https://functions.poehali.dev/de844d47-7d8b-4431-8204-783aa2013212', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selfie_photo: selfiePreview,
          document_photo: documentPreview,
          comment: comment
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Заявка на верификацию отправлена',
        });
        navigate('/profile');
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.error || 'Не удалось отправить заявку',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to submit verification:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (existingRequest) {
    const getStatusText = (status: string) => {
      switch (status) {
        case 'pending': return 'На рассмотрении';
        case 'approved': return 'Одобрена';
        case 'rejected': return 'Отклонена';
        default: return status;
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'pending': return 'Clock';
        case 'approved': return 'CheckCircle';
        case 'rejected': return 'XCircle';
        default: return 'Info';
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 pt-20 pb-8 max-w-2xl">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Icon name={getStatusIcon(existingRequest.status)} size={32} className="text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Статус верификации</h1>
                <p className="text-muted-foreground">{getStatusText(existingRequest.status)}</p>
              </div>
            </div>

            {existingRequest.admin_comment && (
              <Alert className="mb-4">
                <Icon name="MessageSquare" size={16} />
                <AlertTitle>Комментарий модератора</AlertTitle>
                <AlertDescription>{existingRequest.admin_comment}</AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Отправлено: {new Date(existingRequest.created_at).toLocaleString('ru-RU')}</p>
              {existingRequest.reviewed_at && (
                <p>Рассмотрено: {new Date(existingRequest.reviewed_at).toLocaleString('ru-RU')}</p>
              )}
            </div>

            <Button onClick={() => navigate('/profile')} className="mt-6 w-full">
              Вернуться в профиль
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-20 pb-8 max-w-2xl">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Icon name="ShieldCheck" size={32} className="text-primary" />
            <h1 className="text-2xl font-bold">Верификация профиля</h1>
          </div>

          <Alert className="mb-6">
            <Icon name="Info" size={16} />
            <AlertTitle>Важная информация</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>• Загруженные фото будут автоматически удалены после прохождения верификации</p>
              <p>• После успешной верификации нельзя будет изменить имя, фамилию и дату рождения</p>
              <p>• Все данные проверяются модератором вручную</p>
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-3 block">
                1. {isMobile ? 'Селфи' : 'Селфи на фоне экрана с вашим профилем'}
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                {isMobile 
                  ? 'Сделайте селфи с вашим лицом' 
                  : 'Сделайте фото себя на фоне экрана компьютера, где открыт ваш профиль с аватаркой'}
              </p>
              
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                capture={isMobile ? 'user' : undefined}
                onChange={(e) => handleFileChange(e, setSelfiePreview)}
                className="hidden"
              />
              
              {selfiePreview ? (
                <div className="relative">
                  <img src={selfiePreview} alt="Selfie preview" className="w-full rounded-lg border-2 border-dashed border-gray-300" />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setSelfiePreview(null)}
                    className="absolute top-2 right-2"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => selfieInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="Camera" size={32} />
                    <span>{isMobile ? 'Сделать селфи' : 'Загрузить фото'}</span>
                  </div>
                </Button>
              )}
            </div>

            <div>
              <Label className="text-lg font-semibold mb-3 block">
                2. Фото с документом
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Сделайте фото с паспортом (серию и номер можно прикрыть пальцем или стикером)
              </p>
              
              <input
                ref={documentInputRef}
                type="file"
                accept="image/*"
                capture={isMobile ? 'environment' : undefined}
                onChange={(e) => handleFileChange(e, setDocumentPreview)}
                className="hidden"
              />
              
              {documentPreview ? (
                <div className="relative">
                  <img src={documentPreview} alt="Document preview" className="w-full rounded-lg border-2 border-dashed border-gray-300" />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDocumentPreview(null)}
                    className="absolute top-2 right-2"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => documentInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="FileText" size={32} />
                    <span>Загрузить фото с документом</span>
                  </div>
                </Button>
              )}
            </div>

            <div>
              <Label htmlFor="comment">Комментарий (необязательно)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Дополнительная информация для модератора..."
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !selfiePreview || !documentPreview}
                className="flex-1"
              >
                {loading ? 'Отправка...' : 'Отправить заявку'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerificationRequest;
