import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { Service } from '@/types/services';

interface ServiceCardProps {
  service: Service;
  onToggleActive: (service: Service) => void;
  onDelete: (id: number) => void;
  subcategories?: Array<{ id: number; name: string }>;
  onLoadSubcategories?: (categoryId: number) => void;
}

const ServiceCard = ({ service, onToggleActive, onDelete, subcategories, onLoadSubcategories }: ServiceCardProps) => {
  const navigate = useNavigate();
  const [showSubcategories, setShowSubcategories] = useState(false);

  const handleCategoryHover = () => {
    if (onLoadSubcategories && service.category_id) {
      onLoadSubcategories(service.category_id);
    }
    setShowSubcategories(true);
  };

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

          <div 
            className="relative inline-block"
            onMouseEnter={handleCategoryHover}
            onMouseLeave={() => setShowSubcategories(false)}
          >
            <p className="text-sm text-gray-600 mb-1 cursor-pointer hover:text-primary transition-colors">
              {service.category_name} › {service.subcategory_name}
            </p>
            
            {showSubcategories && subcategories && subcategories.length > 0 && (
              <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-3 z-10 min-w-[200px]">
                <p className="text-xs font-semibold text-gray-500 mb-2">Подкатегории:</p>
                <div className="space-y-1">
                  {subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className={`text-sm px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                        sub.id === service.subcategory_id ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                      }`}
                    >
                      {sub.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {service.description && (
            <p className="text-sm text-gray-700 mb-2">{service.description}</p>
          )}

          {service.price_list && service.price_list.length > 0 && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2">Прайс-лист:</p>
              <div className="space-y-1">
                {service.price_list.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.service}</span>
                    <div className="flex items-center gap-2">
                      {item.time && <span className="text-xs text-gray-500">{item.time}</span>}
                      <span className="font-semibold text-primary">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {service.portfolio && service.portfolio.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto">
              {service.portfolio.slice(0, 5).map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt={`Portfolio ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              ))}
              {service.portfolio.length > 5 && (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-600 flex-shrink-0">
                  +{service.portfolio.length - 5}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            {service.price && <span className="font-semibold text-primary">{service.price}</span>}
            {service.city_name && (
              <span className="flex items-center gap-1">
                <Icon name="MapPin" size={14} />
                {service.city_name}
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
            onClick={() => navigate(`/edit-service/${service.id}`)}
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