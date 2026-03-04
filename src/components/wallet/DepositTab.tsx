import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface DepositTabProps {
  amount: string;
  setAmount: (value: string) => void;
  loading: boolean;
  handleDeposit: () => void;
}

const DepositTab = ({ amount, setAmount, loading, handleDeposit }: DepositTabProps) => {
  const quickAmounts = [
    { value: 500, bonus: 0 },
    { value: 1000, bonus: 10 },
    { value: 2500, bonus: 15 },
    { value: 5000, bonus: 25 }
  ];
  
  const calculateBonus = (amt: number) => {
    if (amt >= 5000) return 25;
    if (amt >= 2500) return 15;
    if (amt >= 1000) return 10;
    return 0;
  };
  
  const parsedAmount = parseFloat(amount) || 0;
  const bonus = calculateBonus(parsedAmount);
  const bonusAmount = Math.floor(parsedAmount * bonus / 100);

  const cryptoOptions = [
    { name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
    { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
    { name: 'USDT', symbol: 'USDT', icon: '₮' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="amount" className="text-base font-medium mb-3 block">
          Сумма пополнения
        </Label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            placeholder="Введите сумму"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg h-12 pr-20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
            = {parsedAmount} LOVE
          </div>
        </div>
        {bonus > 0 && parsedAmount > 0 && (
          <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-sm font-medium text-emerald-700">
              🎁 Бонус +{bonus}% = {bonusAmount} LOVE на бонусный баланс!
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {quickAmounts.map((item) => (
            <Button
              key={item.value}
              variant="outline"
              onClick={() => setAmount(String(item.value))}
              className="h-auto py-2 flex flex-col items-center gap-1"
            >
              <span className="font-bold">{item.value} ₽</span>
              {item.bonus > 0 && (
                <span className="text-xs text-emerald-600">+{item.bonus}% бонус</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Способ оплаты</Label>
        <div className="grid gap-3">
          <Button 
            variant="outline" 
            className="w-full justify-start h-14 hover:border-primary opacity-60 cursor-not-allowed"
            disabled
          >
            <Icon name="CreditCard" className="mr-3 h-5 w-5" />
            <span className="font-medium">Банковская карта</span>
            <span className="ml-auto text-xs text-muted-foreground">Скоро</span>
          </Button>

          {cryptoOptions.map((crypto) => (
            <Button
              key={crypto.symbol}
              variant="outline"
              className="w-full justify-start h-14 hover:border-primary"
              disabled
            >
              <span className="mr-3 text-xl">{crypto.icon}</span>
              <span className="font-medium">{crypto.name} ({crypto.symbol})</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepositTab;