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
  { id: 'cinema', label: 'Кино', icon: 'Film' },
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
              <SelectItem value="female">Девушки</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Фильтр: Намерение */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium">Намерение</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="CircleHelp" size={16} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 rounded-xl" align="start">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Схожу</span> — ищу тех, кто приглашает на мероприятие
                  </div>
                  <div>
                    <span className="font-semibold">Приглашу</span> — ищу тех, кто готов пойти со мной
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Select value={activeCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="go">Схожу</SelectItem>
              <SelectItem value="invite">Приглашу</SelectItem>
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
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between rounded-xl text-left font-normal pr-10"
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
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => onDateRangeChange(range || {})}
                  numberOfMonths={1}
                  locale={ru}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkDate = new Date(date);
                    checkDate.setHours(0, 0, 0, 0);
                    return checkDate < today;
                  }}
                />
              </PopoverContent>
            </Popover>
            {(dateRange.from || dateRange.to) && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDateRangeChange({});
                }}
              >
                <Icon name="X" size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdsFilters;