import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import type { Category, Subcategory, ServiceFormData } from '@/types/services';

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  categories: Category[];
  subcategories: Subcategory[];
  onSave: () => void;
}

const ServiceDialog = ({
  open,
  onOpenChange,
  isEditing,
  formData,
  onFormDataChange,
  categories,
  subcategories,
  onSave,
}: ServiceDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редактировать услугу' : 'Добавить услугу'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Вид услуг *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, category_id: value, subcategory_id: '' })
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
                  onFormDataChange({ ...formData, subcategory_id: value })
                }
                disabled={!formData.category_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.category_id ? "Выберите категорию" : "Сначала выберите вид"} />
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

          <div className="space-y-2">
            <Label>Название услуги *</Label>
            <Input
              value={formData.title}
              onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
              placeholder="Например: Профессиональный маникюр"
            />
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
              placeholder="Расскажите подробнее о вашей услуге..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Цена</Label>
              <Input
                value={formData.price}
                onChange={(e) => onFormDataChange({ ...formData, price: e.target.value })}
                placeholder="от 1000 ₽"
              />
            </div>

            <div className="space-y-2">
              <Label>Город</Label>
              <Input
                value={formData.city}
                onChange={(e) => onFormDataChange({ ...formData, city: e.target.value })}
                placeholder="Москва"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Район</Label>
            <Input
              value={formData.district}
              onChange={(e) => onFormDataChange({ ...formData, district: e.target.value })}
              placeholder="Центральный"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="online"
              checked={formData.is_online}
              onCheckedChange={(checked) =>
                onFormDataChange({ ...formData, is_online: checked })
              }
            />
            <Label htmlFor="online" className="cursor-pointer">
              Услуга доступна онлайн
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onSave} className="flex-1">
              {isEditing ? 'Сохранить' : 'Добавить'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDialog;