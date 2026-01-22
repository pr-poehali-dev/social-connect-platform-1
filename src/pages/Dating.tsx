import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import TopAdsCarousel from '@/components/dating/TopAdsCarousel';
import DatingFilters from '@/components/dating/DatingFilters';
import ProfileCard from '@/components/dating/ProfileCard';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

const Dating = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState<number[]>([]);
  const [friends, setFriends] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
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

  const [filters, setFilters] = useState({
    gender: '',
    ageFrom: '',
    ageTo: '',
    city: '',
    online: false,
    withPhoto: false,
    district: '',
    heightFrom: '',
    heightTo: '',
    bodyType: '',
    maritalStatus: '',
    hasChildren: '',
    financialStatus: '',
    hasCar: '',
    hasHousing: '',
    datingGoal: '',
  });

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    setFilters({
      gender: '',
      ageFrom: '',
      ageTo: '',
      city: '',
      online: false,
      withPhoto: false,
      district: '',
      heightFrom: '',
      heightTo: '',
      bodyType: '',
      maritalStatus: '',
      hasChildren: '',
      financialStatus: '',
      hasCar: '',
      hasHousing: '',
      datingGoal: '',
    });
  };

  useEffect(() => {
    loadProfiles();
  }, [filters]);

  const loadProfiles = async () => {
    setLoading(true);
    
    const mockProfiles = [
      {
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
        about: 'Люблю путешествовать и фотографировать',
        interests: ['Путешествия', 'Фотография', 'Йога'],
        distance: 1.2
      },
      {
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
        about: 'Занимаюсь спортом, люблю активный отдых',
        interests: ['Спорт', 'Кино', 'Музыка'],
        distance: 3.5
      },
      {
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
        about: 'Дизайнер, обожаю искусство и творчество',
        interests: ['Дизайн', 'Искусство', 'Кофе'],
        distance: 5.8
      },
      {
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
        about: 'IT-специалист, люблю технологии',
        interests: ['Технологии', 'Игры', 'Книги'],
        distance: 2.1
      },
      {
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
        about: 'Студентка, интересуюсь модой',
        interests: ['Мода', 'Танцы', 'Instagram'],
        distance: 0.8
      },
      {
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
        about: 'Предприниматель, люблю путешествия',
        interests: ['Бизнес', 'Путешествия', 'Спорт'],
        distance: 4.2
      }
    ];

    let filteredProfiles = [...mockProfiles];

    if (filters.gender) {
      filteredProfiles = filteredProfiles.filter(p => p.gender === filters.gender);
    }
    if (filters.ageFrom) {
      filteredProfiles = filteredProfiles.filter(p => p.age >= parseInt(filters.ageFrom));
    }
    if (filters.ageTo) {
      filteredProfiles = filteredProfiles.filter(p => p.age <= parseInt(filters.ageTo));
    }
    if (filters.city) {
      filteredProfiles = filteredProfiles.filter(p => p.city.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.online) {
      filteredProfiles = filteredProfiles.filter(p => p.isOnline);
    }
    if (filters.withPhoto) {
      filteredProfiles = filteredProfiles.filter(p => p.image);
    }

    setTimeout(() => {
      setProfiles(filteredProfiles);
      setLoading(false);
    }, 500);
  };

  const topAds = profiles.filter(p => p.isTopAd);

  const handleAddFriend = async (profileId: number) => {
    if (!friendRequests.includes(profileId) && !friends.includes(profileId)) {
      // TODO: Отправка заявки в БД через API
      setFriendRequests([...friendRequests, profileId]);
      toast({
        title: 'Заявка отправлена',
        description: 'Ожидайте подтверждения',
      });
    }
  };

  const handleToggleFavorite = async (profileId: number) => {
    const isFavorite = favorites.includes(profileId);
    // TODO: Сохранение в БД через API
    
    if (isFavorite) {
      setFavorites(favorites.filter(id => id !== profileId));
      toast({
        title: 'Удалено из избранного',
      });
    } else {
      setFavorites([...favorites, profileId]);
      toast({
        title: 'Добавлено в избранное',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Знакомства</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2"
            >
              <Icon name="SlidersHorizontal" size={24} />
            </button>
          </div>

          {showFilters && (
            <div className="mb-6">
              <DatingFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filters={filters}
                handleFilterChange={handleFilterChange}
                resetFilters={resetFilters}
              />
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <Icon name="Loader2" size={48} className="mx-auto mb-4 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">Загрузка профилей...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                <Card className="rounded-[2rem] p-4 bg-gradient-to-br from-pink-100 to-pink-200 flex flex-col justify-center items-center aspect-square border-0">
                  <div className="flex-1 flex items-center justify-center mb-3">
                    <div className="text-6xl">🚀</div>
                  </div>
                  <p className="text-center text-sm leading-tight font-thin my-0">Подними свой профиль и тебя будет проще найти в поиске</p>
                  <button className="w-full bg-foreground text-background font-semibold py-3 px-4 rounded-2xl text-sm">
                    Поднять
                  </button>
                </Card>

                {profiles
                  .filter(profile => profile.id !== currentUserId)
                  .map((profile) => (
                    <div key={profile.id} className="relative">
                      <Card 
                        className="rounded-[2rem] overflow-hidden border-0 aspect-square relative cursor-pointer transition-transform hover:scale-[1.02]"
                        onClick={() => navigate(`/dating/${profile.id}`)}
                      >
                        {profile.image ? (
                          <img 
                            src={profile.image} 
                            alt={profile.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <Icon name="User" size={48} className="text-gray-400" />
                          </div>
                        )}
                        
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-12 pb-3 px-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold text-lg">
                                {profile.name}, {profile.age}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/80 text-xs">
                              <div className={`w-1.5 h-1.5 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <span>
                                {profile.isOnline ? 'Онлайн' : profile.lastSeen ? `Был(а) в сети ${profile.lastSeen}` : 'Был(а) в сети давно'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
              </div>

              {profiles.length === 0 && (
                <Card className="max-w-md mx-auto text-center p-12 rounded-3xl">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-xl font-semibold mb-2">Пока никого нет</p>
                  <p className="text-muted-foreground">Скоро здесь появятся новые анкеты</p>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dating;