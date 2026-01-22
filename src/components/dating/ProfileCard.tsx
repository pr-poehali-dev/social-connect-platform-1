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
  distance?: number;
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
      const response = await fetch('https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'create_conversation',
          userId: profile.id
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
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-2xl font-bold mb-1">{profile.name}{profile.age ? `, ${profile.age}` : ''}</h3>
              <div className="space-y-1">
                {profile.city && (
                  <p className="flex items-center gap-1 text-sm">
                    <Icon name="MapPin" size={14} />
                    {profile.city}
                  </p>
                )}
                {profile.distance !== undefined && (
                  <p className="flex items-center gap-1 text-sm">
                    <Icon name="Navigation" size={14} />
                    {profile.distance < 1 ? `${Math.round(profile.distance * 1000)} м` : `${profile.distance} км`} от вас
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
            className="relative flex-1 overflow-auto p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 cursor-pointer"
            onClick={handleFlip}
          >
            <h3 className="text-xl font-bold mb-4">О себе</h3>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
              
              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2">Интересы:</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="rounded-full text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.height && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Ruler" size={16} className="text-muted-foreground" />
                  <span className="font-medium">Рост:</span>
                  <span>{profile.height} см</span>
                </div>
              )}

              {profile.bodyType && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="User" size={16} className="text-muted-foreground" />
                  <span className="font-medium">Телосложение:</span>
                  <span>{profile.bodyType}</span>
                </div>
              )}

              {profile.maritalStatus && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Heart" size={16} className="text-muted-foreground" />
                  <span className="font-medium">Семейное положение:</span>
                  <span>{profile.maritalStatus}</span>
                </div>
              )}

              {profile.hasChildren && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Baby" size={16} className="text-muted-foreground" />
                  <span className="font-medium">Дети:</span>
                  <span>{profile.hasChildren}</span>
                </div>
              )}

              {profile.education && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="GraduationCap" size={16} className="text-muted-foreground" />
                  <span className="font-medium">Образование:</span>
                  <span>{profile.education}</span>
                </div>
              )}

              {profile.work && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Briefcase" size={16} className="text-muted-foreground" />
                  <span className="font-medium">Работа:</span>
                  <span>{profile.work}</span>
                </div>
              )}

              {profile.financialStatus && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="DollarSign" size={16} className="text-muted-foreground" />
                  <span className="font-medium">Финансы:</span>
                  <span>{profile.financialStatus}</span>
                </div>
              )}

              {profile.hasCar && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Car" size={16} className="text-muted-foreground" />
                  <span className="font-medium">Авто:</span>
                  <span>{profile.hasCar}</span>
                </div>
              )}

              {profile.hasHousing && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Home" size={16} className="text-muted-foreground" />
                  <span className="font-medium">Жильё:</span>
                  <span>{profile.hasHousing}</span>
                </div>
              )}

              {profile.datingGoal && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Target" size={16} className="text-muted-foreground" />
                  <span className="font-medium">Цель знакомства:</span>
                  <span>{profile.datingGoal}</span>
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