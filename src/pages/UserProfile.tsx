import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { isAuthenticated } from '@/utils/auth';
import { getBackgroundClass, getBackgroundStyle } from '@/utils/premiumBackgrounds';

const UserProfile = () => {
  const { nickname } = useParams<{ nickname: string }>();
  const [user, setUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    setUser({
      id: 1,
      nickname: nickname || 'user1',
      name: 'Пользователь',
      email: 'user@example.com',
      avatar_url: null,
      joinedDate: new Date().toLocaleDateString('ru-RU'),
      bio: 'Привет! Я новый пользователь ConnectHub 👋',
      is_vip: true,
      profile_background: 'gradient-purple',
      stats: {
        dating: 0,
        ads: 0,
        services: 0,
        referrals: 0
      }
    });
    setIsOwner(true);
    setLoading(false);
  }, [nickname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto rounded-3xl border-2 shadow-2xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-6">
                  <Icon name="UserX" size={36} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Пользователь не найден</h2>
                <p className="text-muted-foreground mb-6">
                  Пользователь @{nickname} не существует
                </p>
                <Button onClick={() => navigate('/')} className="rounded-xl">
                  <Icon name="Home" size={18} className="mr-2" />
                  На главную
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto rounded-3xl border-2 shadow-2xl overflow-hidden">
            {user.is_vip && user.profile_background && (
              <div 
                className={`h-64 ${getBackgroundClass(user.profile_background)} relative`}
                style={getBackgroundStyle(user.profile_background)}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
              </div>
            )}
            <CardHeader className={`text-center space-y-6 pb-8 ${user.is_vip && user.profile_background ? '-mt-32 relative z-10' : ''}`}>
              <Avatar className="w-32 h-32 mx-auto border-4 border-primary shadow-xl">
                {user.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                ) : (
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-3xl">{user.name}</CardTitle>
                  {user.is_vip && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      <Icon name="Crown" size={14} className="mr-1" />
                      Premium
                    </Badge>
                  )}
                  {isOwner && (
                    <Link to="/profile">
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <Icon name="Settings" size={20} />
                      </Button>
                    </Link>
                  )}
                </div>
                <Badge variant="secondary" className="text-sm px-4 py-1 rounded-full">
                  @{user.nickname}
                </Badge>
                <CardDescription className="text-base mt-4 max-w-md mx-auto">
                  {user.bio}
                </CardDescription>
                <p className="text-sm text-muted-foreground mt-2">
                  На платформе с {user.joinedDate}
                </p>
              </div>

              {isOwner && (
                <div className="flex gap-3 justify-center">
                  <Link to="/profile">
                    <Button variant="outline" className="gap-2 rounded-xl">
                      <Icon name="Settings" size={18} />
                      Настройки
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="gap-2 rounded-xl"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({ title: 'Скопировано!', description: 'Ссылка на профиль скопирована' });
                    }}
                  >
                    <Icon name="Share2" size={18} />
                    Поделиться
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-8">
              {isOwner && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Быстрые действия</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start gap-3 h-auto py-4 rounded-2xl" onClick={() => navigate('/dating')}>
                      <Icon name="Heart" size={24} className="text-pink-500" />
                      <div className="text-left">
                        <p className="font-semibold">Начать знакомства</p>
                        <p className="text-xs text-muted-foreground">Найдите интересных людей</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-4 rounded-2xl" onClick={() => navigate('/ads')}>
                      <Icon name="MessageSquare" size={24} className="text-purple-500" />
                      <div className="text-left">
                        <p className="font-semibold">Создать объявление</p>
                        <p className="text-xs text-muted-foreground">Продать или купить</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-4 rounded-2xl" onClick={() => navigate('/services')}>
                      <Icon name="Briefcase" size={24} className="text-blue-500" />
                      <div className="text-left">
                        <p className="font-semibold">Создать услугу</p>
                        <p className="text-xs text-muted-foreground">Начните зарабатывать</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-4 rounded-2xl" onClick={() => navigate('/horoscope')}>
                      <Icon name="Sparkles" size={24} className="text-violet-500" />
                      <div className="text-left">
                        <p className="font-semibold">Астрология</p>
                        <p className="text-xs text-muted-foreground">Гороскопы и натальная карта</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-auto py-4 rounded-2xl" onClick={() => navigate('/referral')}>
                      <Icon name="Users" size={24} className="text-emerald-500" />
                      <div className="text-left">
                        <p className="font-semibold">Реферальная ссылка</p>
                        <p className="text-xs text-muted-foreground">Приглашайте друзей</p>
                      </div>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;