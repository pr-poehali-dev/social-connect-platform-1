import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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

  const quickAmounts = [500, 1000, 2500, 5000];

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

  const cryptoOptions = [
    { name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
    { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
    { name: 'USDT', symbol: 'USDT', icon: '₮' }
  ];

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
      
      <main className="pt-32 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Кошелёк
            </h1>

            <Card className="mb-8 rounded-3xl border-2 shadow-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-lg opacity-90">Доступный баланс</p>
                  <Icon name="Wallet" size={32} />
                </div>
                <p className="text-5xl font-bold mb-2">{balance.toLocaleString('ru-RU')} ₽</p>
                {bonusBalance > 0 && (
                  <p className="text-lg opacity-90 mb-4">
                    <Icon name="Gift" size={16} className="inline mr-1" />
                    Бонусный: {bonusBalance.toLocaleString('ru-RU')} ₽
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" size="lg" className="gap-2 rounded-2xl">
                    <Icon name="Plus" size={20} />
                    Пополнить
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2 rounded-2xl bg-white/10 border-white/20 hover:bg-white/20">
                    <Icon name="ArrowDown" size={20} />
                    Вывести
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 rounded-3xl border-2">
              <CardContent className="p-8">
                <Tabs defaultValue="deposit">
                  <TabsList className="grid w-full grid-cols-3 mb-6 rounded-2xl">
                    <TabsTrigger value="deposit" className="rounded-xl">
                      <Icon name="ArrowUp" size={16} className="mr-2" />
                      Пополнение
                    </TabsTrigger>
                    <TabsTrigger value="transfer" className="rounded-xl">
                      <Icon name="Send" size={16} className="mr-2" />
                      Перевод
                    </TabsTrigger>
                    <TabsTrigger value="withdrawal" className="rounded-xl">
                      <Icon name="ArrowDown" size={16} className="mr-2" />
                      Вывод
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="deposit" className="space-y-6">
                    <div>
                      <Label htmlFor="amount">Сумма пополнения</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-2xl py-6 rounded-2xl"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">Быстрое пополнение</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {quickAmounts.map((quickAmount) => (
                          <Button
                            key={quickAmount}
                            variant="outline"
                            onClick={() => setAmount(String(quickAmount))}
                            className="h-auto py-4 rounded-2xl hover:border-primary hover:bg-primary/5"
                          >
                            <span className="font-bold text-lg">{quickAmount} ₽</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-3 block">Способ оплаты</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {cryptoOptions.map((crypto) => (
                          <Button
                            key={crypto.symbol}
                            variant="outline"
                            className="h-auto py-4 flex-col rounded-2xl hover:border-primary hover:bg-primary/5"
                          >
                            <span className="text-3xl mb-2">{crypto.icon}</span>
                            <span className="font-bold">{crypto.symbol}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={handleDeposit}
                      disabled={loading || !amount || parseFloat(amount) <= 0}
                      className="w-full py-6 rounded-2xl text-lg"
                    >
                      {loading ? 'Обработка...' : 'Пополнить баланс'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="transfer" className="space-y-6">
                    {!hasFinancialPassword ? (
                      showSetPassword ? (
                        <>
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                            <p className="text-sm text-amber-800">
                              <Icon name="Lock" size={16} className="inline mr-1" />
                              Создайте финансовый пароль для защиты переводов
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="new-password">Новый пароль (минимум 4 символа)</Label>
                            <Input
                              id="new-password"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="rounded-2xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="rounded-2xl"
                            />
                          </div>
                          <Button 
                            onClick={handleSetPassword}
                            disabled={loading}
                            className="w-full py-6 rounded-2xl text-lg"
                          >
                            {loading ? 'Сохранение...' : 'Установить пароль'}
                          </Button>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <Icon name="Lock" size={48} className="mx-auto mb-4 text-amber-500" />
                          <p className="text-lg mb-4">Для переводов необходим финансовый пароль</p>
                          <Button onClick={() => setShowSetPassword(true)} className="rounded-2xl">
                            Создать пароль
                          </Button>
                        </div>
                      )
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="recipient-id">ID получателя</Label>
                          <Input
                            id="recipient-id"
                            type="number"
                            placeholder="Введите ID пользователя"
                            value={transferRecipientId}
                            onChange={(e) => setTransferRecipientId(e.target.value)}
                            className="rounded-2xl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="transfer-amount">Сумма перевода</Label>
                          <Input
                            id="transfer-amount"
                            type="number"
                            placeholder="0"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            className="text-2xl py-6 rounded-2xl"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            Доступно: {balance.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="financial-password">Финансовый пароль</Label>
                          <Input
                            id="financial-password"
                            type="password"
                            placeholder="Введите финансовый пароль"
                            value={financialPassword}
                            onChange={(e) => setFinancialPassword(e.target.value)}
                            className="rounded-2xl"
                          />
                        </div>
                        <Button 
                          onClick={handleTransfer}
                          disabled={loading || balance === 0}
                          className="w-full py-6 rounded-2xl text-lg"
                        >
                          {loading ? 'Обработка...' : 'Перевести'}
                        </Button>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="withdrawal" className="space-y-6">
                    <div>
                      <Label htmlFor="withdrawal-amount">Сумма вывода</Label>
                      <Input
                        id="withdrawal-amount"
                        type="number"
                        placeholder="0"
                        className="text-2xl py-6 rounded-2xl"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Доступно: {balance.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="wallet-address">Адрес кошелька</Label>
                      <Input
                        id="wallet-address"
                        placeholder="Введите адрес криптокошелька"
                        className="rounded-2xl font-mono"
                      />
                    </div>

                    <Button className="w-full py-6 rounded-2xl text-lg" disabled={balance === 0}>
                      Вывести средства
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-2">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">История операций</h2>
                
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border-2 hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            tx.type === 'deposit' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : tx.type === 'bonus'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            <Icon name={tx.type === 'deposit' ? 'ArrowDown' : tx.type === 'bonus' ? 'Gift' : 'ArrowUp'} size={20} />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {tx.type === 'deposit' ? 'Пополнение' : tx.type === 'bonus' ? 'Бонус' : 'Вывод'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.created_at).toLocaleDateString('ru-RU')} • {tx.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            tx.type === 'deposit' || tx.type === 'bonus' ? 'text-emerald-500' : 'text-red-500'
                          }`}>
                            {tx.type === 'deposit' || tx.type === 'bonus' ? '+' : '-'}{tx.amount.toLocaleString('ru-RU')} ₽
                          </p>
                          <p className="text-xs text-muted-foreground">{tx.status === 'completed' ? 'Завершено' : 'В обработке'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="Receipt" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Пока нет операций</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Wallet;