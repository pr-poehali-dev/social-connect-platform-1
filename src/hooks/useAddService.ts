import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { Category, Subcategory, Service, ServiceFormData, City } from '@/types/services';
import { getProfessionByValue } from '@/data/professions';

export const useAddService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [professionHint, setProfessionHint] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    category_id: '',
    subcategory_id: '',
    title: '',
    description: '',
    price: '',
    price_list: [],
    is_online: false,
    city_id: '',
    district: '',
    portfolio: [],
  });

  useEffect(() => {
    loadCategories();
    loadCities();
    if (id) {
      loadService(id);
    } else {
      loadUserProfession();
    }
  }, [id]);

  useEffect(() => {
    if (formData.category_id) {
      loadSubcategories(formData.category_id);
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory_id: '' }));
    }
  }, [formData.category_id]);

  const loadUserProfession = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const professionValue = data.profession;
        if (professionValue) {
          const profession = getProfessionByValue(professionValue);
          if (profession && profession.categoryIds.length > 0) {
            setProfessionHint(profession.label);
            setFormData(prev => ({
              ...prev,
              category_id: profession.categoryIds[0].toString(),
              subcategory_id: profession.subcategoryIds.length > 0 ? profession.subcategoryIds[0].toString() : '',
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profession:', error);
    }
  };

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
    try {
      const response = await fetch(`https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?action=subcategories&category_id=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        if (!data || data.length === 0) {
          setSubcategories([{ id: 0, category_id: Number(categoryId), name: 'Отсутствует' }]);
          setFormData(prev => ({ ...prev, subcategory_id: '0' }));
        } else {
          setSubcategories(data);
        }
      }
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const loadService = async (serviceId: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?id=${serviceId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const service: Service = await response.json();
        setFormData({
          category_id: service.category_id.toString(),
          subcategory_id: service.subcategory_id.toString(),
          title: service.title,
          description: service.description || '',
          price: service.price || '',
          price_list: service.price_list || [],
          is_online: service.is_online,
          city_id: service.city_id?.toString() || '',
          district: service.district || '',
          portfolio: service.portfolio || [],
        });
      }
    } catch (error) {
      console.error('Error loading service:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentCount = formData.portfolio.length;
    const availableSlots = 10 - currentCount;

    if (availableSlots <= 0) {
      alert('Максимум 10 фотографий');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          canvas.width = 800;
          canvas.height = 800;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const offsetX = (img.width - size) / 2;
          const offsetY = (img.height - size) / 2;
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 800, 800);

          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({
            ...prev,
            portfolio: [...prev.portfolio, base64],
          }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category_id) {
      toast({ title: 'Ошибка', description: 'Заполните название и категорию услуги', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('access_token');
    const url = id
      ? `https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?id=${id}`
      : 'https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774';

    const payload = {
      category_id: formData.category_id || null,
      subcategory_id: formData.subcategory_id && formData.subcategory_id !== '0' ? formData.subcategory_id : null,
      title: formData.title,
      description: formData.description,
      price: formData.price,
      price_list: formData.price_list || [],
      is_online: formData.is_online,
      city_id: formData.city_id || null,
      district: formData.district,
      portfolio: formData.portfolio,
    };

    try {
      const response = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({ title: 'Успешно!', description: id ? 'Услуга обновлена' : 'Услуга добавлена' });
        navigate('/my-services');
      } else {
        const data = await response.json();
        console.error('Server error:', data);
        toast({ title: 'Ошибка', description: data.error || 'Не удалось сохранить', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Request failed:', error);
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return {
    id,
    navigate,
    formData,
    setFormData,
    categories,
    subcategories,
    cities,
    loading,
    professionHint,
    fileInputRef,
    handleImageUpload,
    removeImage,
    handleSave,
  };
};
