import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AUTH_URL = 'https://functions.poehali.dev/38e915e0-7fce-42fe-81a2-0cf20e689f42';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${AUTH_URL}?action=forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось отправить письмо', variant: 'destructive' });
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
                <CardTitle className="text-2xl text-white">Восстановление пароля</CardTitle>
              </CardHeader>
              <CardContent>
                {sent ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                      <Icon name="MailCheck" size={32} className="text-green-400" />
                    </div>
                    <p className="text-white">
                      Письмо со ссылкой для сброса пароля отправлено на <strong>{email}</strong>
                    </p>
                    <p className="text-white/60 text-sm">
                      Проверьте папку «Спам», если письмо не пришло
                    </p>
                    <Link to="/login">
                      <Button variant="outline" className="rounded-xl mt-4">
                        Вернуться ко входу
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-white/70 text-sm">
                      Укажите email, и мы отправим ссылку для сброса пароля
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-white">Email</Label>
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

                    <Button
                      type="submit"
                      className="w-full rounded-xl"
                      disabled={loading}
                    >
                      {loading ? 'Отправка...' : 'Отправить ссылку'}
                    </Button>

                    <div className="text-center">
                      <Link to="/login" className="text-sm text-white/70 hover:text-white hover:underline">
                        Вернуться ко входу
                      </Link>
                    </div>
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

export default ForgotPassword;
