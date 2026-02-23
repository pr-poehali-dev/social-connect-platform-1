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
import { formatLastSeen } from '@/utils/date';
import CompatibilityBadge from '@/components/horoscope/CompatibilityBadge';

const DatingProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserIsVip, setCurrentUserIsVip] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [currentUserGender, setCurrentUserGender] = useState<string | null>(null);
  const [missCanVote, setMissCanVote] = useState<{ can_vote: boolean; reason?: string; next_vote_at?: string } | null>(null);
  const [missVoting, setMissVoting] = useState(false);
  const [missRank, setMissRank] = useState<number | null>(null);

  const DATING_URL = 'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2';

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
          setCurrentUserIsVip(userData.is_vip || false);
          setCurrentUserGender(userData.gender || null);
          
          if (userData.share_location && userData.latitude && userData.longitude) {
            setCurrentUserLocation({
              latitude: userData.latitude,
              longitude: userData.longitude
            });
          }

          if (userData.gender === 'male') {
            try {
              const voteRes = await fetch(`${DATING_URL}?action=miss-can-vote`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (voteRes.ok) setMissCanVote(await voteRes.json());
            } catch (e) {
              console.error(e);
            }
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

          if (userProfile.gender === 'female' && userProfile.user_id) {
            fetch(`${DATING_URL}?action=miss-leaderboard`)
              .then(r => r.json())
              .then(data => {
                const found = (data.leaderboard || []).find((c: { user_id: number; rank: number }) => c.user_id === userProfile.user_id);
                if (found) setMissRank(found.rank);
              })
              .catch(() => {});
          }

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

  const handleMissVote = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }
    setMissVoting(true);
    try {
      const res = await fetch(`${DATING_URL}?action=miss-vote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestant_user_id: profile?.user_id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: '👑 Голос принят!', description: 'Спасибо за участие в конкурсе' });
        setMissCanVote({ can_vote: false, reason: 'cooldown' });
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setMissVoting(false);
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
                    onClick={handleMissVote}
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
        </div>
      </div>
      </div>
    </div>
  );
};

export default DatingProfile;