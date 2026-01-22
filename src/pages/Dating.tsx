import { useState, useEffect } from 'react';
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
    try {
      const params = new URLSearchParams();
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.ageFrom) params.append('ageFrom', filters.ageFrom);
      if (filters.ageTo) params.append('ageTo', filters.ageTo);
      if (filters.city) params.append('city', filters.city);
      if (filters.district) params.append('district', filters.district);
      if (filters.heightFrom) params.append('heightFrom', filters.heightFrom);
      if (filters.heightTo) params.append('heightTo', filters.heightTo);
      if (filters.bodyType) params.append('bodyType', filters.bodyType);
      if (filters.maritalStatus) params.append('maritalStatus', filters.maritalStatus);
      if (filters.hasChildren) params.append('hasChildren', filters.hasChildren);
      if (filters.financialStatus) params.append('financialStatus', filters.financialStatus);
      if (filters.hasCar) params.append('hasCar', filters.hasCar);
      if (filters.hasHousing) params.append('hasHousing', filters.hasHousing);
      if (filters.datingGoal) params.append('datingGoal', filters.datingGoal);
      if (filters.withPhoto) params.append('withPhoto', 'true');

      const response = await fetch(`https://functions.poehali.dev/463fef6f-0ceb-4ca2-ae5b-ada619f3147f?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
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
                  <p className="text-center text-sm font-medium mb-3 leading-tight">
                    Подними свой профиль наверх в поиске и тебя будет проще найти
                  </p>
                  <button className="w-full bg-foreground text-background font-semibold py-3 px-4 rounded-2xl text-sm">
                    Поднять
                  </button>
                </Card>

                {profiles
                  .filter(profile => profile.id !== currentUserId)
                  .map((profile) => (
                    <div key={profile.id} className="relative">
                      <Card className="rounded-[2rem] overflow-hidden border-0 aspect-square">
                        {profile.image ? (
                          <img 
                            src={profile.image} 
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <Icon name="User" size={48} className="text-gray-400" />
                          </div>
                        )}
                        
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-12 pb-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-lg">
                              {profile.name}, {profile.age}
                            </span>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
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