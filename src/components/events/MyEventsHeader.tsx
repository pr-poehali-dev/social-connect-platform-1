import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface MyEventsHeaderProps {
  onCreateClick: () => void;
}

const MyEventsHeader = ({ onCreateClick }: MyEventsHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-4">Мои мероприятия</h1>
      <Button 
        onClick={onCreateClick}
        className="gap-2 rounded-xl w-full"
        size="lg"
      >
        <Icon name="Plus" size={20} />
        Создать мероприятие
      </Button>
    </div>
  );
};

export default MyEventsHeader;