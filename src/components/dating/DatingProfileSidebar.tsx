import { useNavigate } from 'react-router-dom';
import ProfileHeader from '@/components/dating/ProfileHeader';
import ProfileActions from '@/components/dating/ProfileActions';

interface DatingProfileSidebarProps {
  profile: any;
  isOwnProfile: boolean;
  isFavorite: boolean;
  isFriend: boolean;
  requestSent: boolean;
  onToggleFavorite: () => void;
  onSendMessage: () => void;
  onAddFriend: () => void;
  recipientId?: number;
  recipientName?: string;
}

const DatingProfileSidebar = ({
  profile,
  isOwnProfile,
  isFavorite,
  isFriend,
  requestSent,
  onToggleFavorite,
  onSendMessage,
  onAddFriend,
  recipientId,
  recipientName,
}: DatingProfileSidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="md:sticky md:top-20 h-fit">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFavorite={isFavorite}
        onBack={() => navigate(-1)}
        onToggleFavorite={onToggleFavorite}
      />

      <div className="hidden md:block mt-4">
        <ProfileActions
          isOwnProfile={isOwnProfile}
          isFriend={isFriend}
          requestSent={requestSent}
          onSendMessage={onSendMessage}
          onAddFriend={onAddFriend}
          onEditProfile={() => navigate('/profile')}
          recipientId={recipientId}
          recipientName={recipientName}
        />
      </div>
    </div>
  );
};

export default DatingProfileSidebar;
