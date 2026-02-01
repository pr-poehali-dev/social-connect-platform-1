import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Service {
  id: number;
  category_id: number;
  subcategory_id: number;
  title: string;
  description: string;
  price: string;
  is_online: boolean;
  is_active: boolean;
  city: string;
  district: string;
  category_name: string;
  subcategory_name: string;
  created_at: string;
}

interface ServiceCardProps {
  service: Service;
  onToggleActive: (service: Service) => void;
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
}

const ServiceCard = ({ service, onToggleActive, onEdit, onDelete }: ServiceCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold">{service.title}</h3>
            {service.is_online && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Онлайн
              </span>
            )}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                service.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {service.is_active ? 'Активна' : 'Неактивна'}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-1">
            {service.category_name} › {service.subcategory_name}
          </p>

          {service.description && (
            <p className="text-sm text-gray-700 mb-2">{service.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            {service.price && <span className="font-semibold text-primary">{service.price}</span>}
            {service.city && (
              <span className="flex items-center gap-1">
                <Icon name="MapPin" size={14} />
                {service.city}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(service)}
          >
            <Icon name={service.is_active ? 'EyeOff' : 'Eye'} size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(service)}
          >
            <Icon name="Pencil" size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(service.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Icon name="Trash2" size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
