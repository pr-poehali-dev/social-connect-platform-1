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

      <div className="grid grid-cols-4 gap-2">
        <Button
          onClick={() => navigate('/friends')}
          variant="outline"
          className="h-20 rounded-2xl flex flex-col items-center justify-center gap-1"
        >
          <Icon name="Users" size={24} />
          <span className="text-xs">Друзья</span>
        </Button>
        
        <Button
          onClick={() => handlePremiumAction('ads')}
          variant="outline"
          className="h-20 rounded-2xl flex flex-col items-center justify-center gap-1 relative"
        >
          <Icon name="ShoppingBag" size={24} />
          <span className="text-xs">Объявления</span>
          {!user?.is_vip && (
            <Icon 
              name="Crown" 
              size={14} 
              className="absolute top-2 right-2 text-yellow-500" 
            />
          )}
        </Button>

        <Button
          onClick={() => handlePremiumAction('services')}
          variant="outline"
          className="h-20 rounded-2xl flex flex-col items-center justify-center gap-1 relative"
        >
          <Icon name="Briefcase" size={24} />
          <span className="text-xs">Услуги</span>
          {!user?.is_vip && (
            <Icon 
              name="Crown" 
              size={14} 
              className="absolute top-2 right-2 text-yellow-500" 
            />
          )}
        </Button>

        <Button
          onClick={() => handlePremiumAction('events')}
          variant="outline"
          className="h-20 rounded-2xl flex flex-col items-center justify-center gap-1 relative"
        >
          <Icon name="Calendar" size={24} />
          <span className="text-xs">Мероприятия</span>
          {!user?.is_vip && (
            <Icon 
              name="Crown" 
              size={14} 
              className="absolute top-2 right-2 text-yellow-500" 
            />
          )}
        </Button>
      </div>

    </div>
  );
};

export default ProfileActions;