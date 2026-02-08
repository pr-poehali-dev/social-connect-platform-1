import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface Mentor {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
}

interface ReferralMentorCardProps {
  mentor: Mentor | null;
  onMentorSet: (mentor: Mentor) => void;
  apiUrl: string;
}

const ReferralMentorCard = ({ mentor, onMentorSet, apiUrl }: ReferralMentorCardProps) => {
  const { toast } = useToast();
  const [referrerCode, setReferrerCode] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [validatedReferrer, setValidatedReferrer] = useState<{ id: number; first_name: string | null; last_name: string | null } | null>(null);

  const validateReferrerCode = async () => {
    if (!referrerCode.trim()) {
      toast({ title: 'Ошибка', description: 'Введите код пригласителя', variant: 'destructive' });
      return;
    }

    setValidatingCode(true);
    const userId = localStorage.getItem('userId');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({
          action: 'validate',
          referral_code: referrerCode.trim().toUpperCase()
        })
      });

      const data = await response.json();

      if (data.valid && data.referrer) {
        setValidatedReferrer(data.referrer);
        toast({ 
          title: 'Код найден!', 
          description: 'Проверьте данные пригласителя и подтвердите' 
        });
      } else {
        toast({ 
          title: 'Неверный код', 
          description: 'Пользователь с таким кодом не найден', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось проверить код', 
        variant: 'destructive' 
      });
    } finally {
      setValidatingCode(false);
    }
  };

  const confirmReferrer = async () => {
    if (!validatedReferrer) return;

    const userId = localStorage.getItem('userId');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({
          action: 'set_referrer',
          referral_code: referrerCode.trim().toUpperCase()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onMentorSet({
          id: data.referrer.id,
          first_name: data.referrer.first_name,
          last_name: data.referrer.last_name,
          email: '',
          avatar_url: null
        });
        setValidatedReferrer(null);
        setReferrerCode('');
        toast({ 
          title: 'Успешно!', 
          description: 'Пригласитель установлен' 
        });
      } else {
        toast({ 
          title: 'Ошибка', 
          description: data.error || 'Не удалось установить пригласителя', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось установить пригласителя', 
        variant: 'destructive' 
      });
    }
  };

  if (mentor) {
    return (
      <Card className="mb-8 rounded-3xl border-2 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="UserCheck" size={24} className="text-emerald-500" />
            Ваш пригласитель
          </h2>
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mentor.avatar_url || undefined} />
              <AvatarFallback className="text-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                {mentor.first_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-lg font-semibold">
                {mentor.first_name || ''} {mentor.last_name || ''}
              </p>
              <p className="text-sm text-muted-foreground">{mentor.email}</p>
            </div>
            <Icon name="Star" size={24} className="text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 rounded-3xl border-2 border-dashed border-muted-foreground/30">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Icon name="UserPlus" size={24} />
          Код пригласителя
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Если вас пригласили в сервис, введите код пригласителя чтобы получить бонусы
        </p>
        
        {!validatedReferrer ? (
          <div className="flex gap-2">
            <Input
              value={referrerCode}
              onChange={(e) => setReferrerCode(e.target.value.toUpperCase())}
              placeholder="Введите код (например: ABC123)"
              className="font-mono rounded-2xl uppercase"
              maxLength={6}
            />
            <Button 
              onClick={validateReferrerCode}
              disabled={validatingCode || !referrerCode.trim()}
              className="rounded-2xl"
            >
              {validatingCode ? (
                <Icon name="Loader2" size={20} className="animate-spin" />
              ) : (
                'Проверить'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
              <p className="text-sm font-medium text-emerald-800 mb-2">
                Найден пригласитель:
              </p>
              <p className="text-lg font-bold text-emerald-900">
                {validatedReferrer.first_name} {validatedReferrer.last_name}
              </p>
              <p className="text-sm text-emerald-700 mt-2">
                Подтвердите, что это правильный человек
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={confirmReferrer}
                className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600"
              >
                Подтвердить
              </Button>
              <Button 
                onClick={() => {
                  setValidatedReferrer(null);
                  setReferrerCode('');
                }}
                variant="outline"
                className="flex-1 rounded-2xl"
              >
                Отмена
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralMentorCard;
