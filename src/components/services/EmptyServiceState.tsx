import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface EmptyServiceStateProps {
  onAddService: () => void;
}

const EmptyServiceState = ({ onAddService }: EmptyServiceStateProps) => {
  return (
    <Card className="p-12 text-center">
      <Icon name="Briefcase" size={48} className="mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold mb-2">У вас пока нет услуг</h3>
      <p className="text-gray-600 mb-4">Добавьте свою первую услугу, чтобы другие пользователи могли её найти</p>
      <Button onClick={onAddService}>Добавить услугу</Button>
    </Card>
  );
};

export default EmptyServiceState;
