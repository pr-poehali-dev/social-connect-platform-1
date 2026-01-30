import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { russianCities } from '@/data/cities';
import { getDistrictsForCity } from '@/data/districts';
import { useToast } from '@/hooks/use-toast';

interface LocationFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

const LocationFields = ({ formData, setFormData }: LocationFieldsProps) => {
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const { toast } = useToast();

  const filteredCities = russianCities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 10);

  const handleCitySelect = (city: string) => {
    setFormData({ ...formData, city, district: '' });
    setCitySearch('');
    setShowCityDropdown(false);
  };

  const handleDistrictSelect = (district: string) => {
    setFormData({ ...formData, district });
    setDistrictSearch('');
    setShowDistrictDropdown(false);
  };

  useEffect(() => {
    if (formData.city) {
      const districts = getDistrictsForCity(formData.city);
      setAvailableDistricts(districts);
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.city]);

  const filteredDistricts = availableDistricts.filter(district =>
    district.toLowerCase().includes(districtSearch.toLowerCase())
  ).slice(0, 10);

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Ошибка',
        description: 'Ваш браузер не поддерживает геолокацию',
        variant: 'destructive'
      });
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru`
          );
          const data = await response.json();
          
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          
          if (city) {
            setFormData({ ...formData, city, district: '' });
            toast({
              title: 'Местоположение определено',
              description: `Город: ${city}`
            });
          } else {
            toast({
              title: 'Не удалось определить город',
              description: 'Попробуйте ввести вручную',
              variant: 'destructive'
            });
          }
        } catch (error) {
          toast({
            title: 'Ошибка определения города',
            description: 'Не удалось получить данные о местоположении',
            variant: 'destructive'
          });
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        let message = 'Не удалось получить доступ к местоположению';
        let title = 'Ошибка';
        
        if (error.code === error.PERMISSION_DENIED) {
          title = 'Доступ к геолокации запрещён';
          message = 'Чтобы разрешить доступ: нажмите на иконку замка в адресной строке браузера → Настройки сайта → Разрешить доступ к местоположению';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Информация о местоположении недоступна';
        } else if (error.code === error.TIMEOUT) {
          message = 'Время ожидания истекло';
        }
        
        toast({
          title: title,
          description: message,
          variant: 'destructive',
          duration: 8000
        });
      }
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="city">Город</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="gap-1 md:gap-2 rounded-xl h-8 text-xs px-2 md:px-3"
          >
            <Icon name={isDetectingLocation ? "Loader2" : "MapPin"} size={14} className={isDetectingLocation ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{isDetectingLocation ? 'Определяю...' : 'Моё местоположение'}</span>
            <span className="sm:hidden">{isDetectingLocation ? '...' : 'GPS'}</span>
          </Button>
        </div>
        <div className="relative">
          <Input
            id="city"
            value={formData.city || citySearch}
            onChange={(e) => {
              setCitySearch(e.target.value);
              setFormData({ ...formData, city: '' });
              setShowCityDropdown(true);
            }}
            onFocus={() => setShowCityDropdown(true)}
            placeholder="Начните вводить город"
            className="rounded-xl"
          />
          {showCityDropdown && (citySearch || !formData.city) && filteredCities.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                  onClick={() => handleCitySelect(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="district">Район</Label>
        <div className="relative">
          <Input
            id="district"
            value={formData.district || districtSearch}
            onChange={(e) => {
              setDistrictSearch(e.target.value);
              setFormData({ ...formData, district: '' });
              setShowDistrictDropdown(true);
            }}
            onFocus={() => setShowDistrictDropdown(true)}
            placeholder={availableDistricts.length > 0 ? "Начните вводить район" : "Сначала выберите город"}
            className="rounded-xl"
            disabled={!formData.city}
          />
          {showDistrictDropdown && (districtSearch || !formData.district) && filteredDistricts.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredDistricts.map((district) => (
                <button
                  key={district}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                  onClick={() => handleDistrictSelect(district)}
                >
                  {district}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationFields;
