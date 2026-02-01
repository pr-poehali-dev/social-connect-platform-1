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
import type { Category, Subcategory, ServiceFormData, City } from '@/types/services';
import Icon from '@/components/ui/icon';
import { useRef } from 'react';

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  categories: Category[];
  subcategories: Subcategory[];
  cities: City[];
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
  cities,
  onSave,
}: ServiceDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentCount = formData.portfolio.length;
    const availableSlots = 10 - currentCount;
    
    if (availableSlots <= 0) {
      alert('Максимум 10 фотографий');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    
    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create square canvas
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          canvas.width = 800;
          canvas.height = 800;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          // Draw centered square crop
          const offsetX = (img.width - size) / 2;
          const offsetY = (img.height - size) / 2;
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 800, 800);
          
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          onFormDataChange({ 
            ...formData, 
            portfolio: [...formData.portfolio, base64] 
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    onFormDataChange({
      ...formData,
      portfolio: formData.portfolio.filter((_, i) => i !== index)
    });
  };
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
              <Select
                value={formData.city_id}
                onValueChange={(value) => onFormDataChange({ ...formData, city_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <div className="space-y-2">
            <Label>Портфолио (до 10 фото, формат 1:1)</Label>
            <div className="grid grid-cols-5 gap-2">
              {formData.portfolio.map((img, idx) => (
                <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                  <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ))}
              {formData.portfolio.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300"
                >
                  <Icon name="Plus" size={24} />
                  <span className="text-xs text-gray-600">Добавить</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
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