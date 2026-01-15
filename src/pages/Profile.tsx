import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { logout as authLogout } from '@/utils/auth';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setUser({
      id: 1,
      name: 'Пользователь',
      email: 'user@example.com',
      nickname: 'user' + Math.floor(Math.random() * 10000),
      bio: 'Привет! Я новый пользователь ConnectHub 👋',
      avatar_url: null,
      joinedDate: new Date().toLocaleDateString('ru-RU')
    });
    setNickname('user' + Math.floor(Math.random() * 10000));
    setBio('Привет! Я новый пользователь ConnectHub 👋');
  }, [navigate]);

  const handleLogout = () => {
    authLogout();
    toast({ title: 'Выход выполнен', description: 'До скорой встречи!' });
    navigate('/login');
  };

  const handleSaveProfile = () => {
    if (!nickname.trim()) {
      toast({ title: 'Ошибка', description: 'Nickname не может быть пустым', variant: 'destructive' });
      return;
    }
    setUser({ ...user, nickname, bio });
    setEditMode(false);
    toast({ title: 'Сохранено!', description: 'Профиль успешно обновлён' });
  };

  if (!user) return null;

  const stats = [
    { icon: 'Heart', label: 'Знакомства', value: '0', color: 'from-pink-500 to-rose-500' },
    { icon: 'MessageSquare', label: 'Объявления', value: '0', color: 'from-purple-500 to-indigo-500' },
    { icon: 'Briefcase', label: 'Услуги', value: '0', color: 'from-blue-500 to-cyan-500' },
    { icon: 'Users', label: 'Рефералы', value: '0', color: 'from-emerald-500 to-teal-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto rounded-3xl border-2 shadow-2xl">
            <CardHeader className="text-center space-y-6 pb-8">
              <Avatar className="w-32 h-32 mx-auto border-4 border-primary">
                {user.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                ) : (
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-3xl mb-2">{user.name}</CardTitle>
                <CardDescription className="text-base">{user.email}</CardDescription>
                <p className="text-sm text-muted-foreground mt-2">
                  @{user.nickname}
                </p>
                <p className="text-sm text-muted-foreground">
                  На платформе с {user.joinedDate}
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Link to={`/${user.nickname}`}>
                  <Button variant="outline" className="gap-2 rounded-xl">
                    <Icon name="Eye" size={18} />
                    Мой профиль
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" className="gap-2 rounded-xl">
                  <Icon name="LogOut" size={18} />
                  Выйти
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Настройки профиля</h3>
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)} variant="outline" size="sm" className="gap-2 rounded-xl">
                      <Icon name="Edit" size={16} />
                      Редактировать
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} size="sm" className="gap-2 rounded-xl">
                        <Icon name="Check" size={16} />
                        Сохранить
                      </Button>
                      <Button onClick={() => { setEditMode(false); setNickname(user.nickname); setBio(user.bio); }} variant="outline" size="sm" className="gap-2 rounded-xl">
                        <Icon name="X" size={16} />
                        Отмена
                      </Button>
                    </div>
                  )}
                </div>
                {editMode ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Nickname (URL профиля)</Label>
                      <div className="flex gap-2">
                        <span className="flex items-center px-3 bg-muted rounded-xl text-muted-foreground">@</span>
                        <Input
                          id="nickname"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="nickname"
                          className="rounded-xl"
                          maxLength={50}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ссылка на профиль: /{nickname}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">О себе</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Расскажите о себе"
                        className="rounded-xl min-h-[100px]"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {bio.length}/500
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-2xl">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Nickname</p>
                      <p className="text-base">@{user.nickname}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">О себе</p>
                      <p className="text-base">{user.bio}</p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Статистика</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <Card key={index} className="rounded-2xl border-2">
                      <CardContent className="p-6 text-center">
                        <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                          <Icon name={stat.icon} size={20} className="text-white" />
                        </div>
                        <p className="text-2xl font-bold mb-1">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

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
                  <Button variant="outline" className="justify-start gap-3 h-auto py-4 rounded-2xl" onClick={() => navigate('/services')}>
                    <Icon name="Briefcase" size={24} className="text-blue-500" />
                    <div className="text-left">
                      <p className="font-semibold">Создать услугу</p>
                      <p className="text-xs text-muted-foreground">Начните зарабатывать</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start gap-3 h-auto py-4 rounded-2xl" onClick={() => navigate('/wallet')}>
                    <Icon name="Wallet" size={24} className="text-amber-500" />
                    <div className="text-left">
                      <p className="font-semibold">Пополнить кошелёк</p>
                      <p className="text-xs text-muted-foreground">Баланс: 0 ₽</p>
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;