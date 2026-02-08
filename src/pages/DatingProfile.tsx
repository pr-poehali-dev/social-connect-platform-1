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
import ReceivedGifts from '@/components/dating/ReceivedGifts';
import { calculateDistance, formatDistance } from '@/utils/distance';

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
  const [photos, setPhotos] = useState<any[]>([]);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<string | null>(null);

  const formatLastSeen = (lastLoginAt: string | null) => {
    if (!lastLoginAt) return 'давно';
    
    const now = new Date();
    const lastLogin = new Date(lastLoginAt);
    const diffMs = now.getTime() - lastLogin.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дн назад`;
    return lastLogin.toLocaleDateString('ru-RU');
  };

  useEffect(() => {
    loadProfile();
    loadCurrentUser();
    loadPhotos();
  }, [userId]);

  const loadPhotos = async () => {
    if (!userId) return;
    
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(
        `https://functions.poehali.dev/e762cdb2-751d-45d3-8ac1-62e736480782?action=list&user_id=${userId}`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  };

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
          
          if (userData.share_location && userData.latitude && userData.longitude) {
            setCurrentUserLocation({
              latitude: userData.latitude,
              longitude: userData.longitude
            });
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(
        `https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=profile&id=${userId}`,
        {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        }
      );

      if (response.ok) {
        const data = await response.json();
        const userProfile = data;
        console.log('Данные профиля с бэкенда:', userProfile);
        
        if (userProfile) {
          // Рассчитываем возраст из birth_date если age не пришёл с бэкенда
          let age = userProfile.age;
          if (!age && userProfile.birth_date) {
            const birthDate = new Date(userProfile.birth_date);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }
          console.log('Рассчитанный возраст:', age);

          setProfile({
            id: userProfile.id,
            user_id: userProfile.user_id,
            name: userProfile.name,
            age: age,
            city: userProfile.city,
            district: userProfile.district,
            gender: userProfile.gender,
            image: userProfile.image,
            isOnline: userProfile.isonline || false,
            lastSeen: userProfile.lastloginat,
            height: userProfile.height,
            bodyType: userProfile.bodytype,
            about: userProfile.bio,
            interests: userProfile.interests || [],
            is_favorite: userProfile.is_favorite,
            friend_request_sent: userProfile.friend_request_sent,
            is_friend: userProfile.is_friend,
            status_text: userProfile.status_text,
            is_verified: userProfile.is_verified,
            phone: userProfile.phone,
            telegram: userProfile.telegram,
            instagram: userProfile.instagram,
            marital_status: userProfile.marital_status,
            children: userProfile.children,
            financial_status: userProfile.financial_status,
            has_car: userProfile.has_car,
            has_housing: userProfile.has_housing,
            dating_goal: userProfile.dating_goal,
            profession: userProfile.profession,
            is_vip: userProfile.is_vip,
            profile_background: userProfile.profile_background,
          });
          setIsFavorite(userProfile.is_favorite);
          setRequestSent(userProfile.friend_request_sent);
          setIsFriend(userProfile.is_friend);

          if (currentUserLocation && userProfile.share_location && userProfile.latitude && userProfile.longitude) {
            const dist = calculateDistance(
              currentUserLocation.latitude,
              currentUserLocation.longitude,
              userProfile.latitude,
              userProfile.longitude
            );
            setDistance(formatDistance(dist));
          }
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
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      const action = requestSent ? 'cancel-friend-request' : 'friend-request';
      const response = await fetch(
        `https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=${action}`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ to_user_id: profile.user_id })
        }
      );

      if (response.ok) {
        setRequestSent(!requestSent);
        toast({
          title: requestSent ? 'Заявка отменена' : 'Заявка отправлена',
          description: requestSent ? '' : 'Ожидайте подтверждения'
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обработать запрос',
          variant: 'destructive',
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
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    try {
      const action = isFavorite ? 'unfavorite' : 'favorite';
      const response = await fetch(
        `https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=${action}`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profile_id: profile.id })
        }
      );

      if (response.ok) {
        setIsFavorite(!isFavorite);
        toast({
          title: isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное',
          description: isFavorite ? '' : 'Профиль сохранён в разделе Избранное'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось обновить избранное',
          variant: 'destructive',
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

  const handleSendMessage = async () => {
    if (!profile) return;
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт, чтобы отправить сообщение',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        'https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d?action=create-conversation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'personal',
            participantId: profile.user_id
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        navigate('/messages', { state: { openChatId: data.conversationId } });
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось создать чат',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    }
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
    <div className="min-h-screen pb-20 lg:pb-0 relative">
      <div className="fixed inset-0 bg-background" />
      <div className="relative z-10">
        <Navigation />
        
        <div className="max-w-4xl mx-auto lg:pt-20 pt-16">
          <div className="grid md:grid-cols-[300px_1fr] gap-0 md:gap-6">
            <div className="md:sticky md:top-20 h-fit">
              <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                isFavorite={isFavorite}
                onBack={() => navigate(-1)}
                onToggleFavorite={handleToggleFavorite}
              />
              
              <div className="hidden md:block mt-4">
                <ProfileActions
                  isOwnProfile={isOwnProfile}
                  isFriend={isFriend}
                  requestSent={requestSent}
                  onSendMessage={handleSendMessage}
                  onAddFriend={handleAddFriend}
                  onEditProfile={() => navigate('/profile')}
                  recipientId={profile?.user_id}
                  recipientName={profile?.name}
                />
              </div>
            </div>

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
                onSendMessage={handleSendMessage}
                onAddFriend={handleAddFriend}
                onEditProfile={() => navigate('/profile')}
                recipientId={profile?.user_id}
                recipientName={profile?.name}
              />
            </div>

            <ProfileInfo 
              profile={{ ...profile, distance }} 
              isOwnProfile={isOwnProfile}
              contactPrice={profile?.contact_price || 0}
            />

            {photos.length > 0 && <PhotoGallery photos={photos} canLike={!isOwnProfile} />}

            <ReceivedGifts userId={profile.user_id} isOwnProfile={isOwnProfile} />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DatingProfile;