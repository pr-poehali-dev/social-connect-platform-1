import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  category_id: number;
  name: string;
}

interface Service {
  id: number;
  category_id: number;
  subcategory_id: number;
  title: string;
  description: string;
  price: string;
  is_online: boolean;
  is_active: boolean;
  city: string;
  district: string;
  category_name: string;
  subcategory_name: string;
  created_at: string;
}

const MyServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    category_id: '',
    subcategory_id: '',
    title: '',
    description: '',
    price: '',
    is_online: false,
    city: '',
    district: '',
  });

  useEffect(() => {
    loadCategories();
    loadServices();
  }, []);

  useEffect(() => {
    if (formData.category_id) {
      loadSubcategories(formData.category_id);
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory_id: '' }));
    }
  }, [formData.category_id]);

  const loadCategories = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?action=categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?action=subcategories&category_id=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
      }
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const loadServices = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?action=my_services', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось загрузить услуги', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        category_id: service.category_id.toString(),
        subcategory_id: service.subcategory_id.toString(),
        title: service.title,
        description: service.description || '',
        price: service.price || '',
        is_online: service.is_online,
        city: service.city || '',
        district: service.district || '',
      });
      if (service.category_id) {
        loadSubcategories(service.category_id.toString());
      }
    } else {
      setEditingService(null);
      setFormData({
        category_id: '',
        subcategory_id: '',
        title: '',
        description: '',
        price: '',
        is_online: false,
        city: '',
        district: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category_id) {
      toast({ title: 'Ошибка', description: 'Заполните название и категорию услуги', variant: 'destructive' });
      return;
    }

    const token = localStorage.getItem('access_token');
    const url = editingService
      ? `https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?id=${editingService.id}`
      : 'https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774';

    const payload = {
      category_id: parseInt(formData.category_id),
      subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,
      title: formData.title,
      description: formData.description,
      price: formData.price,
      is_online: formData.is_online,
      city: formData.city,
      district: formData.district,
    };

    try {
      const response = await fetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({ title: 'Успешно!', description: editingService ? 'Услуга обновлена' : 'Услуга добавлена' });
        setDialogOpen(false);
        loadServices();
      } else {
        const data = await response.json();
        toast({ title: 'Ошибка', description: data.error || 'Не удалось сохранить', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту услугу?')) return;

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({ title: 'Удалено!', description: 'Услуга удалена' });
        loadServices();
      } else {
        const data = await response.json();
        toast({ title: 'Ошибка', description: data.error || 'Не удалось удалить', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    }
  };

  const toggleActive = async (service: Service) => {
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?id=${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id: service.category_id,
          subcategory_id: service.subcategory_id,
          title: service.title,
          description: service.description,
          price: service.price,
          is_online: service.is_online,
          city: service.city,
          district: service.district,
          is_active: !service.is_active,
        }),
      });

      if (response.ok) {
        toast({ title: 'Обновлено!', description: service.is_active ? 'Услуга снята с публикации' : 'Услуга опубликована' });
        loadServices();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить статус', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
        <Navigation />
        <div className="p-6 flex justify-center items-center min-h-[60vh]">
          <Icon name="Loader2" className="animate-spin" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      <Navigation />

      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Мои услуги</h1>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Icon name="Plus" size={20} />
            Добавить услугу
          </Button>
        </div>

        {services.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="Briefcase" size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">У вас пока нет услуг</h3>
            <p className="text-gray-600 mb-4">Добавьте свою первую услугу, чтобы другие пользователи могли её найти</p>
            <Button onClick={() => handleOpenDialog()}>Добавить услугу</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <Card key={service.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{service.title}</h3>
                      {service.is_online && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Онлайн
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {service.is_active ? 'Активна' : 'Неактивна'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      {service.category_name} › {service.subcategory_name}
                    </p>

                    {service.description && (
                      <p className="text-sm text-gray-700 mb-2">{service.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {service.price && <span className="font-semibold text-primary">{service.price}</span>}
                      {service.city && (
                        <span className="flex items-center gap-1">
                          <Icon name="MapPin" size={14} />
                          {service.city}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(service)}
                    >
                      <Icon name={service.is_active ? 'EyeOff' : 'Eye'} size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(service)}
                    >
                      <Icon name="Pencil" size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Icon name="Trash2" size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Редактировать услугу' : 'Добавить услугу'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Вид услуг *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value, subcategory_id: '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите вид услуг" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Категория</Label>
                <Select
                  value={formData.subcategory_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subcategory_id: value })
                  }
                  disabled={!formData.category_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.category_id ? "Выберите категорию" : "Сначала выберите вид"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Название услуги *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Например: Профессиональный маникюр"
              />
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Расскажите подробнее о вашей услуге..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Цена</Label>
                <Input
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="от 1000 ₽"
                />
              </div>

              <div className="space-y-2">
                <Label>Город</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Москва"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Район</Label>
              <Input
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="Центральный"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="online"
                checked={formData.is_online}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_online: checked })
                }
              />
              <Label htmlFor="online" className="cursor-pointer">
                Услуга доступна онлайн
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                {editingService ? 'Сохранить' : 'Добавить'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyServices;
