import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { russianCities } from '@/data/cities';
import type { Category, Subcategory } from '@/types/services';

interface ServicesFiltersProps {
  categoryId: string;
  subcategoryId: string;
  city: string;
  onlineOnly: boolean;
  categories: Category[];
  subcategories: Subcategory[];
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onOnlineOnlyChange: (checked: boolean) => void;
}

const ServicesFilters = ({
  categoryId,
  subcategoryId,
  city,
  onlineOnly,
  categories,
  subcategories,
  onCategoryChange,
  onSubcategoryChange,
  onCityChange,
  onOnlineOnlyChange,
}: ServicesFiltersProps) => {
  return (
    <Card className="rounded-3xl border-2">
      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-4">Фильтры</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Вид услуг</Label>
            <Select value={categoryId} onValueChange={onCategoryChange}>
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
            <Select value={subcategoryId} onValueChange={onSubcategoryChange} disabled={!categoryId}>
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
            <Select value={city} onValueChange={onCityChange}>
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
                onCheckedChange={(checked) => onOnlineOnlyChange(checked as boolean)}
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
  );
};

export default ServicesFilters;