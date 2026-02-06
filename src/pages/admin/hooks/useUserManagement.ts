import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, UserDetails, ADMIN_API } from '../types';

export const useUserManagement = () => {
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
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
        console.error('HTTP', response.status, ':', `${ADMIN_API}?action=get_user_details&user_id=${userId}`);
        toast({ 
          title: 'Ошибка загрузки профиля', 
          description: errorData.error || `HTTP ${response.status}`, 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Load user details error:', error);
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

  const unbanUser = async (userId: number) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=unban_user`, {
        method: 'POST',
        headers: {
          'X-Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'unban_user', user_id: userId })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Бан снят досрочно' });
        loadUsers(token);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось снять бан', variant: 'destructive' });
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
        
        setUsers(users.map(u => 
          u.id === selectedUser.id 
            ? { ...u, is_vip: true, vip_expires_at: data.expires_at } 
            : u
        ));
        
        toast({ title: 'Успешно', description: 'Premium статус установлен' });
        setShowVipDialog(false);
        setShowDetails(false);
        loadUsers(token);
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
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, is_vip: false, vip_expires_at: null } 
            : u
        ));
        
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

  return {
    users,
    setUsers,
    total,
    page,
    setPage,
    search,
    setSearch,
    filterVip,
    setFilterVip,
    filterBlocked,
    setFilterBlocked,
    loading,
    selectedUser,
    setSelectedUser,
    showDetails,
    setShowDetails,
    showBlockDialog,
    setShowBlockDialog,
    showBanDialog,
    setShowBanDialog,
    showVipDialog,
    setShowVipDialog,
    showMessageDialog,
    setShowMessageDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    blockReason,
    setBlockReason,
    banReason,
    setBanReason,
    vipDays,
    setVipDays,
    messageText,
    setMessageText,
    loadUserDetails,
    blockUser,
    banUser,
    unblockUser,
    unbanUser,
    setVip,
    removeVip,
    sendMessage,
    deleteUser,
    verifyUser,
    unverifyUser
  };
};
