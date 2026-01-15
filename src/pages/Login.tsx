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

const VK_AUTH_URL = 'https://functions.poehali.dev/2494c44f-f6f6-40ff-871c-fb7e09d9702d';

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
                    <Button 
                      variant="outline" 
                      className="rounded-xl gap-2"
                      disabled
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.595 17.508c-.588.535-1.446.934-2.595.934-2.142 0-3.878-1.736-3.878-3.878s1.736-3.878 3.878-3.878c1.149 0 2.007.399 2.595.934l-1.052 1.052c-.358-.289-.804-.442-1.295-.442-1.115 0-2.02.905-2.02 2.02s.905 2.02 2.02 2.02c1.29 0 1.773-.925 1.848-1.402h-1.848v-1.362h3.233c.03.174.047.363.047.567 0 1.954-1.308 3.343-3.28 3.343z"/>
                      </svg>
                      Google
                    </Button>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl gap-2"
                    disabled
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.764 15.318c-.736 1.202-2.135 1.681-3.764 1.681-2.488 0-4.5-2.012-4.5-4.5S9.512 7.999 12 7.999c1.372 0 2.517.577 3.397 1.457l-1.377 1.378c-.466-.466-1.165-.833-2.02-.833-1.74 0-3.146 1.421-3.146 3.146s1.406 3.146 3.146 3.146c1.386 0 2.297-.705 2.638-1.646H12v-1.854h4.764c.058.318.09.652.09.99 0 2.577-1.727 4.681-4.854 4.681z"/>
                    </svg>
                    Яндекс ID
                  </Button>
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