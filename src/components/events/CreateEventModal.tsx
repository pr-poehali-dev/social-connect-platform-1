import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewEventData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  category: string;
  price: number;
  maxParticipants: number;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEvent: NewEventData;
  onEventChange: (event: NewEventData) => void;
  onCreate: () => void;
}

const CreateEventModal = ({ isOpen, onClose, newEvent, onEventChange, onCreate }: CreateEventModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Создать новое мероприятие</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название мероприятия *</Label>
            <Input
              id="title"
              placeholder="Например: Йога в парке"
              value={newEvent.title}
              onChange={(e) => onEventChange({ ...newEvent, title: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Расскажите о мероприятии..."
              value={newEvent.description}
              onChange={(e) => onEventChange({ ...newEvent, description: e.target.value })}
              className="rounded-xl min-h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Дата *</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.date}
                onChange={(e) => onEventChange({ ...newEvent, date: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Время *</Label>
              <Input
                id="time"
                type="time"
                value={newEvent.time}
                onChange={(e) => onEventChange({ ...newEvent, time: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Место проведения *</Label>
            <Input
              id="location"
              placeholder="Например: Парк Горького"
              value={newEvent.location}
              onChange={(e) => onEventChange({ ...newEvent, location: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Город *</Label>
            <Input
              id="city"
              placeholder="Например: Москва"
              value={newEvent.city}
              onChange={(e) => onEventChange({ ...newEvent, city: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Категория</Label>
            <Select value={newEvent.category} onValueChange={(value) => onEventChange({ ...newEvent, category: value })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sports">Спорт</SelectItem>
                <SelectItem value="culture">Культура</SelectItem>
                <SelectItem value="entertainment">Развлечения</SelectItem>
                <SelectItem value="business">Бизнес</SelectItem>
                <SelectItem value="education">Образование</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Цена (₽)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={newEvent.price}
                onChange={(e) => onEventChange({ ...newEvent, price: Number(e.target.value) })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Макс. участников</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                value={newEvent.maxParticipants}
                onChange={(e) => onEventChange({ ...newEvent, maxParticipants: Number(e.target.value) })}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              className="flex-1 rounded-xl"
              onClick={onCreate}
            >
              Создать мероприятие
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
