import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { Category, Subcategory, ServiceFormData } from '@/types/services';

interface ServiceCategoryFieldsProps {
  formData: ServiceFormData;
  setFormData: (data: ServiceFormData) => void;
  categories: Category[];
  subcategories: Subcategory[];
  professionHint: string | null;
}

const ServiceCategoryFields = ({
  formData,
  setFormData,
  categories,
  subcategories,
  professionHint,
}: ServiceCategoryFieldsProps) => {
  return (
    <>
      {professionHint && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
          <Icon name="Sparkles" size={16} />
          Категория подобрана по вашей профессии: <strong>{professionHint}</strong>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Вид услуг *</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) =>
              setFormData({ ...formData, category_id: value, subcategory_id: '' })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите вид услуг" />
            </SelectTrigger>
            <SelectContent>
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
          <Select
            value={formData.subcategory_id}
            onValueChange={(value) =>
              setFormData({ ...formData, subcategory_id: value })
            }
            disabled={!formData.category_id}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.category_id ? 'Выберите категорию' : 'Сначала выберите вид'} />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.id.toString()}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default ServiceCategoryFields;
