import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface UserDetails {
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
  login_history?: Array<{
    ip: string;
    user_agent: string;
    login_at: string;
    success: boolean;
  }>;
}

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetails | null;
}

const UserDetailsDialog = ({ open, onOpenChange, user }: UserDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Детали пользователя</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="space-y-4">
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Имя:</strong> {user.name || 'Не указано'}
            </div>
            <div>
              <strong>Статус:</strong>{' '}
              {user.is_vip && <Badge className="bg-yellow-500 mr-2">Premium</Badge>}
              {user.is_verified && <Badge className="bg-blue-500 mr-2">Верифицирован</Badge>}
              {user.is_blocked && <Badge variant="destructive">Заблокирован</Badge>}
            </div>
            {user.block_reason && (
              <div>
                <strong>Причина блокировки:</strong> {user.block_reason}
              </div>
            )}
            <div>
              <strong>История входов:</strong>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {user.login_history?.map((entry, idx) => (
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
  );
};

export default UserDetailsDialog;