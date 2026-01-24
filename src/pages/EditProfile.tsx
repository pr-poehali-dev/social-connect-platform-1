import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    age_from: '',
    city: '',
    district: '',
    gender: '',
    height: '',
    body_type: '',
    interests: [] as string[],
    profession: '',
  });

  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          age_from: data.age_from || '',
          city: data.city || '',
          district: data.district || '',
          gender: data.gender || '',
          height: data.height || '',
          body_type: data.body_type || '',
          interests: data.interests || [],
          profession: data.profession || '',
        });
      } else {
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить профиль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: 'Ошибка',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Профиль обновлён',
          description: 'Изменения сохранены',
        });
        navigate('/dating');
      } else {
        toast({
          title: 'Ошибка сохранения',
          description: 'Не удалось обновить профиль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: 'Ошибка',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Редактировать профиль</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dating')}
            >
              <Icon name="X" size={24} />
            </Button>
          </div>

          <Card className="p-6 rounded-3xl">
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ваше имя"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="bio">О себе</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Расскажите о себе..."
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Возраст</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age_from}
                    onChange={(e) => setFormData({ ...formData, age_from: e.target.value })}
                    placeholder="25"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Пол</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="mt-2 w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Не указан</option>
                    <option value="male">Мужской</option>
                    <option value="female">Женский</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Город</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Москва"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="district">Район</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Центральный"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Рост (см)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="175"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="body_type">Телосложение</Label>
                  <Input
                    id="body_type"
                    value={formData.body_type}
                    onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                    placeholder="Спортивное"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="profession">Профессия</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  placeholder="Программист"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Интересы</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                    placeholder="Добавить интерес"
                  />
                  <Button onClick={handleAddInterest} type="button">
                    <Icon name="Plus" size={20} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.interests.map((interest, index) => (
                    <div
                      key={index}
                      className="bg-secondary px-3 py-1.5 rounded-full flex items-center gap-2"
                    >
                      <span className="text-sm">{interest}</span>
                      <button
                        onClick={() => handleRemoveInterest(interest)}
                        className="hover:text-destructive"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить изменения'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dating')}
                  disabled={saving}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
