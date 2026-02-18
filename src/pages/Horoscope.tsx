import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Navigation from '@/components/Navigation';
import DailyHoroscope from '@/components/horoscope/DailyHoroscope';
import NatalChart from '@/components/horoscope/NatalChart';
import Compatibility from '@/components/horoscope/Compatibility';

type Tab = 'horoscope' | 'natal' | 'compatibility';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'horoscope', label: 'Гороскоп', icon: 'Star' },
  { id: 'natal', label: 'Натальная карта', icon: 'Compass' },
  { id: 'compatibility', label: 'Совместимость', icon: 'Heart' },
];

const Horoscope = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('horoscope');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-20 pb-24 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Астрология
            </h1>
            <p className="text-sm text-muted-foreground">Гороскопы, натальная карта и совместимость</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className="rounded-full gap-1.5 whitespace-nowrap"
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === 'horoscope' && <DailyHoroscope />}
        {activeTab === 'natal' && <NatalChart />}
        {activeTab === 'compatibility' && <Compatibility />}
      </div>
    </div>
  );
};

export default Horoscope;
