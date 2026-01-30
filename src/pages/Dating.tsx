import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import TopAdsCarousel from '@/components/dating/TopAdsCarousel';
import DatingFilters from '@/components/dating/DatingFilters';
import ProfileCard from '@/components/dating/ProfileCard';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // User data will be loaded from localStorage or session if needed
    // For now, we work in guest mode
  };

  const [filters, setFilters] = useState({
    gender: '',
    ageFrom: '',
    ageTo: '',
    city: '',
    online: false,
    withPhoto: true,
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
    
    try {
      const params = new URLSearchParams({
        action: 'profiles',
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.ageFrom && { ageFrom: filters.ageFrom }),
        ...(filters.ageTo && { ageTo: filters.ageTo }),
        ...(filters.city && { city: filters.city }),
        ...(filters.online && { online: 'true' }),
        ...(filters.withPhoto && { withPhoto: 'true' })
      });

      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?${params}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );

      if (response.ok) {
        const data = await response.json();
        const mappedProfiles = (data.profiles || [])
          .map((p: any) => ({
            id: p.id,
            user_id: p.user_id,
            name: p.name,
            age: p.age,
            birth_date: p.birth_date,
            city: p.city,
            district: p.district,
            gender: p.gender,
            image: p.avatar_url || p.user_avatar || p.image,
            isOnline: p.isOnline || p.is_online,
            lastSeen: p.lastLoginAt,
            height: p.height,
            physique: p.body_type || p.bodyType,
            about: p.bio,
            interests: p.interests || [],
            is_favorite: p.is_favorite,
            friend_request_sent: p.friend_request_sent,
            is_friend: p.is_friend,
            isTopAd: p.is_top_ad || p.isTopAd,
            status_text: p.status_text
          }))
          .filter((p: any) => p.image && p.image.trim() !== '');
        setProfiles(mappedProfiles);
      } else {
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить профили',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const topAds = profiles.filter(p => p.isTopAd);

  const handleAddFriend = async (profileId: number) => {
    if (!friendRequests.includes(profileId) && !friends.includes(profileId)) {
      try {
        const profile = profiles.find(p => p.id === profileId);
        const response = await fetch(
          'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=friend-request',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to_user_id: profile?.user_id })
          }
        );

        if (response.ok) {
          setFriendRequests([...friendRequests, profileId]);
          toast({
            title: 'Заявка отправлена',
            description: 'Ожидайте подтверждения',
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
    }
  };

  const handleToggleFavorite = async (profileId: number) => {
    const isFavorite = favorites.includes(profileId);
    
    try {
      const action = isFavorite ? 'unfavorite' : 'favorite';
      const response = await fetch(
        `https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=${action}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: profileId })
        }
      );

      if (response.ok) {
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

  const handleBoostProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт, чтобы поднять профиль',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?action=boost',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast({
          title: 'Профиль поднят! 🚀',
          description: 'Ваш профиль теперь на первом месте в поиске',
        });
        loadProfiles();
      } else {
        const data = await response.json();
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось поднять профиль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to boost profile:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
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
            <div className="flex gap-2">
              <div className="lg:hidden">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <button
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      title="Фильтры"
                    >
                      <Icon name="SlidersHorizontal" size={24} />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[90vh] flex flex-col">
                    <SheetHeader>
                      <SheetTitle>Фильтры</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto mt-4 pb-4">
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
                  </SheetContent>
                </Sheet>
              </div>
              <div className="hidden lg:block">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  title="Фильтры"
                >
                  <Icon name="SlidersHorizontal" size={24} />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mb-6 hidden lg:block">
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
                  <button 
                    onClick={handleBoostProfile}
                    className="w-full bg-foreground text-background font-semibold py-3 px-4 rounded-2xl text-sm hover:opacity-90 transition-opacity"
                  >
                    Поднять
                  </button>
                </Card>

                {profiles
                  .filter(profile => profile.id !== currentUserId)
                  .map((profile) => (
                    <div key={profile.id} className="relative">
                      <Card 
                        className="rounded-[2rem] overflow-hidden border-0 aspect-square relative cursor-pointer transition-transform hover:scale-[1.02]"
                        onClick={() => navigate(`/dating/${profile.user_id}`)}
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
                              {profile.is_verified ? (
                                <Icon name="BadgeCheck" size={18} className="text-blue-500 flex-shrink-0" />
                              ) : (
                                <Icon name="BadgeCheck" size={18} className="text-gray-400 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-white/80 text-xs">
                              <div className={`w-1.5 h-1.5 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <span>
                                {profile.isOnline ? 'Онлайн' : `Был(а) в сети ${formatLastSeen(profile.lastSeen)}`}
                              </span>
                            </div>
                            {profile.status_text && (
                              <div className="text-white/90 text-xs italic truncate">
                                {profile.status_text}
                              </div>
                            )}
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