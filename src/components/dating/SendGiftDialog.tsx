import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SendGiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: number;
  recipientName: string;
}

const gifts = [
  { id: 1, name: 'Роза', emoji: '🌹', price: 10 },
  { id: 2, name: 'Букет из 101 розы', emoji: '💐', price: 500 },
  { id: 3, name: 'Сердце', emoji: '❤️', price: 50 },
  { id: 4, name: 'Поцелуй', emoji: '💋', price: 25 },
  { id: 5, name: 'Котик', emoji: '🐱', price: 100 },
  { id: 6, name: 'Мишка', emoji: '🧸', price: 150 },
  { id: 7, name: 'Рафаэлло', emoji: '🍬', price: 200 },
  { id: 8, name: 'Кольцо', emoji: '💍', price: 1000 },
  { id: 9, name: 'Часы', emoji: '⌚', price: 2500 },
  { id: 10, name: 'Пачка денег', emoji: '💵', price: 500 },
  { id: 11, name: 'Чемодан денег', emoji: '💰', price: 5000 },
  { id: 12, name: 'Слиток золота', emoji: '🪙', price: 10000 },
  { id: 13, name: 'iPhone', emoji: '📱', price: 15000 },
  { id: 14, name: 'Автомобиль', emoji: '🚗', price: 50000 },
  { id: 15, name: 'Загранпаспорт', emoji: '🛂', price: 3000 },
  { id: 16, name: 'Наручники', emoji: '⛓️', price: 300 },
  { id: 17, name: 'Плётка', emoji: '🪢', price: 400 },
  { id: 18, name: 'БДСМ кровать', emoji: '🛏️', price: 8000 },
];

const SendGiftDialog = ({ open, onOpenChange, recipientId, recipientName }: SendGiftDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSendGift = async () => {
    if (!selectedGift) return;

    const gift = gifts.find(g => g.id === selectedGift);
    if (!gift) return;

    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('https://functions.poehali.dev/89b6131c-6cf3-4384-a0fd-d03170e946b1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          gift_id: gift.id,
          gift_name: gift.name,
          gift_emoji: gift.emoji,
          price: gift.price,
          is_anonymous: isAnonymous
        })
      });

      if (response.ok) {
        toast({
          title: '🎁 Подарок отправлен!',
          description: isAnonymous 
            ? `${recipientName} получил анонимный подарок ${gift.emoji} ${gift.name}`
            : `${recipientName} получил ${gift.emoji} ${gift.name}`,
        });
        onOpenChange(false);
        setSelectedGift(null);
        setIsAnonymous(false);
      } else {
        const data = await response.json();
        if (data.error === 'Недостаточно средств') {
          toast({
            title: 'Недостаточно средств',
            description: 'Пополните баланс для отправки подарка',
            variant: 'destructive',
          });
          navigate('/wallet');
        } else {
          throw new Error(data.error || 'Ошибка отправки');
        }
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить подарок',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedGiftData = gifts.find(g => g.id === selectedGift);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Gift" size={24} className="text-pink-500" />
            Отправить подарок
          </DialogTitle>
          <DialogDescription>
            Выберите подарок для {recipientName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {gifts.map((gift) => (
            <button
              key={gift.id}
              onClick={() => setSelectedGift(gift.id)}
              className={`p-4 border-2 rounded-xl transition-all text-center ${
                selectedGift === gift.id
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-border hover:border-pink-300'
              }`}
            >
              <div className="text-4xl mb-2">{gift.emoji}</div>
              <div className="font-semibold text-sm mb-1">{gift.name}</div>
              <div className="text-xs text-muted-foreground">{gift.price} LOVE</div>
            </button>
          ))}
        </div>

        {selectedGiftData && (
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedGiftData.emoji}</span>
                  <div>
                    <div className="font-semibold">{selectedGiftData.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedGiftData.price} LOVE
                    </div>
                  </div>
                </div>
                <Icon name="CheckCircle2" size={24} className="text-pink-500" />
              </div>
            </div>
            
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-full p-3 border-2 rounded-xl transition-all flex items-center gap-3 ${
                isAnonymous
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-border hover:border-purple-300'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isAnonymous ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
              }`}>
                {isAnonymous && <Icon name="Check" size={14} className="text-white" />}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Icon name="EyeOff" size={18} className="text-purple-500" />
                <span className="font-medium">Отправить анонимно</span>
              </div>
            </button>
          </div>
        )}

        <div className="pt-4 space-y-2">
          <Button
            onClick={handleSendGift}
            disabled={!selectedGift || loading}
            className="w-full rounded-xl h-12 text-base font-semibold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            {loading ? (
              <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
            ) : (
              <Icon name="Gift" size={20} className="mr-2" />
            )}
            Отправить подарок
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Средства будут списаны с вашего баланса
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendGiftDialog;