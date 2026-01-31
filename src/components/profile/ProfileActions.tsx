import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ProfileActionsProps {
  user?: any;
  onRequestVerification?: () => void;
}

const ProfileActions = ({ user, onRequestVerification }: ProfileActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {user && !user.is_verified && (
        <Button 
          onClick={onRequestVerification}
          variant="outline"
          className="w-full h-14 rounded-2xl border-blue-500 text-blue-500 hover:bg-blue-50"
        >
          <Icon name="BadgeCheck" size={20} className="mr-2" />
          Запросить верификацию
        </Button>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Button 
        onClick={() => navigate('/friends')}
        variant="outline"
        className="h-20 flex-col gap-2 rounded-2xl"
      >
        <Icon name="Users" size={24} />
        <span className="text-sm font-medium">Друзья</span>
      </Button>
      <Button 
        onClick={() => navigate('/my-ads')}
        variant="outline"
        className="h-20 flex-col gap-2 rounded-2xl"
      >
        <Icon name="MessageSquare" size={24} />
        <span className="text-sm font-medium">Объявления</span>
      </Button>
      <Button 
        onClick={() => navigate('/services')}
        variant="outline"
        className="h-20 flex-col gap-2 rounded-2xl"
      >
        <Icon name="Briefcase" size={24} />
        <span className="text-sm font-medium">Услуги</span>
      </Button>
      <Button 
        onClick={() => navigate('/my-events')}
        variant="outline"
        className="h-20 flex-col gap-2 rounded-2xl"
      >
        <Icon name="Calendar" size={24} />
        <span className="text-sm font-medium">Мероприятия</span>
      </Button>
      </div>
    </div>
  );
};

export default ProfileActions;