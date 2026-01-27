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
    <div className="flex gap-2 mb-8 overflow-x-auto">
      <Button
        variant={activeTab === 'my' ? 'default' : 'outline'}
        className="gap-1 rounded-2xl whitespace-nowrap text-xs px-3 py-2 flex-shrink-0"
        onClick={() => onTabChange('my')}
      >
        <Icon name="Calendar" size={16} />
        Мои ({myEventsCount})
      </Button>
      <Button
        variant={activeTab === 'participating' ? 'default' : 'outline'}
        className="gap-1 rounded-2xl whitespace-nowrap text-xs px-3 py-2 flex-shrink-0"
        onClick={() => onTabChange('participating')}
      >
        <Icon name="UserPlus" size={16} />
        Участвую ({participatingEventsCount})
      </Button>
      <Button
        variant={activeTab === 'completed' ? 'default' : 'outline'}
        className="gap-1 rounded-2xl whitespace-nowrap text-xs px-3 py-2 flex-shrink-0"
        onClick={() => onTabChange('completed')}
      >
        <Icon name="CheckCircle2" size={16} />
        Завершены ({completedEventsCount})
      </Button>
      <Button
        className="gap-2 rounded-2xl ml-auto hidden lg:flex"
        onClick={onCreateClick}
      >
        <Icon name="Plus" size={18} />
        Создать новое мероприятие
      </Button>
    </div>
  );
};

export default EventTabs;