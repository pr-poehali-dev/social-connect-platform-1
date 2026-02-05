import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Transaction {
  id: number;
  amount: number;
  type: string;
  status: string;
  description: string;
  created_at: string;
}

interface HistoryTabProps {
  transactions: Transaction[];
}

const HistoryTab = ({ transactions }: HistoryTabProps) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Icon name="ArrowDown" className="w-5 h-5 text-green-600" />;
      case 'bonus':
        return <Icon name="Gift" className="w-5 h-5 text-amber-600" />;
      case 'withdrawal':
        return <Icon name="ArrowUp" className="w-5 h-5 text-red-600" />;
      default:
        return <Icon name="CircleDot" className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Icon name="Receipt" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">История транзакций пуста</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-full">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-semibold ${
                  transaction.type === 'deposit' || transaction.type === 'bonus'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {transaction.type === 'deposit' || transaction.type === 'bonus' ? '+' : '-'}
                  {transaction.amount.toFixed(2)} ₽
                </p>
                <p className="text-xs text-gray-500">{transaction.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HistoryTab;
