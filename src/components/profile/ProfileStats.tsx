import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const ProfileStats = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: 'Users', label: 'Друзья', count: 0, color: 'from-purple-500 to-indigo-500', route: '/friends' },
    { icon: 'MessageSquare', label: 'Мои объявления', count: 0, color: 'from-pink-500 to-rose-500', route: '/my-ads' },
    { icon: 'Briefcase', label: 'Мои услуги', count: 0, color: 'from-blue-500 to-cyan-500', route: '/my-services' },
    { icon: 'Users', label: 'Мои рефералы', count: 0, color: 'from-emerald-500 to-teal-500', route: '/referral' }
  ];

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Быстрый доступ</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {menuItems.map((item, index) => (
          <Card 
            key={index} 
            className="rounded-2xl border-2 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(item.route)}
          >
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                <Icon name={item.icon} size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold mb-1">{item.count}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfileStats;