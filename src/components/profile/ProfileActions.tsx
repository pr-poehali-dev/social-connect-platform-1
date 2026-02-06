import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ProfileActionsProps {
  user?: any;
  verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  onRequestVerification?: () => void;
}

const defaultVerificationHandler = () => {
  // Заглушка для верификации
  console.log('Verification requested');
};

const ProfileActions = ({ user, verificationStatus = 'none', onRequestVerification = defaultVerificationHandler }: ProfileActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePremiumAction = (action: string) => {
    if (!user?.is_vip) {
      toast({
        title: 'Premium функция',
        description: 'Эта возможность доступна только для Premium пользователей',
        action: (
          <Button 
            size="sm" 
            onClick={() => navigate('/premium')}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
          >
            Оформить Premium
          </Button>
        ),
      });
      return;
    }
    
    if (action === 'ads') navigate('/my-ads');
    if (action === 'services') navigate('/my-services');
    if (action === 'events') navigate('/my-events');
  };

  return (
    <div className="space-y-3">
      {user && !user.is_verified && verificationStatus === 'none' && (
        <Button 
          onClick={onRequestVerification}
          variant="outline"
          className="w-full h-14 rounded-2xl border-blue-500 text-blue-500 hover:bg-blue-50"
        >
          <Icon name="BadgeCheck" size={20} className="mr-2" />
          Запросить верификацию
        </Button>
      )}
      
      {user && !user.is_verified && verificationStatus === 'pending' && (
        <Button 
          variant="outline"
          disabled
          className="w-full h-14 rounded-2xl border-yellow-500 text-yellow-600 bg-yellow-50"
        >
          <Icon name="Clock" size={20} className="mr-2" />
          Идёт проверка
        </Button>
      )}
      
      {user && !user.is_verified && verificationStatus === 'rejected' && (
        <Button 
          onClick={onRequestVerification}
          variant="outline"
          className="w-full h-14 rounded-2xl border-red-500 text-red-600 hover:bg-red-50"
        >
          <Icon name="XCircle" size={20} className="mr-2" />
          Верификация отклонена - попробовать снова
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
        onClick={() => handlePremiumAction('ads')}
        variant="outline"
        className="h-20 flex-col gap-2 rounded-2xl relative"
      >
        {!user?.is_vip && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <Icon name="Lock" size={12} className="text-white" />
          </div>
        )}
        <Icon name="MessageSquare" size={24} />
        <span className="text-sm font-medium">Объявления</span>
      </Button>
      <Button 
        onClick={() => handlePremiumAction('services')}
        variant="outline"
        className="h-20 flex-col gap-2 rounded-2xl relative"
      >
        {!user?.is_vip && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <Icon name="Lock" size={12} className="text-white" />
          </div>
        )}
        <Icon name="Briefcase" size={24} />
        <span className="text-sm font-medium">Услуги</span>
      </Button>
      <Button 
        onClick={() => handlePremiumAction('events')}
        variant="outline"
        className="h-20 flex-col gap-2 rounded-2xl relative"
      >
        {!user?.is_vip && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <Icon name="Lock" size={12} className="text-white" />
          </div>
        )}
        <Icon name="Calendar" size={24} />
        <span className="text-sm font-medium">Мероприятия</span>
      </Button>
      </div>
    </div>
  );
};

export default ProfileActions;