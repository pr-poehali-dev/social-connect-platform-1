import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AUTH_URL = 'https://functions.poehali.dev/38e915e0-7fce-42fe-81a2-0cf20e689f42';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Card className="max-w-md mx-auto rounded-3xl">
          <CardContent className="p-8 text-center space-y-4">
            <Icon name="AlertTriangle" size={48} className="mx-auto text-red-500" />
            <p>Ссылка для сброса пароля недействительна</p>
            <Link to="/forgot-password">
              <Button className="rounded-xl">Запросить новую ссылку</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({ title: 'Ошибка', description: 'Пароль должен быть не менее 6 символов', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Ошибка', description: 'Пароли не совпадают', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${AUTH_URL}?action=reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось сменить пароль', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/bucket/0b808ff7-ad9e-4059-be8d-f3f668f1ca48.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/20" />
      <main className="relative z-10 min-h-screen flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="rounded-3xl border-0 shadow-none bg-transparent">
              <CardHeader className="text-center space-y-2 pb-4">
                <CardTitle className="text-2xl text-white">Новый пароль</CardTitle>
              </CardHeader>
              <CardContent>
                {success ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                      <Icon name="CheckCircle" size={32} className="text-green-400" />
                    </div>
                    <p className="text-white">Пароль успешно изменён!</p>
                    <p className="text-white/60 text-sm">Перенаправляем на страницу входа...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-white">Новый пароль</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Минимум 6 символов"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-white">Повторите пароль</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Повторите пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-xl"
                      disabled={loading}
                    >
                      {loading ? 'Сохранение...' : 'Сохранить пароль'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
