import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { logout as authLogout } from '@/utils/auth';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    avatar_url: '',
    gender: '',
    age_from: '',
    age_to: '',
    city: '',
    district: '',
    height: '',
    body_type: '',
    marital_status: '',
    children: '',
    financial_status: '',
    has_car: '',
    has_housing: '',
    dating_goal: '',
    interests: [] as string[],
    profession: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const defaultUser = {
      id: 1,
      name: 'Пользователь',
      email: 'user@example.com',
      nickname: 'user' + Math.floor(Math.random() * 10000),
      bio: 'Привет! Я новый пользователь ConnectHub 👋',
      avatar_url: null,
      joinedDate: new Date().toLocaleDateString('ru-RU'),
      gender: '',
      age_from: '',
      age_to: '',
      city: '',
      district: '',
      height: '',
      body_type: '',
      marital_status: '',
      children: '',
      financial_status: '',
      has_car: '',
      has_housing: '',
      dating_goal: '',
      interests: [],
      profession: '',
    };
    
    setUser(defaultUser);
    setFormData({
      nickname: defaultUser.nickname,
      bio: defaultUser.bio,
      avatar_url: defaultUser.avatar_url || '',
      gender: defaultUser.gender || '',
      age_from: defaultUser.age_from || '',
      age_to: defaultUser.age_to || '',
      city: defaultUser.city || '',
      district: defaultUser.district || '',
      height: defaultUser.height || '',
      body_type: defaultUser.body_type || '',
      marital_status: defaultUser.marital_status || '',
      children: defaultUser.children || '',
      financial_status: defaultUser.financial_status || '',
      has_car: defaultUser.has_car || '',
      has_housing: defaultUser.has_housing || '',
      dating_goal: defaultUser.dating_goal || '',
      interests: defaultUser.interests || [],
      profession: defaultUser.profession || '',
    });
  }, [navigate]);

  const handleLogout = () => {
    authLogout();
    toast({ title: 'Выход выполнен', description: 'До скорой встречи!' });
    navigate('/login');
  };

  const handleSaveProfile = () => {
    if (!formData.nickname.trim()) {
      toast({ title: 'Ошибка', description: 'Nickname не может быть пустым', variant: 'destructive' });
      return;
    }
    setUser({ ...user, ...formData });
    setEditMode(false);
    toast({ title: 'Сохранено!', description: 'Профиль успешно обновлён' });
  };

  const handleCancel = () => {
    setFormData({
      nickname: user.nickname,
      bio: user.bio,
      avatar_url: user.avatar_url || '',
      gender: user.gender || '',
      age_from: user.age_from || '',
      age_to: user.age_to || '',
      city: user.city || '',
      district: user.district || '',
      height: user.height || '',
      body_type: user.body_type || '',
      marital_status: user.marital_status || '',
      children: user.children || '',
      financial_status: user.financial_status || '',
      has_car: user.has_car || '',
      has_housing: user.has_housing || '',
      dating_goal: user.dating_goal || '',
      interests: user.interests || [],
      profession: user.profession || '',
    });
    setEditMode(false);
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const availableInterests = [
    'Спорт', 'Путешествия', 'Кино', 'Музыка', 'Книги', 'Кулинария',
    'Искусство', 'Фотография', 'Танцы', 'Йога', 'Природа', 'Животные',
    'Технологии', 'Игры', 'Мода', 'Психология'
  ];

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
              <div className="relative w-32 h-32 mx-auto">
                <Avatar className="w-32 h-32 border-4 border-primary">
                  {user.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                  ) : (
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {editMode && (
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10"
                  >
                    <Icon name="Camera" size={20} />
                  </Button>
                )}
              </div>
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
                      <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2 rounded-xl">
                        <Icon name="X" size={16} />
                        Отмена
                      </Button>
                    </div>
                  )}
                </div>

                {editMode ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nickname">Nickname</Label>
                        <div className="flex gap-2">
                          <span className="flex items-center px-3 bg-muted rounded-xl text-muted-foreground">@</span>
                          <Input
                            id="nickname"
                            value={formData.nickname}
                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                            placeholder="nickname"
                            className="rounded-xl"
                            maxLength={50}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Пол</Label>
                        <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Выберите пол" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Мужской</SelectItem>
                            <SelectItem value="female">Женский</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Возраст партнёра</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="number"
                          placeholder="От"
                          value={formData.age_from}
                          onChange={(e) => setFormData({ ...formData, age_from: e.target.value })}
                          className="rounded-xl"
                          min="18"
                          max="99"
                        />
                        <Input
                          type="number"
                          placeholder="До"
                          value={formData.age_to}
                          onChange={(e) => setFormData({ ...formData, age_to: e.target.value })}
                          className="rounded-xl"
                          min="18"
                          max="99"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Город</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Москва"
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="district">Район</Label>
                        <Input
                          id="district"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          placeholder="Центральный"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="height">Рост (см)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          placeholder="170"
                          className="rounded-xl"
                          min="140"
                          max="220"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="body_type">Телосложение</Label>
                        <Select value={formData.body_type} onValueChange={(value) => setFormData({ ...formData, body_type: value })}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Выберите" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slim">Стройное</SelectItem>
                            <SelectItem value="athletic">Спортивное</SelectItem>
                            <SelectItem value="average">Обычное</SelectItem>
                            <SelectItem value="curvy">Полное</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="marital_status">Семейное положение</Label>
                        <Select value={formData.marital_status} onValueChange={(value) => setFormData({ ...formData, marital_status: value })}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Выберите" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Не женат/не замужем</SelectItem>
                            <SelectItem value="divorced">В разводе</SelectItem>
                            <SelectItem value="widowed">Вдовец/вдова</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="children">Наличие детей</Label>
                        <Select value={formData.children} onValueChange={(value) => setFormData({ ...formData, children: value })}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Выберите" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">Нет</SelectItem>
                            <SelectItem value="yes_living_together">Есть, живём вместе</SelectItem>
                            <SelectItem value="yes_living_separately">Есть, живут отдельно</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="financial_status">Финансовое положение</Label>
                        <Select value={formData.financial_status} onValueChange={(value) => setFormData({ ...formData, financial_status: value })}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Выберите" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="below_average">Ниже среднего</SelectItem>
                            <SelectItem value="average">Среднее</SelectItem>
                            <SelectItem value="above_average">Выше среднего</SelectItem>
                            <SelectItem value="high">Высокое</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="has_car">Наличие авто</Label>
                        <Select value={formData.has_car} onValueChange={(value) => setFormData({ ...formData, has_car: value })}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Выберите" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Есть</SelectItem>
                            <SelectItem value="no">Нет</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="has_housing">Наличие жилья</Label>
                        <Select value={formData.has_housing} onValueChange={(value) => setFormData({ ...formData, has_housing: value })}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Выберите" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="own">Своё</SelectItem>
                            <SelectItem value="rent">Аренда</SelectItem>
                            <SelectItem value="living_with_parents">С родителями</SelectItem>
                            <SelectItem value="no">Нет</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dating_goal">Цель знакомства</Label>
                      <Select value={formData.dating_goal} onValueChange={(value) => setFormData({ ...formData, dating_goal: value })}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Выберите цель" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friendship">Дружба</SelectItem>
                          <SelectItem value="dating">Романтические отношения</SelectItem>
                          <SelectItem value="marriage">Создание семьи</SelectItem>
                          <SelectItem value="flirt">Флирт</SelectItem>
                          <SelectItem value="communication">Общение</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profession">Профессия</Label>
                      <Input
                        id="profession"
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        placeholder="Ваша профессия"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Интересы</Label>
                      <div className="flex flex-wrap gap-2">
                        {availableInterests.map((interest) => (
                          <Badge
                            key={interest}
                            variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                            className="cursor-pointer rounded-xl px-4 py-2 text-sm"
                            onClick={() => toggleInterest(interest)}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">О себе</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Расскажите о себе"
                        className="rounded-xl min-h-[100px]"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {formData.bio.length}/500
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-6 bg-muted/50 rounded-2xl">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Nickname</p>
                        <p className="text-base">@{user.nickname}</p>
                      </div>
                      {user.gender && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Пол</p>
                          <p className="text-base">{user.gender === 'male' ? 'Мужской' : 'Женский'}</p>
                        </div>
                      )}
                      {(user.age_from || user.age_to) && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Возраст партнёра</p>
                          <p className="text-base">{user.age_from} - {user.age_to} лет</p>
                        </div>
                      )}
                      {user.city && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Город</p>
                          <p className="text-base">{user.city}{user.district && `, ${user.district}`}</p>
                        </div>
                      )}
                      {user.height && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Рост</p>
                          <p className="text-base">{user.height} см</p>
                        </div>
                      )}
                      {user.body_type && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Телосложение</p>
                          <p className="text-base">
                            {user.body_type === 'slim' && 'Стройное'}
                            {user.body_type === 'athletic' && 'Спортивное'}
                            {user.body_type === 'average' && 'Обычное'}
                            {user.body_type === 'curvy' && 'Полное'}
                          </p>
                        </div>
                      )}
                      {user.marital_status && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Семейное положение</p>
                          <p className="text-base">
                            {user.marital_status === 'single' && 'Не женат/не замужем'}
                            {user.marital_status === 'divorced' && 'В разводе'}
                            {user.marital_status === 'widowed' && 'Вдовец/вдова'}
                          </p>
                        </div>
                      )}
                      {user.children && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Дети</p>
                          <p className="text-base">
                            {user.children === 'no' && 'Нет'}
                            {user.children === 'yes_living_together' && 'Есть, живём вместе'}
                            {user.children === 'yes_living_separately' && 'Есть, живут отдельно'}
                          </p>
                        </div>
                      )}
                      {user.financial_status && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Финансовое положение</p>
                          <p className="text-base">
                            {user.financial_status === 'below_average' && 'Ниже среднего'}
                            {user.financial_status === 'average' && 'Среднее'}
                            {user.financial_status === 'above_average' && 'Выше среднего'}
                            {user.financial_status === 'high' && 'Высокое'}
                          </p>
                        </div>
                      )}
                      {user.has_car && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Авто</p>
                          <p className="text-base">{user.has_car === 'yes' ? 'Есть' : 'Нет'}</p>
                        </div>
                      )}
                      {user.has_housing && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Жильё</p>
                          <p className="text-base">
                            {user.has_housing === 'own' && 'Своё'}
                            {user.has_housing === 'rent' && 'Аренда'}
                            {user.has_housing === 'living_with_parents' && 'С родителями'}
                            {user.has_housing === 'no' && 'Нет'}
                          </p>
                        </div>
                      )}
                      {user.dating_goal && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Цель знакомства</p>
                          <p className="text-base">
                            {user.dating_goal === 'friendship' && 'Дружба'}
                            {user.dating_goal === 'dating' && 'Романтические отношения'}
                            {user.dating_goal === 'marriage' && 'Создание семьи'}
                            {user.dating_goal === 'flirt' && 'Флирт'}
                            {user.dating_goal === 'communication' && 'Общение'}
                          </p>
                        </div>
                      )}
                      {user.profession && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Профессия</p>
                          <p className="text-base">{user.profession}</p>
                        </div>
                      )}
                    </div>
                    {user.interests && user.interests.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Интересы</p>
                        <div className="flex flex-wrap gap-2">
                          {user.interests.map((interest: string) => (
                            <Badge key={interest} variant="secondary" className="rounded-xl px-3 py-1">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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
