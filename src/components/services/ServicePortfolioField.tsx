import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import type { ServiceFormData } from '@/types/services';

interface ServicePortfolioFieldProps {
  formData: ServiceFormData;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

const ServicePortfolioField = ({
  formData,
  fileInputRef,
  onUpload,
  onRemove,
}: ServicePortfolioFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>Портфолио (до 10 фото, формат 1:1)</Label>
      <div className="grid grid-cols-3 gap-2">
        {formData.portfolio.map((img, idx) => (
          <div key={idx} className="relative aspect-square">
            <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => onRemove(idx)}
            >
              <Icon name="X" size={12} />
            </Button>
          </div>
        ))}
        {formData.portfolio.length < 10 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
          >
            <Icon name="Plus" size={24} />
            <span className="text-xs mt-1">Добавить</span>
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onUpload}
        className="hidden"
      />
    </div>
  );
};

export default ServicePortfolioField;
