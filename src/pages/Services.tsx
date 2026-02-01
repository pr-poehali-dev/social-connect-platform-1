import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { russianCities } from '@/data/cities';
import { getDistrictsForCity } from '@/data/districts';

const useTypingPlaceholder = (text: string, speed: number = 50) => {
  const [placeholder, setPlaceholder] = useState('');
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setPlaceholder(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return placeholder;
};

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
  user_id: number;
  category_id: number;
  subcategory_id: number;
  title: string;
  description: string;
  price: string;
  city: string;
  district: string;
  is_online: boolean;
  is_active: boolean;
  category_name: string;
  subcategory_name: string;
  user_name: string;
  user_avatar: string;
}

const Services = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const placeholder = useTypingPlaceholder('Поиск услуг');

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId);
      setSubcategoryId('');
    } else {
      setSubcategories([]);
      setSubcategoryId('');
    }
  }, [categoryId]);

  useEffect(() => {
    fetchServices();
  }, [categoryId, subcategoryId, city, onlineOnly]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?action=categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async (catId: string) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?action=subcategories&category_id=${catId}`);
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryId && categoryId !== 'all') params.append('category_id', categoryId);
      if (subcategoryId && subcategoryId !== 'all') params.append('subcategory_id', subcategoryId);
      if (city && city !== 'all') params.append('city', city);
      if (onlineOnly) params.append('is_online', 'true');

      const response = await fetch(`https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?${params}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const query = searchQuery.toLowerCase();
    return (
      service.title?.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query) ||
      service.category_name?.toLowerCase().includes(query) ||
      service.subcategory_name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="relative mb-6">
                <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 rounded-2xl"
                />
              </div>

              <Card className="rounded-3xl border-2">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Фильтры</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Вид услуг</Label>
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Все услуги" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все услуги</SelectItem>
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
                      <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!categoryId}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={categoryId ? "Все категории" : "Выберите вид услуг"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все категории</SelectItem>
                          {subcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id.toString()}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Город</Label>
                      <Select value={city} onValueChange={(value) => { setCity(value); setDistrict(''); }}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Выберите город" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все города</SelectItem>
                          {russianCities.slice(0, 20).map((cityName) => (
                            <SelectItem key={cityName} value={cityName}>
                              {cityName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Формат</Label>
                      <div className="flex items-center space-x-2 h-10">
                        <Checkbox 
                          id="online" 
                          checked={onlineOnly}
                          onCheckedChange={(checked) => setOnlineOnly(checked as boolean)}
                        />
                        <label
                          htmlFor="online"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Только онлайн
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-20">
                <Icon name="SearchX" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-2">Услуги не найдены</h3>
                <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer rounded-3xl border-2" onClick={() => navigate(`/services/${service.user_id}`)}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-20 h-20 border-2 border-primary">
                          {service.user_avatar ? (
                            <img src={service.user_avatar} alt={service.user_name} />
                          ) : (
                            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                              {service.user_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">{service.user_name || 'Пользователь'}</h3>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="secondary" className="rounded-full">
                              {service.category_name}
                            </Badge>
                            {service.is_online && (
                              <Badge className="rounded-full bg-green-500 hover:bg-green-600">
                                Онлайн
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-lg mb-1">{service.title}</h4>
                          <p className="text-sm text-muted-foreground">{service.subcategory_name}</p>
                        </div>
                        
                        {service.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            {service.city && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Icon name="MapPin" size={16} />
                                <span>{service.city}</span>
                              </div>
                            )}
                          </div>
                          {service.price && (
                            <span className="text-lg font-bold text-primary">{service.price}</span>
                          )}
                        </div>

                        <Button className="w-full rounded-xl">
                          Подробнее
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Services;