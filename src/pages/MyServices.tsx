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

interface Service {
  id: number;
  name: string;
  service_type: string;
  description: string;
  price: string;
  is_online: boolean;
  is_active: boolean;
  city: string;
  district: string;
  created_at: string;
}

const MyServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    service_type: '',
    description: '',
    price: '',
    is_online: false,
    city: '',
    district: '',
  });

  const serviceTypes = [
    'Консультация',
    'Обучение',
    'Ремонт',
    'Уборка',
    'Доставка',
    'Красота',
    'Здоровье',
    'IT',
    'Другое',
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/my-services', {
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
        name: service.name,
        service_type: service.service_type,
        description: service.description || '',
        price: service.price || '',
        is_online: service.is_online,
        city: service.city || '',
        district: service.district || '',
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        service_type: '',
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
    if (!formData.name || !formData.service_type) {
      toast({ title: 'Ошибка', description: 'Заполните название и тип услуги', variant: 'destructive' });
      return;
    }

    const token = localStorage.getItem('access_token');
    const url = editingService
      ? `https://functions.poehali.dev/my-services?id=${editingService.id}`
      : 'https://functions.poehali.dev/my-services';

    try {
      const response = await fetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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
      const response = await fetch(`https://functions.poehali.dev/my-services?id=${id}`, {
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
      const response = await fetch(`https://functions.poehali.dev/my-services?id=${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...service,
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
                      <h3 className="text-lg font-semibold">{service.name}</h3>
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

                    <p className="text-sm text-gray-600 mb-2">{service.service_type}</p>

                    {service.description && (
                      <p className="text-gray-700 mb-3">{service.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      {service.price && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Icon name="DollarSign" size={16} />
                          {service.price}
                        </div>
                      )}
                      {service.city && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Icon name="MapPin" size={16} />
                          {service.city}
                          {service.district && `, ${service.district}`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(service)}
                    >
                      <Icon name={service.is_active ? 'EyeOff' : 'Eye'} size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(service)}
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Icon name="Trash2" size={16} />
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
            <div>
              <Label htmlFor="name">Название услуги *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Ремонт компьютеров"
              />
            </div>

            <div>
              <Label htmlFor="service_type">Тип услуги *</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData({ ...formData, service_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Подробное описание услуги"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="price">Цена</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Например: 1000 руб/час"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Город</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Москва"
                />
              </div>

              <div>
                <Label htmlFor="district">Район</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Центральный"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <Label htmlFor="is_online" className="cursor-pointer">
                Онлайн услуга (можно оказать удалённо)
              </Label>
              <Switch
                id="is_online"
                checked={formData.is_online}
                onCheckedChange={(checked) => setFormData({ ...formData, is_online: checked })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSave}>
                {editingService ? 'Сохранить' : 'Добавить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyServices;
