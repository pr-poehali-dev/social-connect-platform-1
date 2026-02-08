import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ReferralInfoSectionProps {
  referralsCount: number;
  bonusBalance: number;
}

const ReferralInfoSection = ({ referralsCount, bonusBalance }: ReferralInfoSectionProps) => {
  const stats = [
    { icon: 'Users', label: 'Приглашено друзей', value: String(referralsCount), color: 'from-emerald-500 to-teal-500' },
    { icon: 'Wallet', label: 'Бонусный баланс', value: `${bonusBalance} ₽`, color: 'from-amber-500 to-orange-500' },
    { icon: 'TrendingUp', label: 'За этот месяц', value: '0 ₽', color: 'from-blue-500 to-cyan-500' }
  ];

  const benefits = [
    {
      icon: 'Gift',
      title: 'Ваш друг получает',
      description: '7 дней Premium за 1₽ (далее 299₽/мес)'
    },
    {
      icon: 'Crown',
      title: 'Вы получаете',
      description: '+1 день Premium за каждого друга'
    },
    {
      icon: 'Percent',
      title: 'Процент с пополнений',
      description: '30% с каждого пополнения ваших рефералов'
    },
    {
      icon: 'Infinity',
      title: 'Навсегда',
      description: 'Накапливайте дни подписки без ограничений'
    }
  ];

  return (
    <>
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
    </>
  );
};

export default ReferralInfoSection;
