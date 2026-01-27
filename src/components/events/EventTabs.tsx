import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface EventTabsProps {
  activeTab: 'my' | 'participating' | 'completed';
  myEventsCount: number;
  participatingEventsCount: number;
  completedEventsCount: number;
  onTabChange: (tab: 'my' | 'participating' | 'completed') => void;
  onCreateClick: () => void;
}

const EventTabs = ({
  activeTab,
  myEventsCount,
  participatingEventsCount,
  completedEventsCount,
  onTabChange,
  onCreateClick
}: EventTabsProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <Button
        variant={activeTab === 'my' ? 'default' : 'outline'}
        className="gap-2 rounded-2xl"
        onClick={() => onTabChange('my')}
      >
        <Icon name="Calendar" size={18} />
        Мои мероприятия ({myEventsCount})
      </Button>
      <Button
        variant={activeTab === 'participating' ? 'default' : 'outline'}
        className="gap-2 rounded-2xl"
        onClick={() => onTabChange('participating')}
      >
        <Icon name="UserPlus" size={18} />
        Участвую ({participatingEventsCount})
      </Button>
      <Button
        variant={activeTab === 'completed' ? 'default' : 'outline'}
        className="gap-2 rounded-2xl"
        onClick={() => onTabChange('completed')}
      >
        <Icon name="CheckCircle2" size={18} />
        Завершенные ({completedEventsCount})
      </Button>
      <Button
        className="gap-2 rounded-2xl ml-auto"
        onClick={onCreateClick}
      >
        <Icon name="Plus" size={18} />
        Создать новое мероприятие
      </Button>
    </div>
  );
};

export default EventTabs;
