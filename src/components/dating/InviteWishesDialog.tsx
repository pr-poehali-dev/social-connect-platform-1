import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type IconName = 'UtensilsCrossed' | 'Music2' | 'PartyPopper' | 'Film' | 'Plane';

const WISH_CATEGORIES: { id: string; label: string; icon: IconName; color: string }[] = [
  { id: 'restaurant', label: 'Ресторан', icon: 'UtensilsCrossed', color: 'bg-orange-100 text-orange-700' },
  { id: 'concert', label: 'Концерт', icon: 'Music2', color: 'bg-purple-100 text-purple-700' },
  { id: 'party', label: 'Вечеринка', icon: 'PartyPopper', color: 'bg-pink-100 text-pink-700' },
  { id: 'cinema', label: 'Кино', icon: 'Film', color: 'bg-blue-100 text-blue-700' },
  { id: 'tour', label: 'Совместный тур', icon: 'Plane', color: 'bg-emerald-100 text-emerald-700' },
];

const STORAGE_KEY = 'user_wishes';

interface InviteWishesDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profileName: string;
}

const InviteWishesDialog = ({ open, onOpenChange, profileName }: InviteWishesDialogProps) => {
  const [wishes, setWishes] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        setWishes(parsed);
      } else {
        setWishes([]);
      }
    }
  }, [open]);

  const activeWishes = WISH_CATEGORIES.filter(c => wishes.includes(c.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Icon name="Heart" size={20} className="text-pink-500" />
            Пригласить {profileName}
          </DialogTitle>
        </DialogHeader>

        {activeWishes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <Icon name="HeartOff" size={40} className="mx-auto mb-3 opacity-40" />
            <p>У этого пользователя пока нет желаний</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            <p className="text-sm text-muted-foreground mb-1">Выбери, куда хочешь пригласить:</p>
            {activeWishes.map(cat => (
              <Button
                key={cat.id}
                variant="outline"
                className="w-full h-12 rounded-xl gap-3 justify-start text-base font-medium"
                onClick={() => onOpenChange(false)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                  <Icon name={cat.icon} size={18} />
                </div>
                {cat.label}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteWishesDialog;
