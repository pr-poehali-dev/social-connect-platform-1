import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface WalletHeaderProps {
  balance: number;
  bonusBalance: number;
}

const WalletHeader = ({ balance, bonusBalance }: WalletHeaderProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-purple-600 to-pink-600">
        <CardContent className="p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-2">Основной баланс</p>
              <p className="text-4xl font-bold">{balance.toFixed(2)} ₽</p>
            </div>
            <Icon name="Wallet" className="w-12 h-12 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-amber-500 to-orange-500">
        <CardContent className="p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-2">Бонусный баланс</p>
              <p className="text-4xl font-bold">{bonusBalance.toFixed(2)} ₽</p>
            </div>
            <Icon name="Gift" className="w-12 h-12 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletHeader;
