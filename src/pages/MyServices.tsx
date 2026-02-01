import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ServiceCard from '@/components/services/ServiceCard';
import ServiceDialog from '@/components/services/ServiceDialog';
import EmptyServiceState from '@/components/services/EmptyServiceState';
import type { Category, Subcategory, Service, ServiceFormData, City } from '@/types/services';

const MyServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const subcategoriesCache = useRef<Record<string, Subcategory[]>>({});

  const [formData, setFormData] = useState<ServiceFormData>({
    category_id: '',
    subcategory_id: '',
    title: '',
    description: '',
    price: '',
    is_online: false,
    city_id: '',
    district: '',
    portfolio: [],
  });

  useEffect(() => {
    loadCategories();
    loadCities();
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

  const loadCities = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?action=cities');
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    if (subcategoriesCache.current[categoryId]) {
      setSubcategories(subcategoriesCache.current[categoryId]);
      return;
    }

    try {
      const response = await fetch(`https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?action=subcategories&category_id=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        subcategoriesCache.current[categoryId] = data;
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
        city_id: service.city_id?.toString() || '',
        district: service.district || '',
        portfolio: service.portfolio || [],
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
        city_id: '',
        district: '',
        portfolio: [],
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
      city_id: formData.city_id ? parseInt(formData.city_id) : null,
      district: formData.district,
      portfolio: formData.portfolio,
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
          city_id: service.city_id,
          district: service.district,
          is_active: !service.is_active,
          portfolio: service.portfolio || [],
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
          <EmptyServiceState onAddService={() => handleOpenDialog()} />
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onToggleActive={toggleActive}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isEditing={!!editingService}
        formData={formData}
        onFormDataChange={setFormData}
        categories={categories}
        subcategories={subcategories}
        cities={cities}
        onSave={handleSave}
      />
    </div>
  );
};

export default MyServices;