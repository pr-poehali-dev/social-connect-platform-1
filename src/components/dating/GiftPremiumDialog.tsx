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

interface GiftPremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: number;
  recipientName: string;
}

const premiumPlans = [
  { months: 1, price: 299, label: '1 месяц' },
  { months: 3, price: 799, label: '3 месяца', discount: '11%' },
  { months: 6, price: 1499, label: '6 месяцев', discount: '17%' },
  { months: 12, price: 2699, label: '1 год', discount: '25%' },
];

const GiftPremiumDialog = ({ open, onOpenChange, recipientId, recipientName }: GiftPremiumDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGiftPremium = async () => {
    if (!selectedPlan) return;

    const plan = premiumPlans.find(p => p.months === selectedPlan);
    if (!plan) return;

    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('https://functions.poehali.dev/19d45ed4-7f95-4f49-b132-32e32c997a29', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          months: plan.months,
          price: plan.price
        })
      });

      if (response.ok) {
        toast({
          title: '🎁 Premium подарен!',
          description: `${recipientName} получил Premium на ${plan.label}`,
        });
        onOpenChange(false);
      } else {
        const data = await response.json();
        if (data.error === 'Недостаточно средств') {
          toast({
            title: 'Недостаточно средств',
            description: 'Пополните баланс для покупки подарка',
            variant: 'destructive',
          });
          navigate('/wallet');
        } else {
          throw new Error(data.error || 'Ошибка покупки');
        }
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подарить Premium',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Gift" size={24} className="text-purple-500" />
            Подарить Premium
          </DialogTitle>
          <DialogDescription>
            Выберите период Premium-подписки для {recipientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {premiumPlans.map((plan) => (
            <button
              key={plan.months}
              onClick={() => setSelectedPlan(plan.months)}
              className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                selectedPlan === plan.months
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-border hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{plan.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {plan.price} LOVE
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {plan.discount && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      -{plan.discount}
                    </span>
                  )}
                  {selectedPlan === plan.months && (
                    <Icon name="CheckCircle2" size={24} className="text-purple-500" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4 space-y-2">
          <Button
            onClick={handleGiftPremium}
            disabled={!selectedPlan || loading}
            className="w-full rounded-xl h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {loading ? (
              <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
            ) : (
              <Icon name="Gift" size={20} className="mr-2" />
            )}
            Подарить Premium
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Средства будут списаны с вашего баланса
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GiftPremiumDialog;