import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Filters {
  gender: string;
  ageFrom: string;
  ageTo: string;
  city: string;
  online: boolean;
  withPhoto: boolean;
  district: string;
  heightFrom: string;
  heightTo: string;
  bodyType: string;
  maritalStatus: string;
  hasChildren: string;
  financialStatus: string;
  hasCar: string;
  hasHousing: string;
  datingGoal: string;
}

interface DatingFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  filters: Filters;
  handleFilterChange: (key: string, value: string | boolean) => void;
  resetFilters: () => void;
}

const DatingFilters = ({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  filters,
  handleFilterChange,
  resetFilters,
}: DatingFiltersProps) => {
  return (
    <div className="mb-12">
      <div className="flex gap-4 items-start">
        <div className="flex-1 relative">
          <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени, городу, интересам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-6 rounded-2xl"
          />
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant={showFilters ? "default" : "outline"}
          className="gap-2 rounded-2xl py-6 px-6"
        >
          <Icon name="SlidersHorizontal" size={20} />
          Фильтры
        </Button>
      </div>

      {showFilters && (
        <Card className="mt-4 rounded-3xl border-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Пол</Label>
                <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Не важно" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужской</SelectItem>
                    <SelectItem value="female">Женский</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 lg:col-span-2">
                <div className="flex justify-between items-center">
                  <Label className="text-muted-foreground">Возраст</Label>
                  <span className="text-sm font-medium">{filters.ageFrom || 18}–{filters.ageTo || 99}</span>
                </div>
                <div className="relative pt-2 pb-4">
                  <div className="relative h-1 bg-muted rounded-full">
                    <div 
                      className="absolute h-1 bg-primary rounded-full"
                      style={{
                        left: `${((Number(filters.ageFrom) || 18) - 18) / (99 - 18) * 100}%`,
                        right: `${100 - ((Number(filters.ageTo) || 99) - 18) / (99 - 18) * 100}%`
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="99"
                    value={filters.ageFrom || 18}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val <= (Number(filters.ageTo) || 99)) {
                        handleFilterChange('ageFrom', e.target.value);
                      }
                    }}
                    className="absolute top-0 w-full h-8 bg-transparent appearance-none cursor-pointer pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
                    style={{ zIndex: filters.ageFrom === filters.ageTo ? 2 : 1 }}
                  />
                  <input
                    type="range"
                    min="18"
                    max="99"
                    value={filters.ageTo || 99}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= (Number(filters.ageFrom) || 18)) {
                        handleFilterChange('ageTo', e.target.value);
                      }
                    }}
                    className="absolute top-0 w-full h-8 bg-transparent appearance-none cursor-pointer pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
                    style={{ zIndex: 2 }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Город</Label>
                <Input
                  placeholder="Москва"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Район</Label>
                <Input
                  placeholder="Центральный"
                  value={filters.district}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.online}
                    onChange={(e) => handleFilterChange('online', e.target.checked)}
                    className="rounded"
                  />
                  Только онлайн
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.withPhoto}
                    onChange={(e) => handleFilterChange('withPhoto', e.target.checked)}
                    className="rounded"
                  />
                  Только с фото
                </Label>
              </div>

              <div className="space-y-3 lg:col-span-2">
                <div className="flex justify-between items-center">
                  <Label className="text-muted-foreground">Рост</Label>
                  <span className="text-sm font-medium">{filters.heightFrom || 150}–{filters.heightTo || 200} см</span>
                </div>
                <div className="relative pt-2 pb-4">
                  <div className="relative h-1 bg-muted rounded-full">
                    <div 
                      className="absolute h-1 bg-primary rounded-full"
                      style={{
                        left: `${((Number(filters.heightFrom) || 150) - 150) / (200 - 150) * 100}%`,
                        right: `${100 - ((Number(filters.heightTo) || 200) - 150) / (200 - 150) * 100}%`
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="200"
                    value={filters.heightFrom || 150}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val <= (Number(filters.heightTo) || 200)) {
                        handleFilterChange('heightFrom', e.target.value);
                      }
                    }}
                    className="absolute top-0 w-full h-8 bg-transparent appearance-none cursor-pointer pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
                    style={{ zIndex: filters.heightFrom === filters.heightTo ? 2 : 1 }}
                  />
                  <input
                    type="range"
                    min="150"
                    max="200"
                    value={filters.heightTo || 200}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= (Number(filters.heightFrom) || 150)) {
                        handleFilterChange('heightTo', e.target.value);
                      }
                    }}
                    className="absolute top-0 w-full h-8 bg-transparent appearance-none cursor-pointer pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
                    style={{ zIndex: 2 }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Телосложение</Label>
                <Select value={filters.bodyType} onValueChange={(value) => handleFilterChange('bodyType', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Не важно" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slim">Стройное</SelectItem>
                    <SelectItem value="athletic">Спортивное</SelectItem>
                    <SelectItem value="average">Среднее</SelectItem>
                    <SelectItem value="curvy">Полное</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Семейное положение</Label>
                <Select value={filters.maritalStatus} onValueChange={(value) => handleFilterChange('maritalStatus', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Не важно" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Не женат / не замужем</SelectItem>
                    <SelectItem value="divorced">В разводе</SelectItem>
                    <SelectItem value="widowed">Вдовец / вдова</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Наличие детей</Label>
                <Select value={filters.hasChildren} onValueChange={(value) => handleFilterChange('hasChildren', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Не важно" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Нет</SelectItem>
                    <SelectItem value="yes">Есть</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Финансовое положение</Label>
                <Select value={filters.financialStatus} onValueChange={(value) => handleFilterChange('financialStatus', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Не важно" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Ниже среднего</SelectItem>
                    <SelectItem value="average">Среднее</SelectItem>
                    <SelectItem value="above">Выше среднего</SelectItem>
                    <SelectItem value="high">Высокое</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Наличие авто</Label>
                <Select value={filters.hasCar} onValueChange={(value) => handleFilterChange('hasCar', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Не важно" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Нет</SelectItem>
                    <SelectItem value="yes">Есть</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Наличие жилья</Label>
                <Select value={filters.hasHousing} onValueChange={(value) => handleFilterChange('hasHousing', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Не важно" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Нет</SelectItem>
                    <SelectItem value="rent">Арендую</SelectItem>
                    <SelectItem value="own">Собственное</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Цель знакомства</Label>
                <Select value={filters.datingGoal} onValueChange={(value) => handleFilterChange('datingGoal', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Не важно" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendship">Дружба</SelectItem>
                    <SelectItem value="dating">Романтические отношения</SelectItem>
                    <SelectItem value="serious">Серьёзные отношения</SelectItem>
                    <SelectItem value="marriage">Создание семьи</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={resetFilters} variant="outline" className="rounded-xl">
                Сбросить
              </Button>
              <Button onClick={() => setShowFilters(false)} className="rounded-xl flex-1">
                Применить фильтры
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DatingFilters;