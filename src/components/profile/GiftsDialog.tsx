import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const GET_GIFTS_URL = 'https://functions.poehali.dev/f4befd24-1ac3-48f4-a9b7-9cccdee173eb';

interface Gift {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar: string;
  gift_name: string;
  gift_emoji: string;
  price: number;
  is_public: boolean;
  is_anonymous: boolean;
  created_at: string;
}

interface GiftsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: number;
}

const GiftsDialog = ({ open, onOpenChange, userId }: GiftsDialogProps) => {
  const { toast } = useToast();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadGifts = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${GET_GIFTS_URL}?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGifts(data.gifts || []);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open && userId) loadGifts();
  }, [open, userId, loadGifts]);

  const toggleVisibility = async (gift: Gift) => {
    setTogglingId(gift.id);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(GET_GIFTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gift_id: gift.id, is_public: !gift.is_public }),
      });
      if (res.ok) {
        setGifts(prev => prev.map(g => g.id === gift.id ? { ...g, is_public: !g.is_public } : g));
        toast({ title: !gift.is_public ? 'Подарок виден всем' : 'Подарок скрыт' });
      }
    } finally {
      setTogglingId(null);
    }
  };

  const publicGifts = gifts.filter(g => g.is_public);
  const privateGifts = gifts.filter(g => !g.is_public);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name="Gift" size={22} className="text-pink-500" />
            Мои подарки
            {gifts.length > 0 && (
              <Badge className="ml-1 bg-pink-500 text-white border-0">{gifts.length}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={36} className="animate-spin text-muted-foreground" />
          </div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎁</div>
            <p className="text-muted-foreground">Вам ещё не дарили подарки</p>
            <p className="text-sm text-muted-foreground mt-1">Подарки появятся здесь после получения</p>
          </div>
        ) : (
          <div className="space-y-6">
            {publicGifts.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Icon name="Eye" size={15} />
                  Публичные ({publicGifts.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {publicGifts.map(gift => (
                    <GiftCard
                      key={gift.id}
                      gift={gift}
                      toggling={togglingId === gift.id}
                      onToggle={() => toggleVisibility(gift)}
                    />
                  ))}
                </div>
              </div>
            )}

            {privateGifts.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Icon name="EyeOff" size={15} />
                  Скрытые ({privateGifts.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {privateGifts.map(gift => (
                    <GiftCard
                      key={gift.id}
                      gift={gift}
                      toggling={togglingId === gift.id}
                      onToggle={() => toggleVisibility(gift)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface GiftCardProps {
  gift: Gift;
  toggling: boolean;
  onToggle: () => void;
}

const GiftCard = ({ gift, toggling, onToggle }: GiftCardProps) => {
  const date = new Date(gift.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

  return (
    <div className="group relative">
      <div
        className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-3 border-2 transition-all cursor-pointer ${
          gift.is_public
            ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-border hover:border-pink-300'
            : 'bg-gray-50 border-dashed border-gray-200 opacity-70 hover:opacity-100'
        }`}
        onClick={onToggle}
      >
        {toggling ? (
          <Icon name="Loader2" size={28} className="animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="text-4xl mb-1">{gift.gift_emoji}</div>
            <div className="text-xs font-medium text-center line-clamp-1">{gift.gift_name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{date}</div>
          </>
        )}

        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/70 rounded-full p-1">
            <Icon name={gift.is_public ? 'EyeOff' : 'Eye'} size={11} className="text-white" />
          </div>
        </div>
      </div>

      <div className="mt-1 text-[10px] text-center text-muted-foreground truncate px-1">
        {gift.is_anonymous ? '🕵️ Аноним' : `от ${gift.sender_name.trim() || 'пользователя'}`}
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="w-full h-6 mt-0.5 text-[10px] text-muted-foreground hover:text-foreground rounded-lg px-1"
        onClick={onToggle}
      >
        {gift.is_public ? 'Скрыть' : 'Показать'}
      </Button>
    </div>
  );
};

export default GiftsDialog;