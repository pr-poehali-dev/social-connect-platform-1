import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ADMIN_API = 'https://functions.poehali.dev/1a9ecaa4-2882-4498-965a-c16eb32920ec';
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 минут

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      navigate('/admin/dashboard');
    }

    const savedAttempts = localStorage.getItem('admin_login_attempts');
    const savedLockout = localStorage.getItem('admin_lockout_until');
    
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
    
    if (savedLockout) {
      const lockoutTime = parseInt(savedLockout);
      if (lockoutTime > Date.now()) {
        setLockedUntil(lockoutTime);
      } else {
        localStorage.removeItem('admin_lockout_until');
        localStorage.removeItem('admin_login_attempts');
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (lockedUntil) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
        setRemainingTime(remaining);
        
        if (remaining === 0) {
          setLockedUntil(null);
          setAttempts(0);
          localStorage.removeItem('admin_lockout_until');
          localStorage.removeItem('admin_login_attempts');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockedUntil && Date.now() < lockedUntil) {
      toast({
        title: 'Доступ заблокирован',
        description: `Слишком много попыток входа. Попробуйте через ${Math.ceil(remainingTime / 60)} мин.`,
        variant: 'destructive',
      });
      return;
    }

    if (!email || !password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${ADMIN_API}?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem('admin_token', data.access_token);
        localStorage.setItem('admin_data', JSON.stringify(data.admin));
        localStorage.removeItem('admin_login_attempts');
        localStorage.removeItem('admin_lockout_until');
        
        toast({
          title: 'Вход выполнен',
          description: `Добро пожаловать, ${data.admin.name}!`,
        });
        
        navigate('/admin/dashboard');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem('admin_login_attempts', newAttempts.toString());

        if (newAttempts >= MAX_ATTEMPTS) {
          const lockTime = Date.now() + LOCKOUT_TIME;
          setLockedUntil(lockTime);
          localStorage.setItem('admin_lockout_until', lockTime.toString());
          
          toast({
            title: 'Доступ заблокирован',
            description: `Слишком много неудачных попыток. Доступ заблокирован на 15 минут.`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Ошибка входа',
            description: data.error || `Неверный email или пароль. Осталось попыток: ${MAX_ATTEMPTS - newAttempts}`,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Ошибка подключения',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl border-2 shadow-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-red-500 via-purple-500 to-indigo-500 flex items-center justify-center">
            <Icon name="ShieldCheck" size={36} className="text-white" />
          </div>
          <CardTitle className="text-3xl">Админ-панель ConnectHub</CardTitle>
          <CardDescription className="text-base">
            Вход для администраторов
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLocked && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <Icon name="Lock" size={18} className="text-red-600" />
              <AlertDescription className="text-red-900">
                Доступ заблокирован на {formatTime(remainingTime)} из-за множественных неудачных попыток входа
              </AlertDescription>
            </Alert>
          )}

          {!isLocked && attempts > 0 && attempts < MAX_ATTEMPTS && (
            <Alert className="mb-6 bg-yellow-50 border-yellow-200">
              <Icon name="AlertTriangle" size={18} className="text-yellow-600" />
              <AlertDescription className="text-yellow-900">
                Осталось попыток входа: {MAX_ATTEMPTS - attempts} из {MAX_ATTEMPTS}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Логин</Label>
              <Input
                id="email"
                type="text"
                placeholder="admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLocked}
                className="rounded-xl"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLocked}
                  className="rounded-xl pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLocked}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl text-base py-6 bg-gradient-to-r from-red-500 via-purple-500 to-indigo-500 hover:from-red-600 hover:via-purple-600 hover:to-indigo-600"
              disabled={loading || isLocked}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Вход...
                </>
              ) : isLocked ? (
                <>
                  <Icon name="Lock" size={18} className="mr-2" />
                  Заблокировано
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти в панель
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
            <p className="flex items-center justify-center gap-2">
              <Icon name="Shield" size={16} />
              Защищенное соединение
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;