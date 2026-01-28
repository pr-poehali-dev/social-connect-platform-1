import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Ad {
  id: number;
  user_id: number;
  action: string;
  schedule: string;
  name: string;
  nickname: string;
  avatar_url: string;
  gender: string;
  city: string;
  age: number;
  created_at: string;
  events: { event_type: string; details: string }[];
}

interface InviteDialogProps {
  selectedAd: Ad | null;
  inviteMessage: string;
  sending: boolean;
  onClose: () => void;
  onMessageChange: (message: string) => void;
  onSend: () => void;
}

const InviteDialog = ({
  selectedAd,
  inviteMessage,
  sending,
  onClose,
  onMessageChange,
  onSend,
}: InviteDialogProps) => {
  return (
    <Dialog open={!!selectedAd} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Отправить сообщение</DialogTitle>
          <DialogDescription>
            {selectedAd?.name}, {selectedAd?.age} лет
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={inviteMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Напишите сообщение..."
            className="rounded-2xl min-h-[120px]"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-2xl"
            >
              Отмена
            </Button>
            <Button
              onClick={onSend}
              disabled={sending}
              className="flex-1 rounded-2xl"
            >
              {sending ? 'Отправка...' : 'Отправить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
