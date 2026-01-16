import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
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
import { GoogleLoginButton } from '@/components/extensions/google-auth/GoogleLoginButton';
import { useGoogleAuth } from '@/components/extensions/google-auth/useGoogleAuth';

const VK_AUTH_URL = 'https://functions.poehali.dev/2494c44f-f6f6-40ff-871c-fb7e09d9702d';
const YANDEX_AUTH_URL = 'https://functions.poehali.dev/635fdfd0-fce3-46f9-a566-18d196e6e486';
const GOOGLE_AUTH_URL = 'https://functions.poehali.dev/0c89453c-e2bd-44b7-b54d-2e0f885da946';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const googleAuth = useGoogleAuth({
    apiUrls: {
      authUrl: `${GOOGLE_AUTH_URL}?action=auth-url`,
      callback: `${GOOGLE_AUTH_URL}?action=callback`,
      refresh: `${GOOGLE_AUTH_URL}?action=refresh`,
      logout: `${GOOGLE_AUTH_URL}?action=logout`,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/3aed2af4-8257-4d82-b13a-3ffe059d8854?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        toast({ title: 'Успешный вход!', description: 'Перенаправляем в профиль...' });
        setTimeout(() => navigate('/profile'), 1000);
      } else {
        toast({ title: 'Ошибка входа', description: data.error || 'Проверьте данные', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="rounded-3xl border-2 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                  <Icon name="LogIn" size={36} className="text-white" />
                </div>
                <CardTitle className="text-3xl">Вход в аккаунт</CardTitle>
                <CardDescription className="text-base">
                  Добро пожаловать обратно!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl text-base py-6"
                    disabled={loading}
                  >
                    {loading ? 'Вход...' : 'Войти'}
                  </Button>
                </form>

                <div className="mt-6 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">
                        Или войти через
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
                    <GoogleLoginButton 
                      onClick={googleAuth.login} 
                      isLoading={googleAuth.isLoading}
                      buttonText="Google"
                      className="rounded-xl"
                    />
                  </div>

                  <YandexLoginButton 
                    onClick={yandexAuth.login} 
                    isLoading={yandexAuth.isLoading}
                    buttonText="Яндекс ID"
                    className="rounded-xl w-full"
                  />
                </div>

                <div className="mt-6 text-center space-y-3">
                  <Link to="/register" className="text-sm text-primary hover:underline block">
                    Нет аккаунта? Зарегистрируйтесь
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;