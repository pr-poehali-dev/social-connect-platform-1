import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ProfileStatsProps {
  stats: Array<{
    icon: string;
    label: string;
    value: string;
    color: string;
  }>;
}

const ProfileStats = ({ stats }: ProfileStatsProps) => {
  const navigate = useNavigate();

  return (
    <>
      <div>
        <h3 className="text-xl font-bold mb-4">Статистика</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="rounded-2xl border-2">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon name={stat.icon} size={20} className="text-white" />
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Быстрые действия</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Button variant="outline" className="justify-start gap-3 h-auto py-4 rounded-2xl" onClick={() => navigate('/dating')}>
            <Icon name="Heart" size={24} className="text-pink-500" />
            <div className="text-left">
              <p className="font-semibold">Начать знакомства</p>
              <p className="text-xs text-muted-foreground">Найдите интересных людей</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start gap-3 h-auto py-4 rounded-2xl" onClick={() => navigate('/services')}>
            <Icon name="Briefcase" size={24} className="text-blue-500" />
            <div className="text-left">
              <p className="font-semibold">Создать услугу</p>
              <p className="text-xs text-muted-foreground">Начните зарабатывать</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start gap-3 h-auto py-4 rounded-2xl" onClick={() => navigate('/wallet')}>
            <Icon name="Wallet" size={24} className="text-amber-500" />
            <div className="text-left">
              <p className="font-semibold">Пополнить кошелёк</p>
              <p className="text-xs text-muted-foreground">Баланс: 0 ₽</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start gap-3 h-auto py-4 rounded-2xl" onClick={() => navigate('/referral')}>
            <Icon name="Users" size={24} className="text-emerald-500" />
            <div className="text-left">
              <p className="font-semibold">Реферальная ссылка</p>
              <p className="text-xs text-muted-foreground">Приглашайте друзей</p>
            </div>
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProfileStats;
