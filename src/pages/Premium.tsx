import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/1a9ecaa4-2882-4498-965a-c16eb32920ec';

interface PremiumPlan {
  key: string;
  name: string;
  price: number;
  duration: string;
  months: number;
  savings?: string;
  popular?: boolean;
}

const Premium = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${ADMIN_API}?action=get_prices`);
      
      if (response.ok) {
        const data = await response.json();
        const prices = data.prices;
        
        const premiumPlans: PremiumPlan[] = [
          {
            key: 'premium_month',
            name: '1 месяц',
            price: prices.premium_month?.price || 299,
            duration: 'месяц',
            months: 1
          },
          {
            key: 'premium_3months',
            name: '3 месяца',
            price: prices.premium_3months?.price || 699,
            duration: '3 месяца',
            months: 3,
            savings: 'Выгода 20%',
            popular: true
          },
          {
            key: 'premium_6months',
            name: '6 месяцев',
            price: prices.premium_6months?.price || 1199,
            duration: '6 месяцев',
            months: 6,
            savings: 'Выгода 33%'
          },
          {
            key: 'premium_year',
            name: '1 год',
            price: prices.premium_year?.price || 1999,
            duration: 'год',
            months: 12,
            savings: 'Выгода 44%'
          }
        ];
        
        setPlans(premiumPlans);
      }
    } catch (error) {
      console.error('Failed to load prices:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить тарифы',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan: PremiumPlan) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setPurchasing(plan.key);
    
    try {
      // TODO: Интеграция с платёжной системой
      toast({
        title: 'Оформление подписки',
        description: `Переход к оплате ${plan.name} Premium за ${plan.price}₽`,
      });
      
      // Временная заглушка - в будущем здесь будет редирект на платёжную систему
      setTimeout(() => {
        setPurchasing(null);
      }, 2000);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось оформить подписку',
        variant: 'destructive'
      });
      setPurchasing(null);
    }
  };

  const features = [
    {
      icon: 'Megaphone',
      title: 'Размещение объявлений',
      description: 'Публикуйте неограниченное количество объявлений'
    },
    {
      icon: 'Briefcase',
      title: 'Предложение услуг',
      description: 'Создавайте и продвигайте свои услуги'
    },
    {
      icon: 'Calendar',
      title: 'Создание мероприятий',
      description: 'Организуйте события и приглашайте участников'
    },
    {
      icon: 'Filter',
      title: 'Расширенные фильтры',
      description: 'Подробная настройка поиска в знакомствах'
    },
    {
      icon: 'Sparkles',
      title: 'Красивые фоны профиля',
      description: 'Выделяйтесь среди других пользователей'
    },
    {
      icon: 'BadgeCheck',
      title: 'Premium значок',
      description: 'Золотая корона на вашем профиле'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full mb-6">
              <Icon name="Crown" size={24} />
              <span className="font-bold text-lg">ConnectHub Premium</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Откройте все возможности платформы
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Получите доступ к премиум-функциям и выделяйтесь среди других пользователей
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {plans.map((plan) => (
              <Card 
                key={plan.key}
                className={`relative rounded-3xl border-2 ${
                  plan.popular 
                    ? 'border-yellow-400 shadow-xl shadow-yellow-400/20' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1">
                      Популярный
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">₽</span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.duration}
                  </CardDescription>
                  {plan.savings && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-green-600">
                        {plan.savings}
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  <Button 
                    className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                    onClick={() => handlePurchase(plan)}
                    disabled={purchasing === plan.key}
                  >
                    {purchasing === plan.key ? (
                      <>
                        <Icon name="Loader2" size={18} className="animate-spin mr-2" />
                        Обработка...
                      </>
                    ) : (
                      'Оформить'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="rounded-2xl">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                    <Icon name={feature.icon as any} size={24} className="text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card className="rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Часто задаваемые вопросы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Как оплатить подписку?</h3>
                <p className="text-muted-foreground">
                  Выберите подходящий тариф и нажмите "Оформить". Вы будете перенаправлены на безопасную страницу оплаты.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Автоматически ли продлевается подписка?</h3>
                <p className="text-muted-foreground">
                  Нет, подписка не продлевается автоматически. По окончании срока вы можете оформить её заново.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Можно ли вернуть деньги?</h3>
                <p className="text-muted-foreground">
                  Возврат возможен в течение 7 дней с момента покупки, если услуга не была использована.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Premium;
