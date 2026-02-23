import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useDatingProfile } from '@/hooks/useDatingProfile';
import DatingProfileSidebar from '@/components/dating/DatingProfileSidebar';
import DatingProfileContent from '@/components/dating/DatingProfileContent';

const DatingProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const {
    profile,
    loading,
    currentUserId,
    currentUserIsVip,
    isFriend,
    isFavorite,
    requestSent,
    photos,
    distance,
    currentUserGender,
    missCanVote,
    missVoting,
    missRank,
    handleAddFriend,
    handleToggleFavorite,
    handleSendMessage,
    handleMissVote,
  } = useDatingProfile(userId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-2xl mx-auto p-6">
          <Card className="p-12 text-center rounded-3xl">
            <Icon name="UserX" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Профиль не найден</h2>
            <Button onClick={() => navigate('/dating')} className="mt-4">
              Вернуться к поиску
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === profile.id;

  return (
    <div className="min-h-screen pb-20 lg:pb-0 relative">
      <div className="fixed inset-0 bg-background" />
      <div className="relative z-10">
        <Navigation />

        <div className="max-w-4xl mx-auto lg:pt-20 pt-16">
          <div className="grid md:grid-cols-[300px_1fr] gap-0 md:gap-6">
            <DatingProfileSidebar
              profile={profile}
              isOwnProfile={isOwnProfile}
              isFavorite={isFavorite}
              isFriend={isFriend}
              requestSent={requestSent}
              onToggleFavorite={handleToggleFavorite}
              onSendMessage={handleSendMessage}
              onAddFriend={handleAddFriend}
              recipientId={profile?.user_id}
              recipientName={profile?.name}
            />

            <DatingProfileContent
              profile={profile}
              isOwnProfile={isOwnProfile}
              isFriend={isFriend}
              requestSent={requestSent}
              currentUserIsVip={currentUserIsVip}
              currentUserGender={currentUserGender}
              distance={distance}
              photos={photos}
              missCanVote={missCanVote}
              missVoting={missVoting}
              missRank={missRank}
              onSendMessage={handleSendMessage}
              onAddFriend={handleAddFriend}
              onMissVote={handleMissVote}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatingProfile;
