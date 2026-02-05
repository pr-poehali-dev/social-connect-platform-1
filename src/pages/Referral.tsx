import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const REFERRAL_API_URL = 'https://functions.poehali.dev/17091600-02b0-442b-a13d-2b57827b7106';

interface Referral {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
  avatar_url: string | null;
}

interface ReferralInfo {
  referral_code: string;
  referrals_count: number;
  bonus_balance: number;
}

interface BonusTransaction {
  id: number;
  amount: number;
  description: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

const Referral = () => {
  const { toast } = useToast();
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [bonuses, setBonuses] = useState<BonusTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const referralLink = referralInfo?.referral_code 
    ? `http://loveis.city/ref${referralInfo.referral_code}`
    : '';

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    const userId = localStorage.getItem('userId');
    console.log('Loading referral data for userId:', userId);
    
    if (!userId) {
      console.log('No userId found in localStorage');
      setLoading(false);
      return;
    }

    try {
      const [infoRes, referralsRes, bonusesRes] = await Promise.all([
        fetch(`${REFERRAL_API_URL}?action=info`, {
          headers: { 'X-User-Id': userId }
        }),
        fetch(`${REFERRAL_API_URL}?action=referrals`, {
          headers: { 'X-User-Id': userId }
        }),
        fetch(`${REFERRAL_API_URL}?action=bonuses`, {
          headers: { 'X-User-Id': userId }
        })
      ]);

      console.log('Info response status:', infoRes.status);
      console.log('Referrals response status:', referralsRes.status);

      if (infoRes.ok) {
        const info = await infoRes.json();
        console.log('Referral info loaded:', info);
        setReferralInfo(info);
      } else {
        console.error('Failed to load referral info:', await infoRes.text());
      }

      if (referralsRes.ok) {
        const data = await referralsRes.json();
        console.log('Referrals loaded:', data);
        setReferrals(data.referrals || []);
      } else {
        console.error('Failed to load referrals:', await referralsRes.text());
      }

      if (bonusesRes.ok) {
        const data = await bonusesRes.json();
        console.log('Bonuses loaded:', data);
        setBonuses(data.bonuses || []);
      } else {
        console.error('Failed to load bonuses:', await bonusesRes.text());
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast({ title: 'Скопировано!', description: 'Реферальная ссылка в буфере обмена' });
  };

  const stats = [
    { icon: 'Users', label: 'Приглашено друзей', value: String(referralInfo?.referrals_count || 0), color: 'from-emerald-500 to-teal-500' },
    { icon: 'Wallet', label: 'Бонусный баланс', value: `${referralInfo?.bonus_balance || 0} ₽`, color: 'from-amber-500 to-orange-500' },
    { icon: 'TrendingUp', label: 'За этот месяц', value: '0 ₽', color: 'from-blue-500 to-cyan-500' }
  ];

  const benefits = [
    {
      icon: 'Percent',
      title: 'Процент от пополнений',
      description: '30% от пополнений ваших рефералов'
    },
    {
      icon: 'Infinity',
      title: 'Навсегда',
      description: 'Вознаграждение начисляется пожизненно'
    }
  ];

  if (loading) {
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
                <div className="flex gap-2 mb-4">
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
                <p className="text-sm text-muted-foreground">
                  Код: <span className="font-mono font-bold">{referralInfo?.referral_code}</span>
                </p>
              </CardContent>
            </Card>

            {bonuses.length > 0 && (
              <Card className="mb-8 rounded-3xl border-2">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">История начислений</h2>
                  <div className="space-y-3">
                    {bonuses.map((bonus) => (
                      <div
                        key={bonus.id}
                        className="flex items-center gap-4 p-4 rounded-2xl border bg-card"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                          <Icon name="Coins" size={20} className="text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {bonus.first_name || bonus.last_name
                              ? `${bonus.first_name || ''} ${bonus.last_name || ''}`.trim()
                              : bonus.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {bonus.description}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-bold text-emerald-600">+{bonus.amount} ₽</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(bonus.created_at).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {referrals.length > 0 && (
              <Card className="mb-8 rounded-3xl border-2">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Приглашенные пользователи</h2>
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={referral.avatar_url || undefined} />
                          <AvatarFallback>
                            {referral.first_name?.[0] || referral.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {referral.first_name || referral.last_name
                              ? `${referral.first_name || ''} ${referral.last_name || ''}`.trim()
                              : referral.email}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {referral.email}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm text-muted-foreground">
                            {new Date(referral.created_at).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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