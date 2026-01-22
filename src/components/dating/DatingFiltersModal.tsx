import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Slider } from '@/components/ui/slider';
import { DatingFilters } from '@/pages/Dating';

interface DatingFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DatingFilters;
  onFilterChange: (filters: Partial<DatingFilters>) => void;
  onSave: () => void;
}

const DatingFiltersModal = ({ isOpen, onClose, filters, onFilterChange, onSave }: DatingFiltersModalProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  if (!isOpen) return null;

  const handleLocalChange = (key: keyof DatingFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onFilterChange(localFilters);
    onSave();
  };

  const goalLabels: Record<string, string> = {
    friendship: 'Дружеское общение',
    relationship: 'Серьёзные отношения',
    flirt: 'Флирт и свидания',
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b z-10">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold">Фильтры</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <Icon name="X" size={24} />
          </Button>
        </div>
      </div>

      <div className="pb-32">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="MapPin" size={24} />
            <div>
              <div className="font-semibold">Местоположение</div>
              <div className="text-sm text-muted-foreground">{localFilters.location}</div>
            </div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="p-4 border-b">
          <div className="mb-4">
            <span className="font-semibold">Ищу</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={localFilters.lookingFor === 'male' ? 'default' : 'outline'} 
              className="rounded-full px-6"
              onClick={() => handleLocalChange('lookingFor', 'male')}
            >
              Друга
            </Button>
            <Button 
              variant={localFilters.lookingFor === 'female' ? 'default' : 'outline'} 
              className="rounded-full px-6"
              onClick={() => handleLocalChange('lookingFor', 'female')}
            >
              Девушку
            </Button>
            <Button 
              variant={localFilters.lookingFor === 'any' ? 'default' : 'outline'} 
              className="rounded-full px-6"
              onClick={() => handleLocalChange('lookingFor', 'any')}
            >
              Неважно
            </Button>
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Возраст</span>
            <span className="text-muted-foreground">{localFilters.ageFrom}–{localFilters.ageTo}</span>
          </div>
          <Slider 
            value={[localFilters.ageFrom, localFilters.ageTo]} 
            max={100} 
            min={18} 
            step={1}
            onValueChange={(value) => {
              handleLocalChange('ageFrom', value[0]);
              handleLocalChange('ageTo', value[1]);
            }}
          />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Heart" size={24} />
            <div>
              <div className="font-semibold">Цель знакомства</div>
              <div className="text-sm text-muted-foreground">
                {localFilters.goals.length > 0 
                  ? localFilters.goals.map(g => goalLabels[g]).join(', ')
                  : 'Не выбрано'}
              </div>
            </div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="GraduationCap" size={24} />
            <div className="font-semibold">Образование</div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Wallet" size={24} />
            <div className="font-semibold">Материальное положение</div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Home" size={24} />
            <div className="font-semibold">Условия проживания</div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Baby" size={24} />
            <div className="font-semibold">Дети</div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Cigarette" size={24} />
            <div className="font-semibold">Курение</div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Wine" size={24} />
            <div className="font-semibold">Алкоголь</div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Hash" size={24} />
            <div className="font-semibold">Интересы</div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Languages" size={24} />
            <div className="font-semibold">Языки</div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="User" size={24} />
            <div className="font-semibold">Внешность</div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Dumbbell" size={24} />
            <div className="font-semibold">Телосложение</div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Рост</span>
            <span className="text-muted-foreground">{localFilters.heightFrom}–{localFilters.heightTo} см</span>
          </div>
          <Slider 
            value={[localFilters.heightFrom, localFilters.heightTo]} 
            max={250} 
            min={140} 
            step={1}
            onValueChange={(value) => {
              handleLocalChange('heightFrom', value[0]);
              handleLocalChange('heightTo', value[1]);
            }}
          />
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Вес</span>
            <span className="text-muted-foreground">{localFilters.weightFrom}–{localFilters.weightTo} кг</span>
          </div>
          <Slider 
            value={[localFilters.weightFrom, localFilters.weightTo]} 
            max={200} 
            min={30} 
            step={1}
            onValueChange={(value) => {
              handleLocalChange('weightFrom', value[0]);
              handleLocalChange('weightTo', value[1]);
            }}
          />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Sparkles" size={24} />
            <div className="font-semibold">Знак зодиака</div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="UserCircle" size={24} />
            <div>
              <div className="font-semibold">Новизна профиля</div>
              <div className="text-sm text-muted-foreground">
                {localFilters.profileAge === 'all' ? 'Все' : localFilters.profileAge === 'new' ? 'Новые' : 'Активные'}
              </div>
            </div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Image" size={24} />
            <div>
              <div className="font-semibold">Фотографии</div>
              <div className="text-sm text-muted-foreground">
                {localFilters.withPhoto ? 'Только с фото' : 'Все профили'}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLocalChange('withPhoto', !localFilters.withPhoto)}
          >
            {localFilters.withPhoto ? 'Вкл' : 'Выкл'}
          </Button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button 
          className="w-full rounded-2xl py-6 text-lg font-semibold"
          onClick={handleSave}
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
};

export default DatingFiltersModal;