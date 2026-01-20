import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/1a9ecaa4-2882-4498-965a-c16eb32920ec';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({ 
      title: 'Доступ ограничен', 
      description: 'Админ-панель находится в разработке', 
      variant: 'destructive' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl border-2 shadow-2xl bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-red-500 via-purple-500 to-indigo-500 flex items-center justify-center">
            <Icon name="ShieldCheck" size={36} className="text-white" />
          </div>
          <CardTitle className="text-3xl">Админ-панель</CardTitle>
          <CardDescription className="text-base">
            Введите данные для входа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@connecthub.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
                autoComplete="username"
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
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl text-base py-6 bg-gradient-to-r from-red-500 via-purple-500 to-indigo-500 hover:from-red-600 hover:via-purple-600 hover:to-indigo-600"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти в админ-панель'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;