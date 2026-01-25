import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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

interface UserListProps {
  users: User[];
  loading: boolean;
  onLoadDetails: (userId: number) => void;
  onSendMessage: (user: User) => void;
  onVerify: (userId: number) => void;
  onUnverify: (userId: number) => void;
  onBlock: (user: User) => void;
  onUnblock: (userId: number) => void;
  onSetVip: (user: User) => void;
  onRemoveVip: (userId: number) => void;
}

const UserList = ({
  users,
  loading,
  onLoadDetails,
  onSendMessage,
  onVerify,
  onUnverify,
  onBlock,
  onUnblock,
  onSetVip,
  onRemoveVip
}: UserListProps) => {
  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
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
            <Button size="sm" variant="outline" onClick={() => onLoadDetails(user.id)} title="Просмотр деталей">
              <Icon name="Eye" size={16} />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onSendMessage(user)} title="Отправить сообщение">
              <Icon name="Mail" size={16} />
            </Button>
            {user.is_verified ? (
              <Button size="sm" variant="outline" onClick={() => onUnverify(user.id)} title="Убрать верификацию">
                <Icon name="BadgeCheck" size={16} className="text-blue-500" />
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onVerify(user.id)} title="Верифицировать">
                <Icon name="BadgeCheck" size={16} className="text-gray-400" />
              </Button>
            )}
            {user.is_blocked ? (
              <Button size="sm" variant="outline" onClick={() => onUnblock(user.id)} title="Разблокировать">
                <Icon name="Unlock" size={16} />
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onBlock(user)} title="Заблокировать">
                <Icon name="Ban" size={16} />
              </Button>
            )}
            {user.is_vip ? (
              <Button size="sm" variant="outline" onClick={() => onRemoveVip(user.id)} title="Убрать VIP">
                <Icon name="Crown" size={16} className="text-yellow-500" />
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onSetVip(user)} title="Установить VIP">
                <Icon name="Crown" size={16} />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
