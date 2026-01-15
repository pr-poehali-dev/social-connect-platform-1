import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Dating = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [friendRequests, setFriendRequests] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  const topAds = [
    {
      id: 1,
      title: 'Ищу девушку для серьёзных отношений',
      author: 'Алексей, 32',
      city: 'Москва',
      category: 'Познакомлюсь',
      description: 'Высокий, спортивный. Хочу найти вторую половинку для создания семьи.',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      views: 1247,
      time: '2 часа назад'
    },
    {
      id: 2,
      title: 'Ищу друзей для путешествий',
      author: 'Мария, 27',
      city: 'Санкт-Петербург',
      category: 'Познакомлюсь',
      description: 'Люблю активный отдых и путешествия. Ищу компанию для поездок!',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      views: 892,
      time: '5 часов назад'
    },
    {
      id: 3,
      title: 'Познакомлюсь с интересным человеком',
      author: 'Игорь, 29',
      city: 'Казань',
      category: 'Познакомлюсь',
      description: 'Программист, люблю музыку и кино. Ищу интересного собеседника.',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
      views: 654,
      time: '1 день назад'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent">
                Знакомства
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Находите интересных людей рядом
              </p>
              
              <div className="max-w-md mx-auto relative">
                <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени, городу, интересам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 rounded-2xl"
                />
              </div>
            </div>

            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Icon name="Zap" size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">ТОП объявления</h2>
                    <p className="text-sm text-muted-foreground">Моментальные платные объявления</p>
                  </div>
                </div>
                <Button variant="outline" className="gap-2 rounded-xl">
                  <Icon name="Plus" size={18} />
                  Разместить
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {topAds.map((ad) => (
                  <Card key={ad.id} className="rounded-3xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                    <div className="relative">
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-3 py-1 z-10">
                        <Icon name="Zap" size={14} className="mr-1" />
                        ТОП
                      </Badge>
                      <div className="h-48 overflow-hidden">
                        <img
                          src={ad.image}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <Badge variant="secondary" className="mb-2 rounded-full">{ad.category}</Badge>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ad.description}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Icon name="User" size={14} />
                        <span className="font-medium">{ad.author}</span>
                        <span>•</span>
                        <Icon name="MapPin" size={14} />
                        <span>{ad.city}</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Eye" size={14} />
                            {ad.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" size={14} />
                            {ad.time}
                          </span>
                        </div>
                        <Button size="sm" className="rounded-xl gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600">
                          <Icon name="MessageCircle" size={14} />
                          Написать
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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