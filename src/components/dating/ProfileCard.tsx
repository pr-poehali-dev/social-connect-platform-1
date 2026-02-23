import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { getBackgroundClass, getBackgroundStyle } from '@/utils/premiumBackgrounds';
import { formatLastSeen } from '@/utils/date';
import CompatibilityMini from '@/components/horoscope/CompatibilityMini';

interface Profile {
  id: number;
  user_id?: number;
  name: string;
  age: number;
  birth_date?: string;
  city: string;
  interests: string[];
  bio: string;
  image: string;
  height?: number;
  bodyType?: string;
  maritalStatus?: string;
  hasChildren?: string;
  education?: string;
  work?: string;
  financialStatus?: string;
  hasCar?: string;
  hasHousing?: string;
  datingGoal?: string;
  distance?: string | null;
  isOnline?: boolean;
  lastSeen?: string;
  isVerified?: boolean;
  status_text?: string;
  is_vip?: boolean;
  profile_background?: string;
  is_current_user?: boolean;
  zodiac_sign?: string;
}

interface ProfileCardProps {
  profile: Profile;
  isFavorite: boolean;
  isFriendRequestSent: boolean;
  isFriend: boolean;
  onToggleFavorite: (id: number) => void;
  onAddFriend: (id: number) => void;
}

