import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface MyEventsHeaderProps {
  onCreateClick: () => void;
}

const MyEventsHeader = ({ onCreateClick }: MyEventsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Мои мероприятия</h1>
        <p className="text-muted-foreground">Управляйте своими мероприятиями</p>
      </div>
      <Button 
        onClick={onCreateClick}
        className="gap-2 rounded-xl"
        size="lg"
      >
        <Icon name="Plus" size={20} />
        Создать
      </Button>
    </div>
  );
};

export default MyEventsHeader;
