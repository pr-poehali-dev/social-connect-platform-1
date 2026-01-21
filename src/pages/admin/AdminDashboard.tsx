import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/1a9ecaa4-2882-4498-965a-c16eb32920ec';

interface DashboardStats {
  users: {
    total: number;
    vip: number;
    blocked: number;
    new_month: number;
  };
  content: {
    dating: number;
    ads: number;
    services: number;
    events: number;
  };
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setAdminData({ name: 'Developer', role: 'dev' });
    setStats({
      users: { total: 0, vip: 0, blocked: 0, new_month: 0 },
      content: { dating: 0, ads: 0, services: 0, events: 0 }
    });
    setLoading(false);
  }, [navigate]);

  const loadStats = async (token: string) => {
    setStats({
      users: { total: 0, vip: 0, blocked: 0, new_month: 0 },
      content: { dating: 0, ads: 0, services: 0, events: 0 }
    });
  };

  const handleLogout = () => {
    navigate('/');
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 via-purple-500 to-indigo-500 flex items-center justify-center">
                <Icon name="ShieldCheck" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Админ-панель ConnectHub</h1>
                <p className="text-sm text-white/70">{adminData?.name} ({adminData?.role})</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Icon name="LogOut" size={18} />
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-white/95 backdrop-blur border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="Users" size={18} className="text-blue-500" />
                Всего пользователей
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.users.total}</div>
              <p className="text-sm text-muted-foreground mt-1">+{stats.users.new_month} за месяц</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="Crown" size={18} className="text-yellow-500" />
                VIP пользователи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.users.vip}</div>
              <p className="text-sm text-muted-foreground mt-1">{((stats.users.vip / stats.users.total) * 100).toFixed(1)}% от всех</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="Ban" size={18} className="text-red-500" />
                Заблокированные
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.users.blocked}</div>
              <p className="text-sm text-muted-foreground mt-1">{((stats.users.blocked / stats.users.total) * 100).toFixed(1)}% от всех</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="Heart" size={18} className="text-pink-500" />
                Анкеты знакомств
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.content.dating}</div>
              <p className="text-sm text-muted-foreground mt-1">Активные профили</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/admin/users">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" size={24} />
                  Управление пользователями
                </CardTitle>
                <CardDescription className="text-white/80">
                  Блокировка, VIP-статус, история входов
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/sections">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Layout" size={24} />
                  Разделы сайта
                </CardTitle>
                <CardDescription className="text-white/80">
                  Управление знакомствами, объявлениями, услугами
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/filters">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Filter" size={24} />
                  Фильтры
                </CardTitle>
                <CardDescription className="text-white/80">
                  Настройка фильтров для разделов
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/logs">
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FileText" size={24} />
                  Логи действий
                </CardTitle>
                <CardDescription className="text-white/80">
                  История действий администраторов
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="BarChart3" size={24} />
                Контент
              </CardTitle>
              <CardDescription className="text-white/80">
                <div className="mt-2 space-y-1">
                  <div>Объявления: {stats.content.ads}</div>
                  <div>Услуги: {stats.content.services}</div>
                  <div>Мероприятия: {stats.content.events}</div>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;