const ProfileCard = ({
  profile,
  isFavorite,
  isFriendRequestSent,
  isFriend,
  onToggleFavorite,
  onAddFriend,
}: ProfileCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isHovering, setIsHovering] = useState(false);
  const [animatedVideo, setAnimatedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const animateEnabled = localStorage.getItem('animateAvatar') !== 'false';

  const isBirthday = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
  };

  const showBirthdayIcon = profile.birth_date && isBirthday(profile.birth_date);

  const getFriendButtonText = () => {
    if (isFriend) return 'Уже в друзьях';
    if (isFriendRequestSent) return 'Заявка отправлена';
    return 'Добавить в друзья';
  };

  const getFriendButtonIcon = () => {
    if (isFriend) return 'UserCheck';
    if (isFriendRequestSent) return 'Clock';
    return 'UserPlus';
  };





  const handleOpenChat = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт для отправки сообщений',
        variant: 'destructive',
      });
      return;
    }

    const participantId = profile.user_id || profile.id;
    
    console.log('[ProfileCard] Opening chat with profile:', profile);
    console.log('[ProfileCard] Profile ID:', profile.id, 'User ID:', profile.user_id);
    console.log('[ProfileCard] Sending participantId:', participantId);
    
    try {
      const response = await fetch('https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d?action=create-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participantId: participantId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[ProfileCard] Created conversation:', data);
        console.log('[ProfileCard] Navigating to chat ID:', data.conversationId);
        navigate('/messages', { state: { openChatId: data.conversationId } });
      } else {
        const errorData = await response.json();
        console.error('[ProfileCard] Failed to create conversation:', errorData);
        toast({
          title: 'Ошибка',
          description: 'Не удалось создать чат',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[ProfileCard] Failed to create conversation:', error);
      toast({
        title: 'Ошибка подключения',
        description: 'Проверьте интернет-соединение',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="h-[460px] group">
        <Card 
          className={`w-full h-full rounded-3xl overflow-hidden border-2 flex flex-col transition-all duration-300 ${
            profile.is_vip 
              ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] group-hover:shadow-[0_0_30px_rgba(250,204,21,0.7)] group-hover:scale-105' 
              : 'group-hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] group-hover:scale-105'
          }`}
        >
          <div 
            className="relative flex-1 overflow-hidden cursor-pointer"
            onClick={() => navigate(`/dating/${profile.user_id || profile.id}`)}
          >
            {profile.image ? (
              <div 
                className="relative w-full h-full"
                onMouseEnter={async () => {
                  if (!animateEnabled) return;
                  setIsHovering(true);
                  if (!animatedVideo && profile.image) {
                    setIsLoading(true);
                    try {
                      const animationText = localStorage.getItem('animationText') || 'Hello! Nice to meet you!';
                      const animationVoice = localStorage.getItem('animationVoice') || 'en-US-JennyNeural';
                      const animationDriver = localStorage.getItem('animationDriver') || 'bank://lively';
                      
                      const response = await fetch('https://functions.poehali.dev/d79fde84-e2a9-4f7a-b135-37b4570e1e0b', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          imageUrl: profile.image,
                          text: animationText,
                          voice: animationVoice,
                          driver: animationDriver
                        })
                      });
                      const data = await response.json();
                      if (data.videoUrl) {
                        setAnimatedVideo(data.videoUrl);
                      }
                    } catch (error) {
                      console.error('Failed to animate photo:', error);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                onMouseLeave={() => setIsHovering(false)}
              >
                {isHovering && animatedVideo ? (
                  <video
                    src={animatedVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                )}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
                <div className="text-center">
                  <Icon name="ImageOff" size={64} className="text-white/80 mx-auto mb-4" />
                  <p className="text-white font-bold text-2xl tracking-wider">НЕТ ФОТО</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            {profile.is_current_user && (
              <Badge className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg text-sm px-3 py-1 z-30">
                Это Вы
              </Badge>
            )}
            <div className="absolute top-4 right-4 flex gap-2 z-30">
              {profile.is_vip && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full px-3 py-1 flex items-center gap-1">
                  <Icon name="Crown" size={14} />
                  Premium
                </Badge>
              )}

              {profile.isOnline && (
                <Badge className="bg-green-500/90 text-white rounded-full px-3 py-1 flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Online
                </Badge>
              )}
            </div>
            <div className="absolute bottom-4 left-4 text-white z-30">
              <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
                {profile.name}{profile.age ? `, ${profile.age}` : ''}
                {profile.isVerified && (
                  <Icon name="BadgeCheck" size={20} className="text-blue-400" />
                )}
                {showBirthdayIcon && (
                  <Icon name="Cake" size={20} className="text-yellow-300 animate-pulse" />
                )}
              </h3>
              {!profile.is_current_user && profile.zodiac_sign && (
                <div className="mt-1">
                  <CompatibilityMini targetZodiacSign={profile.zodiac_sign} />
                </div>
              )}
              <div className="space-y-1">
                {profile.city && (
                  <p className="flex items-center gap-1 text-sm">
                    <Icon name="MapPin" size={14} />
                    {profile.city}
                  </p>
                )}
                {!profile.isOnline && profile.lastSeen && (
                  <p className="flex items-center gap-1 text-sm opacity-80">
                    <Icon name="Clock" size={14} />
                    {formatLastSeen(profile.lastSeen)}
                  </p>
                )}
                {profile.distance && (
                  <p className="flex items-center gap-1 text-sm">
                    <Icon name="Navigation" size={14} />
                    {profile.distance} от вас
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-3 flex items-center justify-center gap-2">
            {profile.is_current_user ? (
              <>
                <Button 
                  variant="outline" 
                  className="rounded-full px-4 h-10 gap-1.5 flex-1 text-sm"
                  onClick={() => {
                    toast({
                      title: 'Поднятие анкеты',
                      description: 'Ваша анкета будет показана в топе на 24 часа',
                    });
                  }}
                >
                  <Icon name="TrendingUp" size={16} />
                  Поднять анкету
                </Button>
                <Button 
                  className={`rounded-full px-4 h-10 gap-1.5 flex-1 text-sm ${
                    profile.is_vip 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  }`}
                  onClick={() => navigate('/premium')}
                >
                  <Icon name="Crown" size={16} />
                  {profile.is_vip ? 'Продлить' : 'Premium'}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full h-12 w-12"
                  onClick={() => onToggleFavorite(profile.id)}
                >
                  <Icon 
                    name="Star"
                    size={20} 
                    className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""}
                  />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full h-12 w-12"
                  onClick={handleOpenChat}
                >
                  <Icon name="MessageCircle" size={20} />
                </Button>
                <Button 
                  variant={isFriend || isFriendRequestSent ? "secondary" : "outline"} 
                  className="rounded-full px-6 h-12 gap-2"
                  onClick={() => onAddFriend(profile.id)}
                  disabled={isFriend || isFriendRequestSent}
                >
                  <Icon name={getFriendButtonIcon()} size={20} />
                  {getFriendButtonText()}
                </Button>
              </>
            )}
          </div>
        </Card>
    </div>
  );
};

export default ProfileCard;