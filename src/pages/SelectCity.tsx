import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const SelectCity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentCity = location.state?.currentCity || 'Все города';
  const returnTo = location.state?.returnTo || '/events';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(currentCity);

  const popularCities = [
    'Все города',
    'Москва',
    'Санкт-Петербург',
    'Новосибирск',
    'Екатеринбург',
    'Казань',
    'Нижний Новгород',
    'Краснодар',
    'Сочи',
  ];

  const cities = [
    'Челябинск',
    'Самара',
    'Омск',
    'Ростов-на-Дону',
    'Уфа',
    'Красноярск',
    'Воронеж',
    'Пермь',
    'Волгоград',
    'Саратов',
    'Тюмень',
    'Тольятти',
    'Ижевск',
    'Барнаул',
    'Ульяновск',
    'Иркутск',
    'Хабаровск',
    'Ярославль',
    'Владивосток',
    'Махачкала',
    'Томск',
    'Оренбург',
    'Кемерово',
    'Новокузнецк',
    'Рязань',
    'Набережные Челны',
    'Астрахань',
    'Пенза',
    'Липецк',
    'Киров',
    'Чебоксары',
    'Калининград',
    'Тула',
    'Курск',
    'Ставрополь',
    'Сочи',
    'Улан-Удэ',
    'Тверь',
    'Магнитогорск',
    'Иваново',
    'Брянск',
    'Белгород',
    'Сургут',
    'Владимир',
    'Нижний Тагил',
    'Архангельск',
    'Чита',
    'Калуга',
    'Смоленск',
    'Волжский',
    'Курган',
    'Череповец',
    'Орёл',
    'Владикавказ',
    'Мурманск',
    'Вологда',
    'Саранск',
    'Тамбов',
    'Стерлитамак',
    'Грозный',
    'Кострома',
    'Петрозаводск',
    'Нижневартовск',
    'Йошкар-Ола',
    'Новороссийск',
    'Комсомольск-на-Амуре',
    'Таганрог',
    'Сыктывкар',
    'Братск',
    'Дзержинск',
    'Нальчик',
    'Шахты',
    'Орск',
    'Ангарск',
    'Благовещенск',
    'Великий Новгород',
    'Псков',
    'Энгельс',
    'Бийск',
    'Прокопьевск',
    'Рыбинск',
    'Балаково',
    'Армавир',
    'Северодвинск',
    'Королёв',
    'Петропавловск-Камчатский',
    'Мытищи',
    'Люберцы',
    'Сызрань',
    'Каменск-Уральский',
    'Волгодонск',
    'Абакан',
    'Новочеркасск',
    'Норильск',
    'Якутск',
  ];

  const allCities = [...popularCities, ...cities];
  
  const filteredPopularCities = searchQuery
    ? popularCities.filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()))
    : popularCities;
    
  const filteredCities = searchQuery
    ? cities.filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()))
    : cities;
    
  const hasResults = filteredPopularCities.length > 0 || filteredCities.length > 0;

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
  };

  const handleApply = () => {
    navigate(returnTo, { state: { selectedCity } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-purple-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(returnTo)}
              className="rounded-full"
            >
              <Icon name="ArrowLeft" size={24} />
            </Button>
            <h1 className="text-xl font-bold">Выбор города</h1>
          </div>
        </div>
      </div>

      <main className="pb-24">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative mb-6">
              <Icon
                name="Search"
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Поиск города..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 rounded-2xl text-base"
                autoFocus
              />
            </div>

            {hasResults ? (
              <>
                {!searchQuery && filteredPopularCities.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Популярные города</h2>
                    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {filteredPopularCities.map((city) => (
                          <button
                            key={city}
                            onClick={() => handleCitySelect(city)}
                            className={cn(
                              'w-full flex items-center gap-3 px-6 py-4 text-left transition-colors',
                              'hover:bg-purple-50 active:bg-purple-100',
                              selectedCity === city && 'bg-purple-50'
                            )}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Icon
                                name="MapPin"
                                size={20}
                                className={cn(
                                  'flex-shrink-0',
                                  selectedCity === city ? 'text-primary' : 'text-muted-foreground'
                                )}
                              />
                              <span
                                className={cn(
                                  'truncate text-base',
                                  selectedCity === city && 'font-semibold text-primary'
                                )}
                              >
                                {city}
                              </span>
                            </div>
                            {selectedCity === city && (
                              <Check className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {filteredCities.length > 0 && (
                  <div>
                    {!searchQuery && <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Все города</h2>}
                    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            onClick={() => handleCitySelect(city)}
                            className={cn(
                              'w-full flex items-center gap-3 px-6 py-4 text-left transition-colors',
                              'hover:bg-purple-50 active:bg-purple-100',
                              selectedCity === city && 'bg-purple-50'
                            )}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Icon
                                name="MapPin"
                                size={20}
                                className={cn(
                                  'flex-shrink-0',
                                  selectedCity === city ? 'text-primary' : 'text-muted-foreground'
                                )}
                              />
                              <span
                                className={cn(
                                  'truncate text-base',
                                  selectedCity === city && 'font-semibold text-primary'
                                )}
                              >
                                {city}
                              </span>
                            </div>
                            {selectedCity === city && (
                              <Check className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {searchQuery && filteredPopularCities.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {filteredPopularCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => handleCitySelect(city)}
                          className={cn(
                            'w-full flex items-center gap-3 px-6 py-4 text-left transition-colors',
                            'hover:bg-purple-50 active:bg-purple-100',
                            selectedCity === city && 'bg-purple-50'
                          )}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Icon
                              name="MapPin"
                              size={20}
                              className={cn(
                                'flex-shrink-0',
                                selectedCity === city ? 'text-primary' : 'text-muted-foreground'
                              )}
                            />
                            <span
                              className={cn(
                                'truncate text-base',
                                selectedCity === city && 'font-semibold text-primary'
                              )}
                            >
                              {city}
                            </span>
                          </div>
                          {selectedCity === city && (
                            <Check className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="px-6 py-12 text-center text-muted-foreground">
                  <Icon name="SearchX" size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Город не найден</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-purple-100 pb-safe">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={handleApply}
            className="w-full py-6 rounded-2xl text-base font-semibold"
            size="lg"
          >
            Применить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectCity;