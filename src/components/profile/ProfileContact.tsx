import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ProfileContactProps {
  user: any;
  editMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
}

const ProfileContact = ({ user, editMode, formData, setFormData }: ProfileContactProps) => {
  const { toast } = useToast();
  const [verificationStep, setVerificationStep] = useState<'idle' | 'code-sent' | 'verified'>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendVerificationCode = async () => {
    if (!formData.phone) {
      toast({ title: 'Ошибка', description: 'Введите номер телефона', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('https://functions.poehali.dev/15c075ad-8ca3-41cb-aa33-d9372154fb7c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'send', phone: formData.phone })
      });

      if (response.ok) {
        setVerificationStep('code-sent');
        toast({ title: 'Код отправлен', description: 'Проверьте SMS на вашем телефоне' });
      } else {
        const data = await response.json().catch(() => ({ error: 'Ошибка сервера' }));
        if (response.status === 401) {
          toast({ title: 'Ошибка', description: 'Сессия истекла, обновите страницу', variant: 'destructive' });
        } else {
          toast({ title: 'Ошибка', description: data.error || 'Не удалось отправить код', variant: 'destructive' });
        }
      }
    } catch (error) {
      console.error('Send verification error:', error);
      toast({ title: 'Ошибка', description: 'Проверьте подключение к интернету', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 4) {
      toast({ title: 'Ошибка', description: 'Введите 4-значный код', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('https://functions.poehali.dev/15c075ad-8ca3-41cb-aa33-d9372154fb7c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'verify', phone: formData.phone, code: verificationCode })
      });

      if (response.ok) {
        setVerificationStep('verified');
        toast({ title: 'Успех', description: 'Телефон подтверждён!' });
      } else {
        const data = await response.json().catch(() => ({ error: 'Ошибка сервера' }));
        if (response.status === 401) {
          toast({ title: 'Ошибка', description: 'Сессия истекла, обновите страницу', variant: 'destructive' });
        } else {
          toast({ title: 'Ошибка', description: data.error || 'Неверный код', variant: 'destructive' });
        }
      }
    } catch (error) {
      console.error('Verify code error:', error);
      toast({ title: 'Ошибка', description: 'Проверьте подключение к интернету', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-3">Контактная информация</h3>
      {editMode ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Icon name="Phone" size={16} className="inline mr-2" />
              Телефон
              {user.phone_verified && (
                <span className="ml-2 text-xs text-green-600 font-medium">
                  <Icon name="CheckCircle" size={14} className="inline" /> Подтверждён
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (___) ___-__-__"
                className="flex-1 px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={verificationStep === 'verified'}
              />
              {!user.phone_verified && verificationStep === 'idle' && (
                <Button
                  onClick={sendVerificationCode}
                  disabled={isLoading || !formData.phone}
                  className="rounded-xl"
                >
                  Подтвердить
                </Button>
              )}
            </div>
            {verificationStep === 'code-sent' && (
              <div className="mt-3 p-4 bg-muted rounded-xl">
                <p className="text-sm mb-2">Введите код из SMS:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="____"
                    maxLength={4}
                    className="flex-1 px-4 py-2 border border-input rounded-xl text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button
                    onClick={verifyCode}
                    disabled={isLoading || verificationCode.length !== 4}
                    className="rounded-xl"
                  >
                    Проверить
                  </Button>
                </div>
                <button
                  onClick={sendVerificationCode}
                  disabled={isLoading}
                  className="text-xs text-muted-foreground hover:text-foreground mt-2"
                >
                  Отправить код повторно
                </button>
              </div>
            )}
            {verificationStep === 'verified' && (
              <p className="text-xs text-green-600 mt-1">
                <Icon name="CheckCircle" size={14} className="inline" /> Телефон успешно подтверждён
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <Icon name="Send" size={16} className="inline mr-2" />
              Telegram
            </label>
            <input
              type="text"
              value={formData.telegram || ''}
              onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              placeholder="@username"
              className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <Icon name="Instagram" size={16} className="inline mr-2" />
              Instagram
            </label>
            <input
              type="text"
              value={formData.instagram || ''}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="@username"
              className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <Icon name="Mail" size={16} className="inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full px-4 py-3 border border-input rounded-xl bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">Email нельзя изменить</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {user.phone && (
            <div className="flex items-center gap-2">
              <Icon name="Phone" size={18} className="text-muted-foreground" />
              <span className="text-sm">{user.phone}</span>
              {user.phone_verified && (
                <Icon name="CheckCircle" size={16} className="text-green-600" />
              )}
            </div>
          )}
          {user.telegram && (
            <div className="flex items-center gap-2">
              <Icon name="Send" size={18} className="text-muted-foreground" />
              <span className="text-sm">{user.telegram}</span>
            </div>
          )}
          {user.instagram && (
            <div className="flex items-center gap-2">
              <Icon name="Instagram" size={18} className="text-muted-foreground" />
              <span className="text-sm">{user.instagram}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Icon name="Mail" size={18} className="text-muted-foreground" />
            <span className="text-sm">{user.email}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileContact;