import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type IconName = 'UtensilsCrossed' | 'Music2' | 'PartyPopper' | 'Film' | 'Plane';

interface WishCategory {
  id: string;
  label: string;
  icon: IconName;
  color: string;
}

const WISH_CATEGORIES: WishCategory[] = [
  { id: 'restaurant', label: 'Ресторан', icon: 'UtensilsCrossed', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'concert', label: 'Концерт', icon: 'Music2', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'party', label: 'Вечеринка', icon: 'PartyPopper', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'cinema', label: 'Кино', icon: 'Film', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'tour', label: 'Совместный тур', icon: 'Plane', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
];

export const WISHES_STORAGE_KEY = 'user_wishes';

const Wishes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(WISHES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as string[];
      setSelected(parsed);
    }
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleSave = () => {
    localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(selected));
    toast({ title: 'Желания сохранены!' });
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4 max-w-lg">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate(-1)}>
            <Icon name="ArrowLeft" size={18} />
            Назад
          </Button>

          <Card className="rounded-3xl border-2 shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="Heart" size={28} className="text-pink-500" />
              <h1 className="text-2xl font-bold">Мои желания</h1>
            </div>
            <p className="text-muted-foreground mb-8 text-sm">
              Отметь, куда хотел(а) бы сходить. Другие смогут пригласить тебя!
            </p>

            <div className="flex flex-col gap-4">
              {WISH_CATEGORIES.map(cat => {
                const active = selected.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggle(cat.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left w-full ${
                      active
                        ? 'border-pink-400 bg-pink-50 shadow-md'
                        : 'border-border bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                      <Icon name={cat.icon} size={24} />
                    </div>
                    <span className="text-lg font-semibold flex-1">{cat.label}</span>
                    {active && (
                      <Badge className="bg-pink-500 text-white border-0">
                        <Icon name="Check" size={14} className="mr-1" />
                        Добавлено
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            <Button
              onClick={handleSave}
              className="w-full mt-8 h-12 rounded-xl text-base font-semibold"
            >
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить желания
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Wishes;