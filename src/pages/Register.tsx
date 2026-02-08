import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { VkLoginButton } from '@/components/extensions/vk-auth/VkLoginButton';
import { useVkAuth } from '@/components/extensions/vk-auth/useVkAuth';
import { YandexLoginButton } from '@/components/extensions/yandex-auth/YandexLoginButton';
import { useYandexAuth } from '@/components/extensions/yandex-auth/useYandexAuth';


const VK_AUTH_URL = 'https://functions.poehali.dev/2494c44f-f6f6-40ff-871c-fb7e09d9702d';
const YANDEX_AUTH_URL = 'https://functions.poehali.dev/635fdfd0-fce3-46f9-a566-18d196e6e486';


const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams<{ code?: string }>();

  useEffect(() => {
    // Устанавливаем реферальный код из URL параметров
    if (params.code) {
      setReferralCode(params.code.toUpperCase());
    }
  }, [params]);

  const vkAuth = useVkAuth({
    apiUrls: {
      authUrl: `${VK_AUTH_URL}?action=auth-url`,
      callback: `${VK_AUTH_URL}?action=callback`,
      refresh: `${VK_AUTH_URL}?action=refresh`,
      logout: `${VK_AUTH_URL}?action=logout`,
    },
  });

  const yandexAuth = useYandexAuth({
    apiUrls: {
      authUrl: `${YANDEX_AUTH_URL}?action=auth-url`,
      callback: `${YANDEX_AUTH_URL}?action=callback`,
      refresh: `${YANDEX_AUTH_URL}?action=refresh`,
      logout: `${YANDEX_AUTH_URL}?action=logout`,
    },
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Ошибка', description: 'Пароли не совпадают', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/38e915e0-7fce-42fe-81a2-0cf20e689f42?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, referral_code: referralCode })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.email_verification_required) {
          setUserId(data.user_id);
          setNeedsVerification(true);
          toast({ title: 'Код отправлен!', description: 'Проверьте вашу почту' });
        } else {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userId', data.user.id);
          toast({ title: 'Регистрация успешна!', description: 'Перенаправляем в профиль...' });
          setTimeout(() => navigate('/profile'), 1000);
        }
      } else {
        toast({ title: 'Ошибка регистрации', description: data.error || 'Попробуйте снова', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/3aed2af4-8257-4d82-b13a-3ffe059d8854?action=verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, code: verificationCode })
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Email подтверждён!', description: 'Теперь можете войти в аккаунт' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Неверный код', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <main className="pt-12 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="rounded-3xl border-2 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <img 
                  src="https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/bucket/214c5eeb-fddf-4e50-86e9-baf072a385d5.png" 
                  alt="LOVE iS" 
                  className="h-20 mx-auto"
                />
                <CardTitle className="text-3xl">Регистрация</CardTitle>
                <CardDescription className="text-base">
                  Создайте аккаунт за минуту
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!needsVerification ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Имя</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Ваше имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Пароль</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="rounded-xl pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} className="text-muted-foreground" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Повторите пароль</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="rounded-xl pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={18} className="text-muted-foreground" />
                        </Button>
                      </div>
                    </div>

                    {referralCode && (
                      <div className="space-y-2">
                        <Label htmlFor="referralCode">Реферальный код</Label>
                        <Input
                          id="referralCode"
                          type="text"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          placeholder="Введите код (если есть)"
                          maxLength={6}
                          className="rounded-xl font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          Код из реферальной ссылки (необязательно)
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full rounded-xl text-base py-6"
                      disabled={loading}
                    >
                      {loading ? 'Регистрация...' : 'Создать аккаунт'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-6">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon name="Mail" size={32} className="text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Проверьте почту</h3>
                      <p className="text-sm text-muted-foreground">
                        Мы отправили 6-значный код на<br />
                        <span className="font-medium text-foreground">{email}</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">Код подтверждения</Label>
                      <Input
                        id="verificationCode"
                        type="text"
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        maxLength={6}
                        className="rounded-xl text-center text-2xl tracking-widest"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-xl text-base py-6"
                      disabled={loading || verificationCode.length !== 6}
                    >
                      {loading ? 'Проверка...' : 'Подтвердить код'}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full rounded-xl"
                      onClick={() => setNeedsVerification(false)}
                    >
                      Вернуться назад
                    </Button>
                  </form>
                )}

                {!needsVerification && (
                  <>
                    <div className="mt-6 space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-muted-foreground">
                            Или зарегистрироваться через
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <VkLoginButton 
                          onClick={vkAuth.login} 
                          isLoading={vkAuth.isLoading}
                          buttonText="VK"
                          className="rounded-xl"
                        />

                        <YandexLoginButton 
                          onClick={yandexAuth.login} 
                          isLoading={yandexAuth.isLoading}
                          buttonText="Яндекс"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <Link to="/login" className="text-sm text-primary hover:underline">
                        Уже есть аккаунт? Войдите
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;