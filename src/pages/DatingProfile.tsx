import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ProfileHeader from '@/components/dating/ProfileHeader';
import ProfileActions from '@/components/dating/ProfileActions';
import ProfileInfo from '@/components/dating/ProfileInfo';
import PhotoGallery from '@/components/dating/PhotoGallery';

const DatingProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  
  const photos = [
    profile?.image,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800'
  ].filter(Boolean);

  useEffect(() => {
    loadProfile();
    loadCurrentUser();
  }, [userId]);

  const loadCurrentUser = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=profiles`
      );

      if (response.ok) {
        const data = await response.json();
        const userProfile = data.profiles?.find((p: any) => p.id === parseInt(userId || '0'));
        
        if (userProfile) {
          setProfile({
            id: userProfile.id,
            user_id: userProfile.user_id,
            name: userProfile.name,
            age: userProfile.age,
            city: userProfile.city,
            district: userProfile.district,
            gender: userProfile.gender,
            image: userProfile.avatar_url,
            isOnline: userProfile.is_online,
            lastSeen: userProfile.is_online ? null : '2 часа назад',
            height: userProfile.height,
            physique: userProfile.body_type,
            about: userProfile.bio,
            interests: userProfile.interests || [],
            is_favorite: userProfile.is_favorite,
            friend_request_sent: userProfile.friend_request_sent,
            is_friend: userProfile.is_friend,
          });
          setIsFavorite(userProfile.is_favorite);
          setRequestSent(userProfile.friend_request_sent);
          setIsFriend(userProfile.is_friend);
        } else {
          toast({
            title: 'Профиль не найден',
            description: 'Пользователь не существует',
            variant: 'destructive',
          });
          navigate('/dating');
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить профиль',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!profile) return;
    
    try {
      const response = await fetch(
        'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=friend-request',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to_user_id: profile.user_id })
        }
      );

      if (response.ok) {
        setRequestSent(true);
        toast({
          title: 'Заявка отправлена',
          description: 'Ожидайте подтверждения'
        });
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!profile) return;
    
    try {
      const action = isFavorite ? 'unfavorite' : 'favorite';
      const response = await fetch(
        `https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=${action}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: profile.id })
        }
      );

      if (response.ok) {
        setIsFavorite(!isFavorite);
        toast({
          title: isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное'
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить избранное',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = () => {
    navigate('/messages');
  };

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
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <div className="max-w-4xl mx-auto pt-20">
        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          <div className="md:sticky md:top-20 h-fit space-y-4">
            <ProfileHeader
              profile={profile}
              isOwnProfile={isOwnProfile}
              isFavorite={isFavorite}
              onBack={() => navigate(-1)}
              onToggleFavorite={handleToggleFavorite}
            />
            
            <div className="px-4 md:px-0">
              <ProfileActions
                isOwnProfile={isOwnProfile}
                isFriend={isFriend}
                requestSent={requestSent}
                onSendMessage={handleSendMessage}
                onAddFriend={handleAddFriend}
                onEditProfile={() => navigate('/profile')}
              />
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <span className="text-2xl text-muted-foreground">{profile.age}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span>
                    {profile.isOnline ? 'Онлайн' : profile.lastSeen ? `Был(а) в сети ${profile.lastSeen}` : 'Был(а) в сети давно'}
                  </span>
                </div>
              </div>
            </div>

            <ProfileInfo profile={profile} />

            <PhotoGallery photos={photos} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatingProfile;