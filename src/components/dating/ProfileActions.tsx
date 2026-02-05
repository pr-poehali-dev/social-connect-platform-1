import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import GiftPremiumDialog from './GiftPremiumDialog';
import SendGiftDialog from './SendGiftDialog';

interface ProfileActionsProps {
  isOwnProfile: boolean;
  isFriend: boolean;
  requestSent: boolean;
  onSendMessage: () => void;
  onAddFriend: () => void;
  onEditProfile: () => void;
  recipientId?: number;
  recipientName?: string;
}

const ProfileActions = ({ 
  isOwnProfile, 
  isFriend, 
  requestSent, 
  onSendMessage, 
  onAddFriend, 
  onEditProfile,
  recipientId,
  recipientName
}: ProfileActionsProps) => {
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [showSendGiftDialog, setShowSendGiftDialog] = useState(false);

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
    <>
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
            onClick={onAddFriend}
            variant="outline"
            className="w-full rounded-xl h-12 text-base font-semibold"
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
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setShowGiftDialog(true)}
            variant="outline"
            className="rounded-xl h-12 text-base font-semibold border-purple-500 text-purple-500 hover:bg-purple-50"
          >
            <Icon name="Crown" size={20} className="mr-2" />
            Premium
          </Button>
          <Button
            onClick={() => setShowSendGiftDialog(true)}
            variant="outline"
            className="rounded-xl h-12 text-base font-semibold border-pink-500 text-pink-500 hover:bg-pink-50"
          >
            <Icon name="Gift" size={20} className="mr-2" />
            Подарок
          </Button>
        </div>
      </div>

      {recipientId && recipientName && (
        <>
          <GiftPremiumDialog
            open={showGiftDialog}
            onOpenChange={setShowGiftDialog}
            recipientId={recipientId}
            recipientName={recipientName}
          />
          <SendGiftDialog
            open={showSendGiftDialog}
            onOpenChange={setShowSendGiftDialog}
            recipientId={recipientId}
            recipientName={recipientName}
          />
        </>
      )}
    </>
  );
};

export default ProfileActions;