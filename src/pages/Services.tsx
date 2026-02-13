import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import ServicesFilters from '@/components/services/ServicesFilters';
import ServicePublicCard from '@/components/services/ServicePublicCard';
import EmptyServicesState from '@/components/services/EmptyServicesState';
import type { Category, Subcategory, Service, City } from '@/types/services';

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
  const [cities, setCities] = useState<City[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const placeholder = useTypingPlaceholder('Поиск услуг');
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchCategories();
    fetchCities();
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
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      fetchServices();
    }, 800);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchCities = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774?action=cities');
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
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

  const handleCityChange = (value: string) => {
    setCity(value);
    setDistrict('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 lg:overflow-auto overflow-y-auto overflow-x-hidden">
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

              <ServicesFilters
                categoryId={categoryId}
                subcategoryId={subcategoryId}
                city={city}
                onlineOnly={onlineOnly}
                categories={categories}
                subcategories={subcategories}
                cities={cities}
                onCategoryChange={setCategoryId}
                onSubcategoryChange={setSubcategoryId}
                onCityChange={handleCityChange}
                onOnlineOnlyChange={setOnlineOnly}
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredServices.length === 0 ? (
              <EmptyServicesState />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServicePublicCard
                    key={service.id}
                    service={service}
                    onClick={() => navigate(`/services/${service.user_nickname || service.user_id}`)}
                  />
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