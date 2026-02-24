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
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useAddService } from '@/hooks/useAddService';
import ServiceCategoryFields from '@/components/services/ServiceCategoryFields';
import ServicePriceFields from '@/components/services/ServicePriceFields';
import ServicePortfolioField from '@/components/services/ServicePortfolioField';

const AddService = () => {
  const {
    id,
    navigate,
    formData,
    setFormData,
    categories,
    subcategories,
    cities,
    loading,
    professionHint,
    fileInputRef,
    handleImageUpload,
    removeImage,
    handleSave,
  } = useAddService();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/my-services')}>
            <Icon name="X" size={24} />
          </Button>
          <h1 className="text-lg font-semibold">{id ? 'Редактировать' : 'Добавить услугу'}</h1>
          <Button onClick={handleSave} disabled={loading} size="sm">
            {loading ? <Icon name="Loader2" className="animate-spin" size={16} /> : 'Готово'}
          </Button>
        </div>
      </div>

      <div className="p-4 pb-20 space-y-4">
        <ServiceCategoryFields
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          subcategories={subcategories}
          professionHint={professionHint}
        />

        <div className="space-y-2">
          <Label>Название услуги *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Например: Профессиональный маникюр"
          />
        </div>

        <div className="space-y-2">
          <Label>Описание</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Расскажите подробнее о вашей услуге..."
            rows={4}
          />
        </div>

        <ServicePriceFields formData={formData} setFormData={setFormData} />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Город</Label>
            <Select
              value={formData.city_id}
              onValueChange={(value) => setFormData({ ...formData, city_id: value })}
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

          <div className="space-y-2">
            <Label>Район</Label>
            <Input
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder="Центральный"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <Label className="cursor-pointer flex-1">Услуга доступна онлайн</Label>
          <Switch
            checked={formData.is_online}
            onCheckedChange={(checked) => setFormData({ ...formData, is_online: checked })}
          />
        </div>

        <ServicePortfolioField
          formData={formData}
          fileInputRef={fileInputRef}
          onUpload={handleImageUpload}
          onRemove={removeImage}
        />

        <Button onClick={handleSave} disabled={loading} className="w-full" size="lg">
          {loading ? <Icon name="Loader2" className="animate-spin mr-2" size={20} /> : null}
          {id ? 'Сохранить изменения' : 'Добавить услугу'}
        </Button>

        <Button variant="outline" onClick={() => navigate('/my-services')} className="w-full">
          Отмена
        </Button>
      </div>
    </div>
  );
};

export default AddService;
