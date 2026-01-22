import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const photos = [
    profile?.image,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800'
  ].filter(Boolean);

  const minSwipeDistance = 50;

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
    const mockProfiles: any = {
      '1': {
        id: 1,
        name: 'Александра',
        age: 24,
        city: 'Москва',
        district: 'Центральный',
        gender: 'female',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
        isOnline: true,
        lastSeen: null,
        height: 168,
        weight: 55,
        physique: 'Стройное',
        about: 'Люблю путешествовать и фотографировать. Работаю фотографом, обожаю природу и новые места. Ищу интересного собеседника для приятного общения.',
        interests: ['Путешествия', 'Фотография', 'Йога', 'Природа', 'Книги']
      },
      '2': {
        id: 2,
        name: 'Дмитрий',
        age: 28,
        city: 'Москва',
        district: 'Северный',
        gender: 'male',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
        isOnline: false,
        lastSeen: '2 часа назад',
        height: 182,
        weight: 78,
        physique: 'Спортивное',
        about: 'Занимаюсь спортом, люблю активный отдых. Тренер в фитнес-клубе. В свободное время смотрю фильмы и слушаю музыку.',
        interests: ['Спорт', 'Кино', 'Музыка', 'Путешествия']
      },
      '3': {
        id: 3,
        name: 'Елена',
        age: 26,
        city: 'Москва',
        district: 'Южный',
        gender: 'female',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800',
        isOnline: true,
        lastSeen: null,
        height: 165,
        weight: 52,
        physique: 'Стройное',
        about: 'Дизайнер, обожаю искусство и творчество. Работаю в креативном агентстве, люблю кофейни и выставки.',
        interests: ['Дизайн', 'Искусство', 'Кофе', 'Выставки', 'Творчество']
      },
      '4': {
        id: 4,
        name: 'Михаил',
        age: 30,
        city: 'Москва',
        district: 'Западный',
        gender: 'male',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        isOnline: false,
        lastSeen: 'вчера',
        height: 178,
        weight: 75,
        physique: 'Обычное',
        about: 'IT-специалист, люблю технологии и программирование. В свободное время играю в игры и читаю научную фантастику.',
        interests: ['Технологии', 'Игры', 'Книги', 'Программирование']
      },
      '5': {
        id: 5,
        name: 'Анна',
        age: 22,
        city: 'Москва',
        district: 'Восточный',
        gender: 'female',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
        isOnline: true,
        lastSeen: null,
        height: 170,
        weight: 58,
        physique: 'Стройное',
        about: 'Студентка факультета моды, интересуюсь стилем и трендами. Люблю танцевать и вести блог.',
        interests: ['Мода', 'Танцы', 'Instagram', 'Блогинг', 'Стиль']
      },
      '6': {
        id: 6,
        name: 'Максим',
        age: 27,
        city: 'Москва',
        district: 'Центральный',
        gender: 'male',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
        isOnline: false,
        lastSeen: '5 часов назад',
        height: 185,
        weight: 82,
        physique: 'Спортивное',
        about: 'Предприниматель, занимаюсь бизнесом в сфере IT. Люблю путешествовать и пробовать что-то новое.',
        interests: ['Бизнес', 'Путешествия', 'Спорт', 'Стартапы', 'Технологии']
      }
    };

    setTimeout(() => {
      const mockProfile = mockProfiles[userId || '1'];
      if (mockProfile) {
        setProfile(mockProfile);
      }
      setLoading(false);
    }, 500);
  };

  const handleAddFriend = () => {
    setRequestSent(true);
    toast({
      title: 'Заявка отправлена',
      description: 'Ожидайте подтверждения'
    });
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное'
    });
  };

  const handleSendMessage = () => {
    navigate('/messages');
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (selectedPhoto) {
      const currentIndex = photos.indexOf(selectedPhoto);
      
      if (isLeftSwipe && currentIndex < photos.length - 1) {
        setSelectedPhoto(photos[currentIndex + 1]);
      }
      
      if (isRightSwipe && currentIndex > 0) {
        setSelectedPhoto(photos[currentIndex - 1]);
      }
    }
  };

  const goToNextPhoto = () => {
    if (selectedPhoto) {
      const currentIndex = photos.indexOf(selectedPhoto);
      if (currentIndex < photos.length - 1) {
        setSelectedPhoto(photos[currentIndex + 1]);
      }
    }
  };

  const goToPrevPhoto = () => {
    if (selectedPhoto) {
      const currentIndex = photos.indexOf(selectedPhoto);
      if (currentIndex > 0) {
        setSelectedPhoto(photos[currentIndex - 1]);
      }
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
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="h-80 bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden">
            {profile.image ? (
              <img 
                src={profile.image} 
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="User" size={96} className="text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={() => navigate(-1)}
          >
            <Icon name="ArrowLeft" size={24} />
          </Button>

          {!isOwnProfile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full"
              onClick={handleToggleFavorite}
            >
              <Icon name={isFavorite ? "Heart" : "Heart"} size={24} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
            </Button>
          )}
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

          {!isOwnProfile && (
            <div className="flex gap-3">
              <Button 
                onClick={handleSendMessage}
                className="flex-1 rounded-xl h-12 text-base font-semibold"
              >
                <Icon name="MessageCircle" size={20} className="mr-2" />
                Написать
              </Button>
              {!isFriend && !requestSent ? (
                <Button 
                  onClick={handleAddFriend}
                  variant="outline"
                  className="flex-1 rounded-xl h-12 text-base font-semibold"
                >
                  <Icon name="UserPlus" size={20} className="mr-2" />
                  Добавить в друзья
                </Button>
              ) : requestSent ? (
                <Button 
                  variant="outline"
                  disabled
                  className="flex-1 rounded-xl h-12 text-base"
                >
                  <Icon name="Clock" size={20} className="mr-2" />
                  Заявка отправлена
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="flex-1 rounded-xl h-12 text-base font-semibold"
                >
                  <Icon name="UserCheck" size={20} className="mr-2" />
                  В друзьях
                </Button>
              )}
            </div>
          )}

          {isOwnProfile && (
            <Button 
              onClick={() => navigate('/profile')}
              variant="outline"
              className="w-full rounded-xl h-12 text-base font-semibold"
            >
              <Icon name="Settings" size={20} className="mr-2" />
              Редактировать профиль
            </Button>
          )}

          <Card className="p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="Info" size={20} />
              Информация
            </h2>
            
            <div className="space-y-3">
              {profile.city && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon name="MapPin" size={18} />
                  <span>{profile.city}{profile.district ? `, ${profile.district}` : ''}</span>
                </div>
              )}

              {profile.gender && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon name="Users" size={18} />
                  <span>{profile.gender === 'male' ? 'Мужчина' : profile.gender === 'female' ? 'Женщина' : 'Не указан'}</span>
                </div>
              )}

              {profile.height && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon name="Ruler" size={18} />
                  <span>Рост: {profile.height} см</span>
                </div>
              )}

              {profile.weight && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon name="Activity" size={18} />
                  <span>Вес: {profile.weight} кг</span>
                </div>
              )}

              {profile.physique && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon name="User" size={18} />
                  <span>Телосложение: {profile.physique}</span>
                </div>
              )}
            </div>
          </Card>

          {profile.about && (
            <Card className="p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="FileText" size={20} />
                О себе
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {profile.about}
              </p>
            </Card>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <Card className="p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="Heart" size={20} />
                Интересы
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-6 rounded-2xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="Images" size={20} />
              Фотографии
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {photos.length}
              </span>
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo}
                    alt={`Фото ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full z-10"
            onClick={() => setSelectedPhoto(null)}
          >
            <Icon name="X" size={24} />
          </Button>
          
          {photos.indexOf(selectedPhoto) > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full z-10 hidden md:flex"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevPhoto();
              }}
            >
              <Icon name="ChevronLeft" size={32} />
            </Button>
          )}

          {photos.indexOf(selectedPhoto) < photos.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full z-10 hidden md:flex"
              onClick={(e) => {
                e.stopPropagation();
                goToNextPhoto();
              }}
            >
              <Icon name="ChevronRight" size={32} />
            </Button>
          )}
          
          <div 
            className="relative max-w-4xl w-full max-h-[90vh]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={selectedPhoto}
              alt="Полное фото"
              className="w-full h-full object-contain rounded-2xl select-none"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-3 py-2 rounded-full">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    photo === selectedPhoto ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(photo);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatingProfile;