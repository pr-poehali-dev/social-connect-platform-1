import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ProfileActionsProps {
  isOwnProfile: boolean;
  isFriend: boolean;
  requestSent: boolean;
  onSendMessage: () => void;
  onAddFriend: () => void;
  onEditProfile: () => void;
}

const ProfileActions = ({ 
  isOwnProfile, 
  isFriend, 
  requestSent, 
  onSendMessage, 
  onAddFriend, 
  onEditProfile 
}: ProfileActionsProps) => {
  if (isOwnProfile) {
    return (
      <Button 
        onClick={onEditProfile}
        variant="outline"
        className="w-full rounded-xl h-12 text-base font-semibold"
      >
        <Icon name="Settings" size={20} className="mr-2" />
        Редактировать профиль
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button 
        onClick={onSendMessage}
        className="w-full rounded-xl h-12 text-base font-semibold"
      >
        <Icon name="MessageCircle" size={20} className="mr-2" />
        Написать
      </Button>
      {!isFriend && !requestSent ? (
        <Button 
          onClick={onAddFriend}
          variant="outline"
          className="w-full rounded-xl h-12 text-base font-semibold"
        >
          <Icon name="UserPlus" size={20} className="mr-2" />
          Добавить в друзья
        </Button>
      ) : requestSent ? (
        <Button 
          variant="outline"
          disabled
          className="w-full rounded-xl h-12 text-base"
        >
          <Icon name="Clock" size={20} className="mr-2" />
          Заявка отправлена
        </Button>
      ) : (
        <Button 
          variant="outline"
          className="w-full rounded-xl h-12 text-base font-semibold"
        >
          <Icon name="UserCheck" size={20} className="mr-2" />
          В друзьях
        </Button>
      )}
    </div>
  );
};

export default ProfileActions;