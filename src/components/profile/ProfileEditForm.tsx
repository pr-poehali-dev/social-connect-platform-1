import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { russianCities } from '@/data/cities';
import { getDistrictsForCity } from '@/data/districts';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditFormProps {
  formData: any;
  setFormData: (data: any) => void;
  availableInterests: string[];
  toggleInterest: (interest: string) => void;
}

const ProfileEditForm = ({ formData, setFormData, availableInterests, toggleInterest }: ProfileEditFormProps) => {
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
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Имя</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            placeholder="Ваше имя"
            className="rounded-xl"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Фамилия</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            placeholder="Ваша фамилия"
            className="rounded-xl"
            maxLength={100}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">Nickname</Label>
          <div className="flex gap-2">
            <span className="flex items-center px-3 bg-muted rounded-xl text-muted-foreground">@</span>
            <Input
              id="nickname"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              placeholder="nickname"
              className="rounded-xl"
              maxLength={50}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Пол</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите пол" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Мужской</SelectItem>
              <SelectItem value="female">Женский</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birth_date">Дата рождения</Label>
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            className="rounded-xl"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zodiac_sign">Знак зодиака</Label>
          <Select value={formData.zodiac_sign} onValueChange={(value) => setFormData({ ...formData, zodiac_sign: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите знак" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aries">♈ Овен</SelectItem>
              <SelectItem value="taurus">♉ Телец</SelectItem>
              <SelectItem value="gemini">♊ Близнецы</SelectItem>
              <SelectItem value="cancer">♋ Рак</SelectItem>
              <SelectItem value="leo">♌ Лев</SelectItem>
              <SelectItem value="virgo">♍ Дева</SelectItem>
              <SelectItem value="libra">♎ Весы</SelectItem>
              <SelectItem value="scorpio">♏ Скорпион</SelectItem>
              <SelectItem value="sagittarius">♐ Стрелец</SelectItem>
              <SelectItem value="capricorn">♑ Козерог</SelectItem>
              <SelectItem value="aquarius">♒ Водолей</SelectItem>
              <SelectItem value="pisces">♓ Рыбы</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height">Рост (см)</Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            placeholder="170"
            className="rounded-xl"
            min="140"
            max="220"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body_type">Телосложение</Label>
          <Select value={formData.body_type} onValueChange={(value) => setFormData({ ...formData, body_type: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slim">Стройное</SelectItem>
              <SelectItem value="athletic">Спортивное</SelectItem>
              <SelectItem value="average">Обычное</SelectItem>
              <SelectItem value="curvy">Полное</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marital_status">Семейное положение</Label>
          <Select value={formData.marital_status} onValueChange={(value) => setFormData({ ...formData, marital_status: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              {formData.gender === 'male' ? (
                <>
                  <SelectItem value="married">Женат</SelectItem>
                  <SelectItem value="single">Не женат</SelectItem>
                  <SelectItem value="bachelor">Холост</SelectItem>
                  <SelectItem value="in_relationship">Есть подруга</SelectItem>
                  <SelectItem value="divorced">В разводе</SelectItem>
                  <SelectItem value="actively_searching">В активном поиске</SelectItem>
                  <SelectItem value="complicated">Всё сложно</SelectItem>
                  <SelectItem value="widowed">Вдовец</SelectItem>
                </>
              ) : formData.gender === 'female' ? (
                <>
                  <SelectItem value="married">Замужем</SelectItem>
                  <SelectItem value="single">Не замужем</SelectItem>
                  <SelectItem value="bachelor">Холостая</SelectItem>
                  <SelectItem value="in_relationship">Есть парень</SelectItem>
                  <SelectItem value="divorced">В разводе</SelectItem>
                  <SelectItem value="actively_searching">В активном поиске</SelectItem>
                  <SelectItem value="complicated">Всё сложно</SelectItem>
                  <SelectItem value="widowed">Вдова</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="married">Женат/Замужем</SelectItem>
                  <SelectItem value="single">Не женат/Не замужем</SelectItem>
                  <SelectItem value="bachelor">Холост/Холостая</SelectItem>
                  <SelectItem value="in_relationship">Есть подруга/парень</SelectItem>
                  <SelectItem value="divorced">В разводе</SelectItem>
                  <SelectItem value="actively_searching">В активном поиске</SelectItem>
                  <SelectItem value="complicated">Всё сложно</SelectItem>
                  <SelectItem value="widowed">Вдовец/Вдова</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="children">Наличие детей</Label>
          <Select value={formData.children} onValueChange={(value) => setFormData({ ...formData, children: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">Нет</SelectItem>
              <SelectItem value="yes_living_together">Есть, живём вместе</SelectItem>
              <SelectItem value="yes_living_separately">Есть, живут отдельно</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="financial_status">Финансовое положение</Label>
          <Select value={formData.financial_status} onValueChange={(value) => setFormData({ ...formData, financial_status: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="below_average">Ниже среднего</SelectItem>
              <SelectItem value="average">Среднее</SelectItem>
              <SelectItem value="above_average">Выше среднего</SelectItem>
              <SelectItem value="high">Высокое</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="has_car">Наличие авто</Label>
          <Select value={formData.has_car} onValueChange={(value) => setFormData({ ...formData, has_car: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Есть</SelectItem>
              <SelectItem value="no">Нет</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="has_housing">Наличие жилья</Label>
          <Select value={formData.has_housing} onValueChange={(value) => setFormData({ ...formData, has_housing: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="own">Своё</SelectItem>
              <SelectItem value="rent">Аренда</SelectItem>
              <SelectItem value="living_with_parents">С родителями</SelectItem>
              <SelectItem value="no">Нет</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dating_goal">Цель знакомства</Label>
        <Select value={formData.dating_goal} onValueChange={(value) => setFormData({ ...formData, dating_goal: value })}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Выберите цель" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="friendship">Дружба</SelectItem>
            <SelectItem value="dating">Романтические отношения</SelectItem>
            <SelectItem value="marriage">Создание семьи</SelectItem>
            <SelectItem value="flirt">Флирт</SelectItem>
            <SelectItem value="communication">Общение</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profession">Профессия</Label>
        <Input
          id="profession"
          value={formData.profession}
          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
          placeholder="Ваша профессия"
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label>Интересы</Label>
        <div className="flex flex-wrap gap-2">
          {availableInterests.map((interest) => (
            <Badge
              key={interest}
              variant={formData.interests.includes(interest) ? 'default' : 'outline'}
              className="cursor-pointer rounded-xl px-4 py-2 text-sm"
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">О себе</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Расскажите о себе"
          className="rounded-xl min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.bio.length}/500
        </p>
      </div>
    </div>
  );
};

export default ProfileEditForm;