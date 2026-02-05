import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import WalletHeader from '@/components/wallet/WalletHeader';
import DepositTab from '@/components/wallet/DepositTab';
import TransferTab from '@/components/wallet/TransferTab';
import HistoryTab from '@/components/wallet/HistoryTab';

const PAYMENT_API_URL = 'https://functions.poehali.dev/ff06b527-a0c8-43ae-82f4-f8732af4d197';
const WALLET_API_URL = 'https://functions.poehali.dev/dcbc72cf-2de6-43eb-b32a-2cd0c34fe525';
const FINANCIAL_PASSWORD_API_URL = 'https://functions.poehali.dev/26ccbe26-abcf-43ed-a5b8-36f92e5efa86';
const TRANSFER_API_URL = 'https://functions.poehali.dev/903553bc-a545-45f4-b978-496148337d2f';

interface Transaction {
  id: number;
  amount: number;
  type: string;
  status: string;
  description: string;
  created_at: string;
}

const Wallet = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasFinancialPassword, setHasFinancialPassword] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [transferRecipientId, setTransferRecipientId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [financialPassword, setFinancialPassword] = useState('');

  useEffect(() => {
    loadWalletData();
    checkFinancialPassword();
  }, []);

  const checkFinancialPassword = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const response = await fetch(FINANCIAL_PASSWORD_API_URL, {
        headers: { 'X-User-Id': userId }
      });

      if (response.ok) {
        const data = await response.json();
        setHasFinancialPassword(data.has_password);
      }
    } catch (error) {
      console.error('Failed to check financial password:', error);
    }
  };

  const loadWalletData = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setDataLoading(false);
      return;
    }

    try {
      const response = await fetch(WALLET_API_URL, {
        headers: { 'X-User-Id': userId }
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
        setBonusBalance(data.bonus_balance || 0);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDeposit = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast({ title: 'Ошибка', description: 'Необходима авторизация', variant: 'destructive' });
      return;
    }

    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      toast({ title: 'Ошибка', description: 'Укажите корректную сумму', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(PAYMENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ amount: depositAmount })
      });

      if (response.ok) {
        const result = await response.json();
        toast({ 
          title: 'Успешно!', 
          description: `Пополнение на ${depositAmount}₽ выполнено${result.bonus_credited ? '. Наставнику начислен бонус!' : ''}` 
        });
        setAmount('');
        loadWalletData();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error || 'Не удалось выполнить операцию', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка соединения с сервером', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (newPassword.length < 4) {
      toast({ title: 'Ошибка', description: 'Пароль должен содержать минимум 4 символа', variant: 'destructive' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: 'Ошибка', description: 'Пароли не совпадают', variant: 'destructive' });
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(FINANCIAL_PASSWORD_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ action: 'set', password: newPassword })
      });

      if (response.ok) {
        toast({ title: 'Успешно!', description: 'Финансовый пароль установлен' });
        setHasFinancialPassword(true);
        setShowSetPassword(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка соединения', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!hasFinancialPassword) {
      toast({ title: 'Внимание', description: 'Сначала установите финансовый пароль', variant: 'destructive' });
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) {
      toast({ title: 'Ошибка', description: 'Укажите корректную сумму', variant: 'destructive' });
      return;
    }

    if (!transferRecipientId) {
      toast({ title: 'Ошибка', description: 'Укажите ID получателя', variant: 'destructive' });
      return;
    }

    if (!financialPassword) {
      toast({ title: 'Ошибка', description: 'Введите финансовый пароль', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(TRANSFER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({
          recipient_id: parseInt(transferRecipientId),
          amount: amount,
          financial_password: financialPassword
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({ 
          title: 'Успешно!', 
          description: `Переведено ${amount}₽ для ${result.recipient}` 
        });
        setTransferRecipientId('');
        setTransferAmount('');
        setFinancialPassword('');
        loadWalletData();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка соединения', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Кошелек
          </h1>
          <Icon name="Wallet" className="w-10 h-10 text-purple-600" />
        </div>

        <WalletHeader balance={balance} bonusBalance={bonusBalance} />

        <Card className="shadow-xl border-none">
          <CardContent className="p-6">
            <Tabs defaultValue="deposit" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="deposit" className="text-base">
                  Пополнение
                </TabsTrigger>
                <TabsTrigger value="transfer" className="text-base">
                  Перевод
                </TabsTrigger>
                <TabsTrigger value="history" className="text-base">
                  История
                </TabsTrigger>
              </TabsList>

              <TabsContent value="deposit">
                <DepositTab
                  amount={amount}
                  setAmount={setAmount}
                  loading={loading}
                  handleDeposit={handleDeposit}
                />
              </TabsContent>

              <TabsContent value="transfer">
                <TransferTab
                  hasFinancialPassword={hasFinancialPassword}
                  showSetPassword={showSetPassword}
                  setShowSetPassword={setShowSetPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  handleSetPassword={handleSetPassword}
                  transferRecipientId={transferRecipientId}
                  setTransferRecipientId={setTransferRecipientId}
                  transferAmount={transferAmount}
                  setTransferAmount={setTransferAmount}
                  financialPassword={financialPassword}
                  setFinancialPassword={setFinancialPassword}
                  handleTransfer={handleTransfer}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="history">
                <HistoryTab transactions={transactions} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Wallet;
