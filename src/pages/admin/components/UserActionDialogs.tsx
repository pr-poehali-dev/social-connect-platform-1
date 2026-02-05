import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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

interface UserActionDialogsProps {
  showBlockDialog: boolean;
  setShowBlockDialog: (show: boolean) => void;
  showBanDialog?: boolean;
  setShowBanDialog?: (show: boolean) => void;
  showVipDialog: boolean;
  setShowVipDialog: (show: boolean) => void;
  showMessageDialog: boolean;
  setShowMessageDialog: (show: boolean) => void;
  selectedUser: User | null;
  blockReason: string;
  setBlockReason: (reason: string) => void;
  banReason?: string;
  setBanReason?: (reason: string) => void;
  vipDays: string;
  setVipDays: (days: string) => void;
  messageText: string;
  setMessageText: (text: string) => void;
  onBlock: () => void;
  onBan?: () => void;
  onSetVip: () => void;
  onSendMessage: () => void;
}

const UserActionDialogs = ({
  showBlockDialog,
  setShowBlockDialog,
  showBanDialog,
  setShowBanDialog,
  showVipDialog,
  setShowVipDialog,
  showMessageDialog,
  setShowMessageDialog,
  selectedUser,
  blockReason,
  setBlockReason,
  banReason,
  setBanReason,
  vipDays,
  setVipDays,
  messageText,
  setMessageText,
  onBlock,
  onBan,
  onSetVip,
  onSendMessage
}: UserActionDialogsProps) => {
  return (
    <>
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="ShieldAlert" className="text-red-500" />
              Забанить пользователя на 24 часа
            </DialogTitle>
            <DialogDescription>
              Пользователь не сможет пользоваться сервисом 24 часа. Укажите причину бана.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Причина бана</Label>
            <Textarea
              value={banReason || ''}
              onChange={(e) => setBanReason?.(e.target.value)}
              placeholder="Нарушение правил..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog?.(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={onBan} disabled={!banReason?.trim()}>
              <Icon name="ShieldAlert" size={16} className="mr-2" />
              Забанить на 24 часа
            </Button>
          </DialogFooter>
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
            <Button variant="destructive" onClick={onBlock}>
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
            <Button onClick={onSetVip}>
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
            <Button onClick={onSendMessage} disabled={!messageText.trim()}>
              <Icon name="Send" size={16} className="mr-2" />
              Отправить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserActionDialogs;