import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/1a9ecaa4-2882-4498-965a-c16eb32920ec';

interface User {
  id: number;
  email: string;
  name: string | null;
  nickname: string | null;
  is_vip: boolean;
  vip_expires_at: string | null;
  is_blocked: boolean;
  block_reason: string | null;
  is_verified: boolean;
  created_at: string;
  last_login_at: string | null;
}

interface UserDetails extends User {
  login_history?: Array<{
    ip: string;
    user_agent: string;
    login_at: string;
    success: boolean;
  }>;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterVip, setFilterVip] = useState<string>('all');
  const [filterBlocked, setFilterBlocked] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showVipDialog, setShowVipDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [vipDays, setVipDays] = useState('30');
  const [messageText, setMessageText] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers('dev-token');
  }, [page, search, filterVip, filterBlocked, navigate]);

  const loadUsers = async (token: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'get_users',
        page: page.toString(),
        limit: '50'
      });
      
      if (search) params.append('search', search);
      if (filterVip !== 'all') params.append('vip', filterVip);
      if (filterBlocked !== 'all') params.append('blocked', filterBlocked);

      const response = await fetch(`${ADMIN_API}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить пользователей', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId: number) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=get_user_details&user_id=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser({ ...data.user, login_history: data.login_history });
        setShowDetails(true);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить детали', variant: 'destructive' });
    }
  };

  const blockUser = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token || !selectedUser) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=block_user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'block_user',
          user_id: selectedUser.id,
          reason: blockReason
        })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Пользователь заблокирован' });
        setShowBlockDialog(false);
        setBlockReason('');
        loadUsers(token);
        setShowDetails(false);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось заблокировать', variant: 'destructive' });
    }
  };

  const unblockUser = async (userId: number) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=unblock_user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'unblock_user', user_id: userId })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Пользователь разблокирован' });
        loadUsers(token);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось разблокировать', variant: 'destructive' });
    }
  };

  const setVip = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token || !selectedUser) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=set_vip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'set_vip',
          user_id: selectedUser.id,
          days: parseInt(vipDays)
        })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'VIP статус установлен' });
        setShowVipDialog(false);
        loadUsers(token);
        setShowDetails(false);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось установить VIP', variant: 'destructive' });
    }
  };

  const removeVip = async (userId: number) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=remove_vip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'remove_vip', user_id: userId })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'VIP статус убран' });
        loadUsers(token);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось убрать VIP', variant: 'destructive' });
    }
  };

  const sendMessage = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token || !selectedUser || !messageText.trim()) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=send_message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'send_message',
          user_id: selectedUser.id,
          message: messageText
        })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Сообщение отправлено пользователю' });
        setShowMessageDialog(false);
        setMessageText('');
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось отправить сообщение', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка подключения', variant: 'destructive' });
    }
  };

  const verifyUser = async (userId: number) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=verify_user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'verify_user', user_id: userId })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Пользователь верифицирован' });
        loadUsers(token);
        if (selectedUser?.id === userId) {
          loadUserDetails(userId);
        }
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось верифицировать', variant: 'destructive' });
    }
  };

  const unverifyUser = async (userId: number) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=unverify_user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'unverify_user', user_id: userId })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Верификация убрана' });
        loadUsers(token);
        if (selectedUser?.id === userId) {
          loadUserDetails(userId);
        }
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось убрать верификацию', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <Icon name="ArrowLeft" size={24} className="text-white" />
              <h1 className="text-xl font-bold text-white">Управление пользователями</h1>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Card className="bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle>Пользователи ({total})</CardTitle>
            <div className="flex gap-4 mt-4">
              <Input
                placeholder="Поиск по email, имени..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterVip} onValueChange={setFilterVip}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="true">Только VIP</SelectItem>
                  <SelectItem value="false">Не VIP</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterBlocked} onValueChange={setFilterBlocked}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="true">Заблокированные</SelectItem>
                  <SelectItem value="false">Активные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Загрузка...</div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.email}</span>
                        {user.is_vip && <Badge className="bg-yellow-500">VIP</Badge>}
                        {user.is_verified && <Badge className="bg-blue-500">Верифицирован</Badge>}
                        {user.is_blocked && <Badge variant="destructive">Заблокирован</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.name || user.nickname || 'Без имени'} • ID: {user.id}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => loadUserDetails(user.id)} title="Просмотр деталей">
                        <Icon name="Eye" size={16} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedUser(user); setShowMessageDialog(true); }} title="Отправить сообщение">
                        <Icon name="Mail" size={16} />
                      </Button>
                      {user.is_verified ? (
                        <Button size="sm" variant="outline" onClick={() => unverifyUser(user.id)} title="Убрать верификацию">
                          <Icon name="BadgeCheck" size={16} className="text-blue-500" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => verifyUser(user.id)} title="Верифицировать">
                          <Icon name="BadgeCheck" size={16} className="text-gray-400" />
                        </Button>
                      )}
                      {user.is_blocked ? (
                        <Button size="sm" variant="outline" onClick={() => unblockUser(user.id)} title="Разблокировать">
                          <Icon name="Unlock" size={16} />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setSelectedUser(user); setShowBlockDialog(true); }} title="Заблокировать">
                          <Icon name="Ban" size={16} />
                        </Button>
                      )}
                      {user.is_vip ? (
                        <Button size="sm" variant="outline" onClick={() => removeVip(user.id)} title="Убрать VIP">
                          <Icon name="Crown" size={16} className="text-yellow-500" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setSelectedUser(user); setShowVipDialog(true); }} title="Установить VIP">
                          <Icon name="Crown" size={16} />
                        </Button>
                      )}
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
              <Button disabled={users.length < 50} onClick={() => setPage(page + 1)}>
                Вперёд
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детали пользователя</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <strong>Email:</strong> {selectedUser.email}
              </div>
              <div>
                <strong>Имя:</strong> {selectedUser.name || 'Не указано'}
              </div>
              <div>
                <strong>Статус:</strong>{' '}
                {selectedUser.is_vip && <Badge className="bg-yellow-500 mr-2">VIP</Badge>}
                {selectedUser.is_verified && <Badge className="bg-blue-500 mr-2">Верифицирован</Badge>}
                {selectedUser.is_blocked && <Badge variant="destructive">Заблокирован</Badge>}
              </div>
              {selectedUser.block_reason && (
                <div>
                  <strong>Причина блокировки:</strong> {selectedUser.block_reason}
                </div>
              )}
              <div>
                <strong>История входов:</strong>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {selectedUser.login_history?.map((entry, idx) => (
                    <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                      <div><strong>IP:</strong> {entry.ip}</div>
                      <div><strong>Время:</strong> {new Date(entry.login_at).toLocaleString('ru-RU')}</div>
                      <div className="text-xs text-gray-500 truncate">{entry.user_agent}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заблокировать пользователя</DialogTitle>
            <DialogDescription>Укажите причину блокировки</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Причина</Label>
            <Textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Нарушение правил..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={blockUser}>
              Заблокировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showVipDialog} onOpenChange={setShowVipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Установить VIP статус</DialogTitle>
            <DialogDescription>Выберите срок действия VIP</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Количество дней</Label>
            <Input
              type="number"
              value={vipDays}
              onChange={(e) => setVipDays(e.target.value)}
              min="1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVipDialog(false)}>
              Отмена
            </Button>
            <Button onClick={setVip}>
              Установить VIP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отправить сообщение пользователю</DialogTitle>
            <DialogDescription>
              {selectedUser && `Отправить сообщение пользователю ${selectedUser.email}`}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Текст сообщения</Label>
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Введите текст сообщения..."
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowMessageDialog(false); setMessageText(''); }}>
              Отмена
            </Button>
            <Button onClick={sendMessage} disabled={!messageText.trim()}>
              <Icon name="Send" size={16} className="mr-2" />
              Отправить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;