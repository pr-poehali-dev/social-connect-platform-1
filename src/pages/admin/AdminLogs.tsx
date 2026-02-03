import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/1a9ecaa4-2882-4498-965a-c16eb32920ec';

interface Log {
  id: number;
  admin_id: number;
  admin_email: string;
  action: string;
  target_type: string | null;
  target_id: number | null;
  details: any;
  ip: string;
  created_at: string;
}

const AdminLogs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadLogs(token);
  }, [page, navigate]);

  const loadLogs = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${ADMIN_API}?action=get_logs&page=${page}&limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить логи', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'login':
        return <Badge className="bg-green-500">Вход</Badge>;
      case 'block_user':
        return <Badge variant="destructive">Блокировка</Badge>;
      case 'unblock_user':
        return <Badge className="bg-blue-500">Разблокировка</Badge>;
      case 'set_vip':
        return <Badge className="bg-yellow-500">VIP+</Badge>;
      case 'remove_vip':
        return <Badge variant="outline">VIP-</Badge>;
      case 'update_section':
        return <Badge className="bg-purple-500">Раздел</Badge>;
      case 'create_filter':
        return <Badge className="bg-indigo-500">Фильтр+</Badge>;
      case 'update_filter':
        return <Badge className="bg-indigo-400">Фильтр</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <Icon name="ArrowLeft" size={24} className="text-white" />
              <h1 className="text-xl font-bold text-white">Логи действий администраторов</h1>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur">
          <CardHeader>
            <CardTitle>История действий</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Загрузка...</div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getActionBadge(log.action)}
                          <span className="text-sm font-medium">{log.admin_email}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {log.target_type && (
                            <span>
                              {log.target_type} #{log.target_id}
                            </span>
                          )}
                          {log.details && (
                            <span className="ml-2">
                              {JSON.stringify(log.details)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          IP: {log.ip} • {new Date(log.created_at).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-2 mt-6">
              <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Назад
              </Button>
              <span className="py-2 px-4">Страница {page}</span>
              <Button disabled={logs.length < 50} onClick={() => setPage(page + 1)}>
                Вперёд
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminLogs;