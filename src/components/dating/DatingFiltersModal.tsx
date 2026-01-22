import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface DatingFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DatingFiltersModal = ({ isOpen, onClose }: DatingFiltersModalProps) => {
  if (!isOpen) return null;

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
              <div className="text-sm text-muted-foreground">Екатеринбург, Свердловская область</div>
            </div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="p-4 border-b">
          <div className="mb-4">
            <span className="font-semibold">Ищу</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full px-6">Друга</Button>
            <Button variant="default" className="rounded-full px-6">Девушку</Button>
            <Button variant="outline" className="rounded-full px-6">Неважно</Button>
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Возраст</span>
            <span className="text-muted-foreground">18–24</span>
          </div>
          <Slider defaultValue={[18, 24]} max={100} min={18} step={1} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Heart" size={24} />
            <div>
              <div className="font-semibold">Цель знакомства</div>
              <div className="text-sm text-muted-foreground">Дружеское общение, Серьёзные отношения, Флирт и свидания</div>
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
            <span className="text-muted-foreground">150–220 см</span>
          </div>
          <Slider defaultValue={[150, 220]} max={250} min={140} step={1} />
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Вес</span>
            <span className="text-muted-foreground">40–160 кг</span>
          </div>
          <Slider defaultValue={[40, 160]} max={200} min={30} step={1} />
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
              <div className="text-sm text-muted-foreground">Все</div>
            </div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>

        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Image" size={24} />
            <div>
              <div className="font-semibold">Фотографии</div>
              <div className="text-sm text-muted-foreground">Только с фото</div>
            </div>
          </div>
          <Icon name="ChevronRight" size={20} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button 
          className="w-full rounded-2xl py-6 text-lg font-semibold"
          onClick={onClose}
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
};

export default DatingFiltersModal;
