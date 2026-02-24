import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import type { ServiceFormData } from '@/types/services';

interface ServicePriceFieldsProps {
  formData: ServiceFormData;
  setFormData: (data: ServiceFormData) => void;
}

const ServicePriceFields = ({ formData, setFormData }: ServicePriceFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label>Цена (краткая)</Label>
        <Input
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="от 1000 ₽"
        />
      </div>

      <div className="space-y-2">
        <Label>Прайс-лист (подробный)</Label>
        <div className="space-y-2">
          {(formData.price_list || []).map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <Input
                className="col-span-5"
                value={item.service}
                onChange={(e) => {
                  const newList = [...(formData.price_list || [])];
                  newList[idx].service = e.target.value;
                  setFormData({ ...formData, price_list: newList });
                }}
                placeholder="Название услуги"
              />
              <Input
                className="col-span-3"
                value={item.price}
                onChange={(e) => {
                  const newList = [...(formData.price_list || [])];
                  newList[idx].price = e.target.value;
                  setFormData({ ...formData, price_list: newList });
                }}
                placeholder="Цена"
              />
              <Input
                className="col-span-3"
                value={item.time || ''}
                onChange={(e) => {
                  const newList = [...(formData.price_list || [])];
                  newList[idx].time = e.target.value;
                  setFormData({ ...formData, price_list: newList });
                }}
                placeholder="Время"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="col-span-1"
                onClick={() => {
                  const newList = (formData.price_list || []).filter((_, i) => i !== idx);
                  setFormData({ ...formData, price_list: newList });
                }}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setFormData({
                ...formData,
                price_list: [...(formData.price_list || []), { service: '', price: '', time: '' }],
              });
            }}
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить позицию
          </Button>
        </div>
      </div>
    </>
  );
};

export default ServicePriceFields;
