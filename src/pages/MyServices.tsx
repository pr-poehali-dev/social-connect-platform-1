import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ServiceCard from '@/components/services/ServiceCard';
import EmptyServiceState from '@/components/services/EmptyServiceState';
import type { Subcategory, Service } from '@/types/services';

const MyServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const subcategoriesCache = useRef<Record<string, Subcategory[]>>({});

  useEffect(() => {
    loadServices();
  }, []);

  const handleLoadSubcategoriesForCard = async (categoryId: number) => {
    const categoryIdStr = categoryId.toString();
    setHoveredCategoryId(categoryId);
    
    if (!subcategoriesCache.current[categoryIdStr]) {
      try {
        const response = await fetch(`https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?action=subcategories&category_id=${categoryIdStr}`);
        if (response.ok) {
          const data = await response.json();
          subcategoriesCache.current[categoryIdStr] = data;
        }
      } catch (error) {
        console.error('Error loading subcategories:', error);
      }
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
          price_list: service.price_list || [],
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
        {services.length === 0 ? (
          <EmptyServiceState />
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onToggleActive={toggleActive}
                onDelete={handleDelete}
                subcategories={subcategoriesCache.current[service.category_id?.toString() || '']}
                onLoadSubcategories={handleLoadSubcategoriesForCard}
              />
            ))}
          </div>
        )}
      </div>

      {services.length > 0 && (
        <button
          onClick={() => navigate('/add-service')}
          className="fixed bottom-24 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center z-50 md:hidden"
        >
          <Icon name="Plus" size={24} />
        </button>
      )}
    </div>
  );
};

export default MyServices;