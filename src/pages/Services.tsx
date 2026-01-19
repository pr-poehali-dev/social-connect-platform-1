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

const Services = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState('all');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774');
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const serviceTypes = [
    { value: 'all', label: 'Все услуги' },
    { value: 'beauty', label: 'Красота и здоровье' },
    { value: 'education', label: 'Образование' },
    { value: 'repair', label: 'Ремонт и строительство' },
    { value: 'cleaning', label: 'Уборка' },
    { value: 'delivery', label: 'Доставка' },
    { value: 'photo', label: 'Фото и видео' },
    { value: 'it', label: 'IT и программирование' },
    { value: 'design', label: 'Дизайн' },
    { value: 'consulting', label: 'Консультации' },
    { value: 'other', label: 'Другое' }
  ];

  const defaultServices = [
    {
      id: 1,
      name: 'Иван Петров',
      nickname: 'ivan_petrov',
      age: 28,
      city: 'Москва',
      district: 'Центральный',
      avatar: null,
      rating: 4.9,
      reviews: 127,
      serviceType: 'it',
      description: 'Создание веб-сайтов и мобильных приложений',
      price: 'от 50 000 ₽',
      online: true
    },
    {
      id: 2,
      name: 'Анна Смирнова',
      nickname: 'anna_smirnova',
      age: 25,
      city: 'Санкт-Петербург',
      district: 'Василеостровский',
      avatar: null,
      rating: 5.0,
      reviews: 89,
      serviceType: 'design',
      description: 'Графический дизайн, логотипы, брендинг',
      price: 'от 5 000 ₽',
      online: true
    },
    {
      id: 3,
      name: 'Мария Козлова',
      nickname: 'maria_kozlova',
      age: 32,
      city: 'Москва',
      district: 'Северный',
      avatar: null,
      rating: 4.8,
      reviews: 56,
      serviceType: 'beauty',
      description: 'Маникюр, педикюр, наращивание ногтей',
      price: 'от 2 000 ₽',
      online: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                    Услуги пользователей
                  </h1>
                  <p className="text-muted-foreground">Найдите исполнителя или предложите свою услугу</p>
                </div>
                <Button className="gap-2 rounded-2xl">
                  <Icon name="Plus" size={20} />
                  Создать услугу
                </Button>
              </div>
              
              <div className="relative mb-6">
                <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Найти услугу..."
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
                      <Select value={serviceType} onValueChange={setServiceType}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                          {russianCities.slice(0, 20).map((cityName) => (
                            <SelectItem key={cityName} value={cityName}>
                              {cityName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Район</Label>
                      <Select value={district} onValueChange={setDistrict} disabled={!city}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={city ? "Выберите район" : "Сначала выберите город"} />
                        </SelectTrigger>
                        <SelectContent>
                          {city && getDistrictsForCity(city).map((districtName) => (
                            <SelectItem key={districtName} value={districtName}>
                              {districtName}
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



            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12">Загрузка...</div>
              ) : (services.length > 0 ? services : defaultServices).map((service: any) => (
                <Card key={service.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer rounded-3xl border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-20 h-20 border-2 border-primary">
                        {service.avatar ? (
                          <img src={service.avatar} alt={service.name} />
                        ) : (
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                            {service.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.age} лет</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="MapPin" size={16} className="text-muted-foreground" />
                        <span>{service.city}{service.district && `, ${service.district}`}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{service.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">({service.reviews} отзывов)</span>
                      </div>

                      {service.online && (
                        <Badge variant="secondary" className="rounded-full">
                          <Icon name="Wifi" size={12} className="mr-1" />
                          Онлайн
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-xl font-bold text-primary">{service.price}</p>
                      <Button 
                        size="sm" 
                        className="rounded-xl gap-2"
                        onClick={() => navigate(`/services/${service.nickname}`)}
                      >
                        Подробнее
                        <Icon name="ArrowRight" size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Services;