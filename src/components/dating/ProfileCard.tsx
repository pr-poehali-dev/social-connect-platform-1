import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: number;
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
  const [isFlipped, setIsFlipped] = useState(false);

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

  const formatLastSeen = (lastSeen: string) => {
    const now = new Date();
    const lastLogin = new Date(lastSeen);
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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
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

    try {
      const response = await fetch('https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d?action=create-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participantId: profile.id
        })
      });

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
        title: 'Ошибка подключения',
        description: 'Проверьте интернет-соединение',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="perspective-1000 h-[460px]">
      <div 
        className={`relative w-full h-full transition-transform duration-600 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s'
        }}
      >
        <Card 
          className="absolute w-full h-full rounded-3xl overflow-hidden border-2 backface-hidden flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div 
            className="relative flex-1 overflow-hidden cursor-pointer"
            onClick={handleFlip}
          >
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
                <div className="text-center">
                  <Icon name="ImageOff" size={64} className="text-white/80 mx-auto mb-4" />
                  <p className="text-white font-bold text-2xl tracking-wider">НЕТ ФОТО</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute top-4 right-4 flex gap-2">
              {profile.isVerified && (
                <Badge className="bg-blue-500/90 text-white rounded-full px-3 py-1 flex items-center gap-1">
                  <Icon name="BadgeCheck" size={14} />
                  Verified
                </Badge>
              )}
              {profile.isOnline && (
                <Badge className="bg-green-500/90 text-white rounded-full px-3 py-1 flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Online
                </Badge>
              )}
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <h3 
                className="text-2xl font-bold mb-1 flex items-center gap-2 cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dating/${profile.id}`);
                }}
              >
                {profile.name}{profile.age ? `, ${profile.age}` : ''}
                {showBirthdayIcon && (
                  <Icon name="Cake" size={20} className="text-yellow-300 animate-pulse" />
                )}
              </h3>
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
          
          <div className="p-4 flex items-center justify-center gap-2">
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
          </div>
        </Card>

        <Card 
          className="absolute w-full h-full rounded-3xl overflow-hidden border-2 backface-hidden rotate-y-180 flex flex-col"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div 
            className="relative flex-1 overflow-auto bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 cursor-pointer p-6"
            onClick={handleFlip}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="Info" size={20} />
              Информация
            </h3>
            
            <div className="space-y-3">
              {profile.city && (
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="MapPin" size={16} />
                  <span>{profile.city}{profile.district ? `, ${profile.district}` : ''}</span>
                </div>
              )}

              {profile.bodyType && (
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="User" size={16} />
                  <span>Телосложение: {profile.bodyType}</span>
                </div>
              )}

              {profile.maritalStatus && (
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="Heart" size={16} />
                  <span>Семейное положение: {profile.maritalStatus}</span>
                </div>
              )}

              {profile.hasChildren && (
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="Baby" size={16} />
                  <span>Дети: {profile.hasChildren}</span>
                </div>
              )}

              {profile.work && (
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="Briefcase" size={16} />
                  <span>Профессия: {profile.work}</span>
                </div>
              )}

              {profile.financialStatus && (
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="Wallet" size={16} />
                  <span>Финансовое положение: {profile.financialStatus}</span>
                </div>
              )}

              {profile.hasCar && (
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="Car" size={16} />
                  <span>Автомобиль: {profile.hasCar}</span>
                </div>
              )}

              {profile.hasHousing && (
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="Home" size={16} />
                  <span>Жилье: {profile.hasHousing}</span>
                </div>
              )}

              {profile.datingGoal && (
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="Target" size={16} />
                  <span>Цель знакомства: {profile.datingGoal}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 flex items-center justify-center gap-2 bg-white">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(profile.id);
              }}
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
              onClick={(e) => e.stopPropagation()}
            >
              <Icon name="MessageCircle" size={20} />
            </Button>
            <Button 
              variant={isFriend || isFriendRequestSent ? "secondary" : "outline"} 
              className="rounded-full px-6 h-12 gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onAddFriend(profile.id);
              }}
              disabled={isFriend || isFriendRequestSent}
            >
              <Icon name={getFriendButtonIcon()} size={20} />
              {getFriendButtonText()}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfileCard;