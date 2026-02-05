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
  const quickAmounts = [500, 1000, 2500, 5000];

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
        <Input
          id="amount"
          type="number"
          placeholder="Введите сумму"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-lg h-12"
        />
        <div className="grid grid-cols-4 gap-2 mt-3">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="outline"
              onClick={() => setAmount(String(quickAmount))}
              className="h-10"
            >
              {quickAmount} ₽
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Способ оплаты</Label>
        <div className="grid gap-3">
          <Button 
            variant="outline" 
            className="w-full justify-start h-14 hover:border-primary"
            onClick={handleDeposit}
            disabled={loading}
          >
            <Icon name="CreditCard" className="mr-3 h-5 w-5" />
            <span className="font-medium">Банковская карта</span>
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
