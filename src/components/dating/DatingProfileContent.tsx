import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ProfileActions from '@/components/dating/ProfileActions';
import ProfileInfo from '@/components/dating/ProfileInfo';
import PhotoGallery from '@/components/dating/PhotoGallery';
import ReceivedGifts from '@/components/dating/ReceivedGifts';
import CompatibilityBadge from '@/components/horoscope/CompatibilityBadge';
import { formatLastSeen } from '@/utils/date';

interface MissCanVote {
  can_vote: boolean;
  reason?: string;
  next_vote_at?: string;
}

interface DatingProfileContentProps {
  profile: any;
  isOwnProfile: boolean;
  isFriend: boolean;
  requestSent: boolean;
  currentUserIsVip: boolean;
  currentUserGender: string | null;
  distance: string | null;
  photos: any[];
  missCanVote: MissCanVote | null;
  missVoting: boolean;
  missRank: number | null;
  onSendMessage: () => void;
  onAddFriend: () => void;
  onMissVote: () => void;
}

const DatingProfileContent = ({
  profile,
  isOwnProfile,
  isFriend,
  requestSent,
  currentUserIsVip,
  currentUserGender,
  distance,
  photos,
  missCanVote,
  missVoting,
  missRank,
  onSendMessage,
  onAddFriend,
  onMissVote,
}: DatingProfileContentProps) => {
  const navigate = useNavigate();

  return (
    <div className="px-4 md:px-6 md:py-0 py-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
            {profile.is_verified ? (
              <Icon name="BadgeCheck" size={20} className="text-blue-500 md:w-6 md:h-6" />
            ) : (
              <Icon name="BadgeCheck" size={20} className="text-gray-400 md:w-6 md:h-6" />
            )}
            {profile.age && (
              <span className="text-xl md:text-2xl text-muted-foreground">{profile.age}</span>
            )}
            {profile.is_vip && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full flex items-center gap-1.5">
                <Icon name="Crown" size={16} />
                <span className="font-bold text-xs">Premium</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>
              {profile.isOnline ? 'Онлайн' : `Был(а) в сети ${formatLastSeen(profile.lastSeen)}`}
            </span>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <ProfileActions
          isOwnProfile={isOwnProfile}
          isFriend={isFriend}
          requestSent={requestSent}
          onSendMessage={onSendMessage}
          onAddFriend={onAddFriend}
          onEditProfile={() => navigate('/profile')}
          recipientId={profile?.user_id}
          recipientName={profile?.name}
        />
      </div>

      {!isOwnProfile && profile.user_id && (
        <CompatibilityBadge targetUserId={profile.user_id} targetName={profile.name} />
      )}

      <ProfileInfo
        profile={{ ...profile, distance }}
        isOwnProfile={isOwnProfile}
        contactPrice={profile?.contact_price || 0}
        currentUserIsVip={currentUserIsVip}
      />

      {profile.gender === 'female' && !isOwnProfile && currentUserGender === 'male' && missRank && (
        <div className="rounded-2xl border border-pink-200 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-950/20 p-4 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-pink-600 dark:text-pink-400">
              <span>👑</span>
              <span>MISS LOVEIS</span>
            </div>
            {missCanVote?.can_vote ? (
              <div className="text-xs text-muted-foreground mt-0.5">Проголосуй за {profile.name} — 1 токен LOVE</div>
            ) : missCanVote?.reason === 'cooldown' ? (
              <div className="text-xs text-muted-foreground mt-0.5">Вы уже голосовали. Следующий голос через 30 дней</div>
            ) : missCanVote?.reason === 'no_tokens' ? (
              <div className="text-xs text-muted-foreground mt-0.5">Нет токенов LOVE для голосования</div>
            ) : (
              <div className="text-xs text-muted-foreground mt-0.5">Участница конкурса красоты</div>
            )}
          </div>
          {missCanVote?.can_vote && (
            <Button
              size="sm"
              onClick={onMissVote}
              disabled={missVoting}
              className="bg-pink-500 hover:bg-pink-600 text-white shrink-0"
            >
              {missVoting ? '...' : '❤️ Голос'}
            </Button>
          )}
        </div>
      )}

      {isOwnProfile && profile.gender === 'female' && missRank && (
        <div className="rounded-2xl border border-yellow-200 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-950/20 p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-yellow-600 dark:text-yellow-400">
              <span>👑</span>
              <span>MISS LOVEIS</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Ваше место в конкурсе</div>
          </div>
          <div className="text-2xl font-bold text-yellow-500">#{missRank}</div>
        </div>
      )}

      <PhotoGallery photos={photos} userId={profile.user_id} canLike={!isOwnProfile} />

      <ReceivedGifts userId={profile.user_id} isOwnProfile={isOwnProfile} />
    </div>
  );
};

export default DatingProfileContent;
