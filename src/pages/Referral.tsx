import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Referral = () => {
  const { toast } = useToast();
  const referralLink = 'https://connecthub.com/ref/ABC123';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: 'Скопировано!', description: 'Реферальная ссылка в буфере обмена' });
  };

  const stats = [
    { icon: 'Users', label: 'Приглашено друзей', value: '0', color: 'from-emerald-500 to-teal-500' },
    { icon: 'Coins', label: 'Заработано', value: '0 ₽', color: 'from-amber-500 to-orange-500' },
    { icon: 'TrendingUp', label: 'За этот месяц', value: '0 ₽', color: 'from-blue-500 to-cyan-500' }
  ];

  const benefits = [
    {
      icon: 'Gift',
      title: 'Бонус за регистрацию',
      description: 'Получайте 500 ₽ за каждого приглашённого друга'
    },
    {
      icon: 'Percent',
      title: 'Процент от сделок',
      description: '5% от всех сделок ваших рефералов'
    },
    {
      icon: 'Infinity',
      title: 'Навсегда',
      description: 'Вознаграждение начисляется пожизненно'
    },
    {
      icon: 'Zap',
      title: 'Мгновенный вывод',
      description: 'Выводите заработок в любое время'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-32 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 bg-clip-text text-transparent">
                Партнёрская программа
              </h1>
              <p className="text-xl text-muted-foreground">
                Приглашайте друзей и зарабатывайте вместе
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="rounded-3xl border-2">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                      <Icon name={stat.icon} size={28} className="text-white" />
                    </div>
                    <p className="text-3xl font-bold mb-2">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-8 rounded-3xl border-2 shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Ваша реферальная ссылка</h2>
                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="font-mono rounded-2xl"
                  />
                  <Button onClick={copyLink} className="gap-2 rounded-2xl whitespace-nowrap">
                    <Icon name="Copy" size={18} />
                    Копировать
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Преимущества программы</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="rounded-3xl border-2 hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                          <Icon name={benefit.icon} size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                          <p className="text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-3xl border-0">
              <CardContent className="p-8 text-center">
                <Icon name="Trophy" size={48} className="mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Как это работает?</h2>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-white text-emerald-500 flex items-center justify-center font-bold mb-3">
                      1
                    </div>
                    <h3 className="font-bold mb-2">Поделитесь ссылкой</h3>
                    <p className="text-sm opacity-90">Отправьте реферальную ссылку друзьям</p>
                  </div>
                  <div>
                    <div className="w-8 h-8 rounded-full bg-white text-emerald-500 flex items-center justify-center font-bold mb-3">
                      2
                    </div>
                    <h3 className="font-bold mb-2">Они регистрируются</h3>
                    <p className="text-sm opacity-90">Друг создаёт аккаунт по вашей ссылке</p>
                  </div>
                  <div>
                    <div className="w-8 h-8 rounded-full bg-white text-emerald-500 flex items-center justify-center font-bold mb-3">
                      3
                    </div>
                    <h3 className="font-bold mb-2">Вы зарабатываете</h3>
                    <p className="text-sm opacity-90">Получайте бонусы от их активности</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Referral;