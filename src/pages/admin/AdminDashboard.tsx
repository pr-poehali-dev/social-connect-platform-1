import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/1a9ecaa4-2882-4498-965a-c16eb32920ec';

interface PeriodStats {
  new_users: number;
  revenue: number;
  active_users: number;
  user_growth_percent: number;
  revenue_growth_percent: number;
  activity_growth_percent: number;
}

interface CityStats {
  city: string;
  new_users: number;
  revenue: number;
  active_users: number;
}

const AdminDashboard = () => {
  const [period, setPeriod] = useState<'today' | 'yesterday' | 'month' | 'year' | 'custom'>('today');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [periodStats, setPeriodStats] = useState<PeriodStats>({
    new_users: 0,
    revenue: 0,
    active_users: 0,
    user_growth_percent: 0,
    revenue_growth_percent: 0,
    activity_growth_percent: 0
  });
  const [citiesStats, setCitiesStats] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const savedAdminData = localStorage.getItem('admin_data');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    if (savedAdminData) {
      setAdminData(JSON.parse(savedAdminData));
    }
    
    loadPeriodStats();
  }, [navigate]);

  useEffect(() => {
    loadPeriodStats();
  }, [period, customDateFrom, customDateTo]);

  const loadPeriodStats = async () => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const params = new URLSearchParams({ action: 'dashboard_stats', period });
      if (period === 'custom' && customDateFrom && customDateTo) {
        params.append('date_from', customDateFrom);
        params.append('date_to', customDateTo);
      }

      const response = await fetch(`${ADMIN_API}?${params}`, {
        headers: { 'X-Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPeriodStats(data.stats || {
          new_users: 0,
          revenue: 0,
          active_users: 0,
          user_growth_percent: 0,
          revenue_growth_percent: 0,
          activity_growth_percent: 0
        });
        setCitiesStats(data.cities || []);
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить статистику',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
  };

  const getPeriodLabel = () => {
    switch(period) {
      case 'today': return 'Сегодня';
      case 'yesterday': return 'Вчера';
      case 'month': return 'За месяц';
      case 'year': return 'За год';
      case 'custom': return 'Выбранный период';
      default: return 'Период';
    }
  };

  if (loading) {
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
        <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="BarChart3" size={24} />
                Статистика площадки
              </div>
            </CardTitle>
            <div className="flex flex-wrap gap-4 mt-4">
              <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="yesterday">Вчера</SelectItem>
                  <SelectItem value="month">За месяц</SelectItem>
                  <SelectItem value="year">За год</SelectItem>
                  <SelectItem value="custom">Выбрать период</SelectItem>
                </SelectContent>
              </Select>
              
              {period === 'custom' && (
                <>
                  <Input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="w-40"
                    placeholder="С даты"
                  />
                  <Input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="w-40"
                    placeholder="По дату"
                  />
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">Общая статистика</TabsTrigger>
                <TabsTrigger value="cities">По городам</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Icon name="UserPlus" size={18} className="text-blue-500" />
                        Новые пользователи
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{periodStats.new_users}</div>
                      <p className={`text-sm mt-1 flex items-center gap-1 ${periodStats.user_growth_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <Icon name={periodStats.user_growth_percent >= 0 ? 'TrendingUp' : 'TrendingDown'} size={16} />
                        {periodStats.user_growth_percent >= 0 ? '+' : ''}{periodStats.user_growth_percent.toFixed(1)}% к предыдущему периоду
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Icon name="Wallet" size={18} className="text-green-500" />
                        Заработок площадки
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{formatCurrency(periodStats.revenue)}</div>
                      <p className={`text-sm mt-1 flex items-center gap-1 ${periodStats.revenue_growth_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <Icon name={periodStats.revenue_growth_percent >= 0 ? 'TrendingUp' : 'TrendingDown'} size={16} />
                        {periodStats.revenue_growth_percent >= 0 ? '+' : ''}{periodStats.revenue_growth_percent.toFixed(1)}% к предыдущему периоду
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Icon name="Activity" size={18} className="text-purple-500" />
                        Активные пользователи
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{periodStats.active_users}</div>
                      <p className={`text-sm mt-1 flex items-center gap-1 ${periodStats.activity_growth_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <Icon name={periodStats.activity_growth_percent >= 0 ? 'TrendingUp' : 'TrendingDown'} size={16} />
                        {periodStats.activity_growth_percent >= 0 ? '+' : ''}{periodStats.activity_growth_percent.toFixed(1)}% к предыдущему периоду
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="cities" className="mt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-muted rounded-lg font-semibold text-sm">
                    <div>Город</div>
                    <div className="text-center">Новые пользователи</div>
                    <div className="text-center">Заработок</div>
                    <div className="text-center">Активные</div>
                  </div>
                  {citiesStats.map((city) => (
                    <Card key={city.city} className="border">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-4 gap-4 items-center">
                          <div className="flex items-center gap-2">
                            <Icon name="MapPin" size={16} className="text-blue-500" />
                            <span className="font-medium">{city.city}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-2xl font-bold text-blue-600">{city.new_users}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-2xl font-bold text-green-600">{formatCurrency(city.revenue)}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-2xl font-bold text-purple-600">{city.active_users}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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

          <Link to="/admin/verification">
            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BadgeCheck" size={24} />
                  Верификация пользователей
                </CardTitle>
                <CardDescription className="text-white/80">
                  Обработка заявок на верификацию
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;