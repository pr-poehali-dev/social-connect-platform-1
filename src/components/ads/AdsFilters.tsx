import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AdsFiltersProps {
  selectedCity: string;
  selectedGender: string;
  activeCategory: string;
  activeEventType: string;
  dateRange: { from?: Date; to?: Date };
  onCityClick: () => void;
  onGenderChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onEventTypeChange: (value: string) => void;
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
}

const eventTypes = [
  { id: 'all', label: 'Все', icon: 'Grid3x3' },
  { id: 'date', label: 'Свидание', icon: 'Heart' },
  { id: 'dinner', label: 'Ужин', icon: 'UtensilsCrossed' },
  { id: 'concert', label: 'Концерт', icon: 'Music' },
  { id: 'party', label: 'Вечеринка', icon: 'PartyPopper' },
  { id: 'tour', label: 'Совместный ТУР', icon: 'Plane' }
];

const AdsFilters = ({
  selectedCity,
  selectedGender,
  activeCategory,
  activeEventType,
  dateRange,
  onCityClick,
  onGenderChange,
  onCategoryChange,
  onEventTypeChange,
  onDateRangeChange,
}: AdsFiltersProps) => {
  return (
    <Card className="mb-6 p-4 rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Фильтр: Город */}
        <div>
          <label className="text-sm font-medium mb-2 block">Город</label>
          <Button
            variant="outline"
            onClick={onCityClick}
            className="w-full justify-between rounded-xl"
          >
            <div className="flex items-center gap-2 truncate">
              <Icon name="MapPin" size={16} className="flex-shrink-0" />
              <span className="truncate">{selectedCity}</span>
            </div>
            <Icon name="ChevronRight" size={16} className="ml-2 opacity-50 flex-shrink-0" />
          </Button>
        </div>

        {/* Фильтр: Пол */}
        <div>
          <label className="text-sm font-medium mb-2 block">Пол</label>
          <Select value={selectedGender} onValueChange={onGenderChange}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Все" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="male">Мужчины</SelectItem>
              <SelectItem value="female">Женщины</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Фильтр: Намерение */}
        <div>
          <label className="text-sm font-medium mb-2 block">Намерение</label>
          <Select value={activeCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="go">
                <div className="flex items-center gap-2">
                  <Icon name="MapPin" size={16} />
                  Схожу
                </div>
              </SelectItem>
              <SelectItem value="invite">
                <div className="flex items-center gap-2">
                  <Icon name="Sparkles" size={16} />
                  Приглашу
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Фильтр: Тип мероприятия */}
        <div>
          <label className="text-sm font-medium mb-2 block">Тип мероприятия</label>
          <Select value={activeEventType} onValueChange={onEventTypeChange}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((eventType) => (
                <SelectItem key={eventType.id} value={eventType.id}>
                  <div className="flex items-center gap-2">
                    <Icon name={eventType.icon} size={16} />
                    {eventType.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Фильтр: Даты мероприятия */}
        <div>
          <label className="text-sm font-medium mb-2 block">Даты мероприятия</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between rounded-xl text-left font-normal"
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon name="Calendar" size={16} className="flex-shrink-0" />
                  <span className="truncate">
                    {dateRange.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, 'd MMM', { locale: ru })} - ${format(dateRange.to, 'd MMM', { locale: ru })}`
                      ) : (
                        `от ${format(dateRange.from, 'd MMM', { locale: ru })}`
                      )
                    ) : (
                      'Любые даты'
                    )}
                  </span>
                </div>
                {(dateRange.from || dateRange.to) && (
                  <Icon
                    name="X"
                    size={14}
                    className="ml-2 opacity-50 hover:opacity-100 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateRangeChange({});
                    }}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => onDateRangeChange(range || {})}
                numberOfMonths={1}
                locale={ru}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
};

export default AdsFilters;
