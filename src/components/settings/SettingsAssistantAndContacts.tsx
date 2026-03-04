import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { OLESYA_AVATAR } from '@/components/ai-assistant/constants';
import { DIMA_AVATAR } from '@/components/dima-assistant/constants';

interface SettingsAssistantAndContactsProps {
  preferredAssistant: 'olesya' | 'dima';
  contactPrice: number;
  onAssistantChange: (value: 'olesya' | 'dima') => void;
  onContactPriceChange: (price: number) => void;
}

const SettingsAssistantAndContacts = ({
  preferredAssistant,
  contactPrice,
  onAssistantChange,
  onContactPriceChange,
}: SettingsAssistantAndContactsProps) => {
  return (
    <>
      <div className="space-y-3">
        <div>
          <Label className="text-base font-medium">ИИ-помощник</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Выберите, кто будет вашим ИИ-собеседником в нижнем меню
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onAssistantChange('olesya')}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              preferredAssistant === 'olesya'
                ? 'border-pink-400 bg-pink-50 dark:bg-pink-950/20'
                : 'border-border hover:border-pink-200'
            }`}
          >
            <img src={OLESYA_AVATAR} alt="Олеся" className="w-10 h-10 rounded-full object-cover border-2 border-pink-300" />
            <div className="text-left">
              <p className="font-medium text-sm">Олеся</p>
              <p className="text-xs text-muted-foreground">25 лет, Москва</p>
            </div>
          </button>
          <button
            onClick={() => onAssistantChange('dima')}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              preferredAssistant === 'dima'
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                : 'border-border hover:border-blue-200'
            }`}
          >
            <img src={DIMA_AVATAR} alt="Дима" className="w-10 h-10 rounded-full object-cover border-2 border-blue-300" />
            <div className="text-left">
              <p className="font-medium text-sm">Дима</p>
              <p className="text-xs text-muted-foreground">35 лет, Москва</p>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="contact-price" className="text-base font-medium">
            Монетизация контактов
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Укажите, за сколько токенов LOVE вы готовы поделиться своими контактами (телефон, Telegram, Instagram). Если 0 — контакты доступны всем бесплатно.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            id="contact-price"
            type="number"
            min="0"
            value={contactPrice}
            onChange={(e) => onContactPriceChange(parseInt(e.target.value) || 0)}
            className="flex-1"
          />
          <span className="text-sm font-medium whitespace-nowrap">токенов LOVE</span>
        </div>
      </div>
    </>
  );
};

export default SettingsAssistantAndContacts;
