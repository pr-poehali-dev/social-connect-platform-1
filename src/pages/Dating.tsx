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
  const [topAds, setTopAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    const loadData = async () => {
      const isAuth = !!localStorage.getItem('access_token');
      
      if (!isAuth) {
        setLoading(false);
        return;
      }

      try {
        const profilesResponse = await fetch('https://functions.poehali.dev/7f792110-a48c-4a99-baca-5d56979f70f2');
        const profilesData = await profilesResponse.json();
        setProfiles(profilesData.map((p: any) => ({
          ...p,
          image: p.avatar_url,
          interests: p.interests || []
        })));

        const adsResponse = await fetch('https://functions.poehali.dev/e4123cfd-1bed-41c3-afe8-325905b78c2c');
        const adsData = await adsResponse.json();
        setTopAds(adsData.map((ad: any) => ({
          id: ad.id,
          name: ad.title.split(',')[0],
          age: ad.age,
          message: ad.description,
          image: ad.image_url
        })));
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const defaultTopAds = [
    {
      id: 1,
      name: 'Алексей',
      age: 32,
      message: 'Ищу девушку для серьёзных отношений',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 2,
      name: 'Мария',
      age: 27,
      message: 'Ищу друзей для путешествий',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 3,
      name: 'Игорь',
      age: 29,
      message: 'Познакомлюсь с интересным человеком',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 4,
      name: 'Екатерина',
      age: 25,
      message: 'Люблю активный отдых и спорт',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 5,
      name: 'Дмитрий',
      age: 31,
      message: 'Ищу вторую половинку',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 6,
      name: 'Анастасия',
      age: 26,
      message: 'Познакомлюсь для общения',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 7,
      name: 'Сергей',
      age: 35,
      message: 'Ищу девушку для серьёзных отношений',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 8,
      name: 'Ольга',
      age: 28,
      message: 'Люблю путешествия и новые знакомства',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 9,
      name: 'Андрей',
      age: 30,
      message: 'Ищу вторую половинку',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 10,
      name: 'Виктория',
      age: 24,
      message: 'Познакомлюсь для общения и встреч',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 11,
      name: 'Максим',
      age: 33,
      message: 'Ищу девушку для создания семьи',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 12,
      name: 'Елена',
      age: 29,
      message: 'Люблю кино и активный отдых',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 13,
      name: 'Павел',
      age: 27,
      message: 'Познакомлюсь для серьёзных отношений',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 14,
      name: 'Татьяна',
      age: 26,
      message: 'Ищу интересных людей',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 15,
      name: 'Роман',
      age: 32,
      message: 'Ищу вторую половинку для создания семьи',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 16,
      name: 'Юлия',
      age: 25,
      message: 'Познакомлюсь для общения',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 17,
      name: 'Владимир',
      age: 34,
      message: 'Ищу девушку для серьёзных отношений',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 18,
      name: 'Наталья',
      age: 28,
      message: 'Люблю путешествия и спорт',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 19,
      name: 'Артём',
      age: 30,
      message: 'Познакомлюсь с интересной девушкой',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 20,
      name: 'Светлана',
      age: 27,
      message: 'Ищу серьёзные отношения',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    }
  ];

  const defaultProfiles = [
    {
      id: 1,
      name: 'Анна',
      age: 25,
      city: 'Москва',
      interests: ['Путешествия', 'Фотография', 'Йога'],
      bio: 'Люблю приключения и новые знакомства',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      height: 168,
      bodyType: 'Стройное',
      maritalStatus: 'Не замужем',
      hasChildren: 'Нет',
      education: 'Высшее',
      work: 'Фотограф',
      financialStatus: 'Среднее',
      hasCar: 'Нет',
      hasHousing: 'Арендую',
      datingGoal: 'Серьёзные отношения'
    },
    {
      id: 2,
      name: 'Дмитрий',
      age: 28,
      city: 'Санкт-Петербург',
      interests: ['IT', 'Спорт', 'Музыка'],
      bio: 'Разработчик и меломан',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      height: 182,
      bodyType: 'Спортивное',
      maritalStatus: 'Не женат',
      hasChildren: 'Нет',
      education: 'Высшее (IT)',
      work: 'Senior Developer',
      financialStatus: 'Выше среднего',
      hasCar: 'Есть',
      hasHousing: 'Собственное',
      datingGoal: 'Романтические отношения'
    },
    {
      id: 3,
      name: 'Екатерина',
      age: 23,
      city: 'Казань',
      interests: ['Искусство', 'Кино', 'Книги'],
      bio: 'Художница и книголюб',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      height: 165,
      bodyType: 'Среднее',
      maritalStatus: 'Не замужем',
      hasChildren: 'Нет',
      education: 'Художественное',
      work: 'Художник-иллюстратор',
      financialStatus: 'Среднее',
      hasCar: 'Нет',
      hasHousing: 'С родителями',
      datingGoal: 'Дружба'
    }
  ];

  const handleAddFriend = (profileId: number) => {
    if (!friendRequests.includes(profileId) && !friends.includes(profileId)) {
      setFriendRequests([...friendRequests, profileId]);
      toast({
        title: 'Заявка отправлена',
        description: 'Ожидайте подтверждения',
      });
    }
  };

  const handleToggleFavorite = (profileId: number) => {
    if (favorites.includes(profileId)) {
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
            <TopAdsCarousel ads={topAds.length > 0 ? topAds : defaultTopAds} />

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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12">Загрузка...</div>
              ) : (profiles.length > 0 ? profiles : defaultProfiles).map((profile: any) => (
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dating;