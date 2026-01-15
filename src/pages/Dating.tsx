import { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const Dating = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [friendRequests, setFriendRequests] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  const topAds = [
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

  const profiles = [
    {
      id: 1,
      name: 'Анна',
      age: 25,
      city: 'Москва',
      interests: ['Путешествия', 'Фотография', 'Йога'],
      bio: 'Люблю приключения и новые знакомства',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 2,
      name: 'Дмитрий',
      age: 28,
      city: 'Санкт-Петербург',
      interests: ['IT', 'Спорт', 'Музыка'],
      bio: 'Разработчик и меломан',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    },
    {
      id: 3,
      name: 'Екатерина',
      age: 23,
      city: 'Казань',
      interests: ['Искусство', 'Кино', 'Книги'],
      bio: 'Художница и книголюб',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg'
    }
  ];

  const handleAddFriend = (profileId: number) => {
    setFriendRequests([...friendRequests, profileId]);
    toast({
      title: 'Заявка отправлена',
      description: 'Ожидайте подтверждения',
    });
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

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    const scrollSpeed = 1;
    let animationFrameId: number;

    const autoScroll = () => {
      if (scrollContainer && !isPaused) {
        scrollContainer.scrollLeft += scrollSpeed;
        
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPaused]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <div 
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-4 scroll-smooth custom-scrollbar"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <Card className="flex-shrink-0 w-40 rounded-3xl border-2 border-dashed border-primary hover:border-solid transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[280px]">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 transition-transform hover:scale-110">
                      <Icon name="Plus" size={32} className="text-white" />
                    </div>
                    <p className="text-sm font-semibold text-center">Разместить объявление</p>
                  </CardContent>
                </Card>

                {topAds.map((ad) => (
                  <Card key={ad.id} className="flex-shrink-0 w-40 rounded-3xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer hover:scale-110 hover:-translate-y-2 hover:border-orange-500">
                    <div className="relative h-40 overflow-hidden group">
                      <img
                        src={ad.image}
                        alt={ad.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-2 py-0.5 text-xs shadow-lg">
                        <Icon name="Zap" size={10} className="mr-1" />
                        ТОП
                      </Badge>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <CardContent className="p-3">
                      <h3 className="font-bold text-sm mb-0.5">{ad.name}, {ad.age}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-tight">
                        {ad.message}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <div className="flex gap-4 items-start">
                <div className="flex-1 relative">
                  <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по имени, городу, интересам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 py-6 rounded-2xl"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? "default" : "outline"}
                  className="gap-2 rounded-2xl py-6 px-6"
                >
                  <Icon name="SlidersHorizontal" size={20} />
                  Фильтры
                </Button>
              </div>

              {showFilters && (
                <Card className="mt-4 rounded-3xl border-2">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Пол</Label>
                        <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Не важно" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Мужской</SelectItem>
                            <SelectItem value="female">Женский</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Возраст от</Label>
                        <Input
                          type="number"
                          placeholder="18"
                          value={filters.ageFrom}
                          onChange={(e) => handleFilterChange('ageFrom', e.target.value)}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Возраст до</Label>
                        <Input
                          type="number"
                          placeholder="99"
                          value={filters.ageTo}
                          onChange={(e) => handleFilterChange('ageTo', e.target.value)}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Город</Label>
                        <Input
                          placeholder="Москва"
                          value={filters.city}
                          onChange={(e) => handleFilterChange('city', e.target.value)}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Район</Label>
                        <Input
                          placeholder="Центральный"
                          value={filters.district}
                          onChange={(e) => handleFilterChange('district', e.target.value)}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.online}
                            onChange={(e) => handleFilterChange('online', e.target.checked)}
                            className="rounded"
                          />
                          Только онлайн
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label>Рост от (см)</Label>
                        <Input
                          type="number"
                          placeholder="150"
                          value={filters.heightFrom}
                          onChange={(e) => handleFilterChange('heightFrom', e.target.value)}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Рост до (см)</Label>
                        <Input
                          type="number"
                          placeholder="200"
                          value={filters.heightTo}
                          onChange={(e) => handleFilterChange('heightTo', e.target.value)}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Телосложение</Label>
                        <Select value={filters.bodyType} onValueChange={(value) => handleFilterChange('bodyType', value)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Не важно" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slim">Стройное</SelectItem>
                            <SelectItem value="athletic">Спортивное</SelectItem>
                            <SelectItem value="average">Среднее</SelectItem>
                            <SelectItem value="curvy">Полное</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Семейное положение</Label>
                        <Select value={filters.maritalStatus} onValueChange={(value) => handleFilterChange('maritalStatus', value)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Не важно" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Не женат / не замужем</SelectItem>
                            <SelectItem value="divorced">В разводе</SelectItem>
                            <SelectItem value="widowed">Вдовец / вдова</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Наличие детей</Label>
                        <Select value={filters.hasChildren} onValueChange={(value) => handleFilterChange('hasChildren', value)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Не важно" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">Нет</SelectItem>
                            <SelectItem value="yes">Есть</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Финансовое положение</Label>
                        <Select value={filters.financialStatus} onValueChange={(value) => handleFilterChange('financialStatus', value)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Не важно" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Ниже среднего</SelectItem>
                            <SelectItem value="average">Среднее</SelectItem>
                            <SelectItem value="above">Выше среднего</SelectItem>
                            <SelectItem value="high">Высокое</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Наличие авто</Label>
                        <Select value={filters.hasCar} onValueChange={(value) => handleFilterChange('hasCar', value)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Не важно" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">Нет</SelectItem>
                            <SelectItem value="yes">Есть</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Наличие жилья</Label>
                        <Select value={filters.hasHousing} onValueChange={(value) => handleFilterChange('hasHousing', value)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Не важно" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">Нет</SelectItem>
                            <SelectItem value="rent">Арендую</SelectItem>
                            <SelectItem value="own">Собственное</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Цель знакомства</Label>
                        <Select value={filters.datingGoal} onValueChange={(value) => handleFilterChange('datingGoal', value)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Не важно" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="friendship">Дружба</SelectItem>
                            <SelectItem value="dating">Романтические отношения</SelectItem>
                            <SelectItem value="serious">Серьёзные отношения</SelectItem>
                            <SelectItem value="marriage">Создание семьи</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button onClick={resetFilters} variant="outline" className="rounded-xl">
                        Сбросить
                      </Button>
                      <Button onClick={() => setShowFilters(false)} className="rounded-xl flex-1">
                        Применить фильтры
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold">Анкеты пользователей</h2>
              <p className="text-muted-foreground">Найдите свою половинку</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <Card key={profile.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl overflow-hidden border-2">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-4 right-4 rounded-full"
                      onClick={() => handleToggleFavorite(profile.id)}
                    >
                      <Icon 
                        name={favorites.includes(profile.id) ? "Star" : "Star"} 
                        size={20} 
                        className={favorites.includes(profile.id) ? "fill-yellow-400 text-yellow-400" : ""}
                      />
                    </Button>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{profile.name}, {profile.age}</h3>
                      <p className="flex items-center gap-1 text-sm">
                        <Icon name="MapPin" size={14} />
                        {profile.city}
                      </p>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4">{profile.bio}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {profile.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="rounded-full">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Icon name="X" size={20} />
                      </Button>
                      <Button size="icon" className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                        <Icon name="Heart" size={20} />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Icon name="MessageCircle" size={20} />
                      </Button>
                      <Button 
                        variant={friendRequests.includes(profile.id) ? "secondary" : "outline"} 
                        size="icon" 
                        className="rounded-full"
                        onClick={() => handleAddFriend(profile.id)}
                        disabled={friendRequests.includes(profile.id)}
                      >
                        <Icon name={friendRequests.includes(profile.id) ? "UserCheck" : "UserPlus"} size={20} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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