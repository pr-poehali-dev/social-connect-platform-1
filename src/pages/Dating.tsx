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

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // TODO: Загрузка избранного и друзей из БД
  };

  const [filters, setFilters] = useState({
    gender: '',
    ageFrom: '',
    ageTo: '',
    city: '',
    online: false,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <TopAdsCarousel ads={topAds} />

            <DatingFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              filters={filters}
              handleFilterChange={handleFilterChange}
              resetFilters={resetFilters}
            />

            <div className="mb-6">
              <h2 className="text-2xl font-bold">Анкеты пользователей</h2>
              <p className="text-muted-foreground">Найдите свою половинку</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" size={48} className="mx-auto mb-4 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground">Загрузка профилей...</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      isFavorite={favorites.includes(profile.id)}
                      isFriendRequestSent={friendRequests.includes(profile.id)}
                      isFriend={friends.includes(profile.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onAddFriend={handleAddFriend}
                    />
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
        </div>
      </main>
    </div>
  );
};

export default Dating;