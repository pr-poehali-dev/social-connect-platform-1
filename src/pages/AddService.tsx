import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import type { Category, Subcategory, Service, ServiceFormData, City } from '@/types/services';

const AddService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
            portfolio: [...prev.portfolio, base64] 
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
      portfolio: prev.portfolio.filter((_, i) => i !== index)
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
      subcategory_id: formData.subcategory_id || null,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/my-services')}>
            <Icon name="X" size={24} />
          </Button>
          <h1 className="text-lg font-semibold">{id ? 'Редактировать' : 'Добавить услугу'}</h1>
          <Button onClick={handleSave} disabled={loading} size="sm">
            {loading ? <Icon name="Loader2" className="animate-spin" size={16} /> : 'Готово'}
          </Button>
        </div>
      </div>

      <div className="p-4 pb-20 space-y-4">
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

        <div className="space-y-2">
          <Label>Цена (краткая)</Label>
          <Input
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="от 1000 ₽"
          />
        </div>

        <div className="space-y-2">
          <Label>Прайс-лист (подробный)</Label>
          <div className="space-y-2">
            {(formData.price_list || []).map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2">
                <Input
                  className="col-span-5"
                  value={item.service}
                  onChange={(e) => {
                    const newList = [...(formData.price_list || [])];
                    newList[idx].service = e.target.value;
                    setFormData({ ...formData, price_list: newList });
                  }}
                  placeholder="Название услуги"
                />
                <Input
                  className="col-span-3"
                  value={item.price}
                  onChange={(e) => {
                    const newList = [...(formData.price_list || [])];
                    newList[idx].price = e.target.value;
                    setFormData({ ...formData, price_list: newList });
                  }}
                  placeholder="Цена"
                />
                <Input
                  className="col-span-3"
                  value={item.time || ''}
                  onChange={(e) => {
                    const newList = [...(formData.price_list || [])];
                    newList[idx].time = e.target.value;
                    setFormData({ ...formData, price_list: newList });
                  }}
                  placeholder="Время"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="col-span-1"
                  onClick={() => {
                    const newList = (formData.price_list || []).filter((_, i) => i !== idx);
                    setFormData({ ...formData, price_list: newList });
                  }}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setFormData({
                  ...formData,
                  price_list: [...(formData.price_list || []), { service: '', price: '', time: '' }],
                });
              }}
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить позицию
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Город</Label>
            <Select
              value={formData.city_id}
              onValueChange={(value) => setFormData({ ...formData, city_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Район</Label>
            <Input
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder="Центральный"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <Label className="cursor-pointer flex-1">Услуга доступна онлайн</Label>
          <Switch
            checked={formData.is_online}
            onCheckedChange={(checked) => setFormData({ ...formData, is_online: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label>Портфолио (до 10 фото, формат 1:1)</Label>
          <div className="grid grid-cols-3 gap-2">
            {formData.portfolio.map((img, idx) => (
              <div key={idx} className="relative aspect-square">
                <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => removeImage(idx)}
                >
                  <Icon name="X" size={12} />
                </Button>
              </div>
            ))}
            {formData.portfolio.length < 10 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
              >
                <Icon name="Plus" size={24} />
                <span className="text-xs mt-1">Добавить</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full" size="lg">
          {loading ? <Icon name="Loader2" className="animate-spin mr-2" size={20} /> : null}
          {id ? 'Сохранить изменения' : 'Добавить услугу'}
        </Button>

        <Button variant="outline" onClick={() => navigate('/my-services')} className="w-full">
          Отмена
        </Button>
      </div>
    </div>
  );
};

export default AddService;