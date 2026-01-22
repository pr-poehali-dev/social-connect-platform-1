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