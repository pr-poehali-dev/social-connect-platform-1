import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import UserFilters from './components/UserFilters';
import UserList from './components/UserList';
import UserDetailsDialog from './components/UserDetailsDialog';
import UserActionDialogs from './components/UserActionDialogs';

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
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showVipDialog, setShowVipDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [vipDays, setVipDays] = useState('30');
  const [messageText, setMessageText] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token') || 'dev-token';
    loadUsers(token);
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
        headers: { 'X-Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Loaded users:', data);
        setUsers(data.users || []);
        setTotal(data.total || 0);
      } else {
        console.error('Response not ok:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Load users error:', error);
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
        headers: { 'X-Authorization': `Bearer ${token}` }
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
          'X-Authorization': `Bearer ${token}`,
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

  const banUser = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token || !selectedUser) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=ban_user`, {
        method: 'POST',
        headers: {
          'X-Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'ban_user',
          user_id: selectedUser.id,
          reason: banReason || 'Нарушение правил'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({ 
          title: 'Успешно', 
          description: `Пользователь забанен на 24 часа (бан #${data.ban_count})` 
        });
        setShowBanDialog(false);
        setBanReason('');
        loadUsers(token);
        setShowDetails(false);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось забанить', variant: 'destructive' });
    }
  };

  const unblockUser = async (userId: number) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=unblock_user`, {
        method: 'POST',
        headers: {
          'X-Authorization': `Bearer ${token}`,
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
    if (!token || !selectedUser) {
      console.error('setVip: No token or selectedUser', { token: !!token, selectedUser });
      return;
    }

    console.log('setVip: Starting', { userId: selectedUser.id, days: vipDays });

    try {
      const response = await fetch(`${ADMIN_API}?action=set_vip`, {
        method: 'POST',
        headers: {
          'X-Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'set_vip',
          user_id: selectedUser.id,
          days: parseInt(vipDays)
        })
      });

      console.log('setVip: Response', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        console.log('setVip: Success', data);
        toast({ title: 'Успешно', description: 'Premium статус установлен' });
        setShowVipDialog(false);
        loadUsers(token);
        setShowDetails(false);
      } else {
        const errorText = await response.text();
        console.error('setVip: Failed', { status: response.status, error: errorText });
        toast({ title: 'Ошибка', description: 'Не удалось установить Premium', variant: 'destructive' });
      }
    } catch (error) {
      console.error('setVip: Exception', error);
      toast({ title: 'Ошибка', description: 'Не удалось установить Premium', variant: 'destructive' });
    }
  };

  const removeVip = async (userId: number) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=remove_vip`, {
        method: 'POST',
        headers: {
          'X-Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'remove_vip', user_id: userId })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Premium статус убран' });
        loadUsers(token);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось убрать Premium', variant: 'destructive' });
    }
  };

  const sendMessage = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token || !selectedUser || !messageText.trim()) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=send_message`, {
        method: 'POST',
        headers: {
          'X-Authorization': `Bearer ${token}`,
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

  const deleteUser = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token || !selectedUser) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=delete_user`, {
        method: 'POST',
        headers: {
          'X-Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete_user',
          user_id: selectedUser.id
        })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Пользователь удален из базы данных' });
        setShowDeleteDialog(false);
        setShowDetails(false);
        loadUsers(token);
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось удалить пользователя', variant: 'destructive' });
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
          'X-Authorization': `Bearer ${token}`,
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
          'X-Authorization': `Bearer ${token}`,
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
            <UserFilters
              search={search}
              setSearch={setSearch}
              filterVip={filterVip}
              setFilterVip={setFilterVip}
              filterBlocked={filterBlocked}
              setFilterBlocked={setFilterBlocked}
            />
          </CardHeader>
          <CardContent>
            <UserList
              users={users}
              loading={loading}
              onLoadDetails={loadUserDetails}
              onSendMessage={(user) => { setSelectedUser(user); setShowMessageDialog(true); }}
              onVerify={verifyUser}
              onUnverify={unverifyUser}
              onBlock={(user) => { setSelectedUser(user); setShowBlockDialog(true); }}
              onUnblock={unblockUser}
              onBan={(user) => { setSelectedUser(user); setShowBanDialog(true); }}
              onSetVip={(user) => { setSelectedUser(user); setShowVipDialog(true); }}
              onRemoveVip={removeVip}
              onDelete={(user) => { setSelectedUser(user); setShowDeleteDialog(true); }}
            />

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

      <UserDetailsDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        user={selectedUser}
      />

      <UserActionDialogs
        showBlockDialog={showBlockDialog}
        setShowBlockDialog={setShowBlockDialog}
        showBanDialog={showBanDialog}
        setShowBanDialog={setShowBanDialog}
        showVipDialog={showVipDialog}
        setShowVipDialog={setShowVipDialog}
        showMessageDialog={showMessageDialog}
        setShowMessageDialog={setShowMessageDialog}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        selectedUser={selectedUser}
        blockReason={blockReason}
        setBlockReason={setBlockReason}
        banReason={banReason}
        setBanReason={setBanReason}
        vipDays={vipDays}
        setVipDays={setVipDays}
        messageText={messageText}
        setMessageText={setMessageText}
        onBlock={blockUser}
        onBan={banUser}
        onSetVip={setVip}
        onSendMessage={sendMessage}
        onDelete={deleteUser}
      />
    </div>
  );
};

export default AdminUsers;