import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import ImageCropper from '@/components/profile/ImageCropper';

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
  image?: string;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEvent: NewEventData;
  onEventChange: (event: NewEventData) => void;
  onCreate: () => void;
  isEdit?: boolean;
}

const CreateEventModal = ({ isOpen, onClose, newEvent, onEventChange, onCreate, isEdit = false }: CreateEventModalProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    setSelectedFile(file);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setSelectedFile(null);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onEventChange({ ...newEvent, image: base64String });
        setIsUploading(false);
      };
      reader.readAsDataURL(croppedBlob);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Не удалось загрузить изображение');
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onEventChange({ ...newEvent, image: undefined });
  };

  return (
    <>
      {showCropper && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setSelectedFile(null);
          }}
        />
      )}
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{isEdit ? 'Редактировать мероприятие' : 'Создать новое мероприятие'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Изображение мероприятия</Label>
            {newEvent.image ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-300">
                <img
                  src={newEvent.image}
                  alt="Превью"
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 rounded-lg"
                  onClick={handleRemoveImage}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors bg-gray-50"
              >
                {isUploading ? (
                  <div className="text-center">
                    <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Загрузка...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Icon name="Upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">Нажмите для загрузки</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG до 5 МБ</p>
                  </div>
                )}
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

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
              {isEdit ? 'Сохранить изменения' : 'Создать мероприятие'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default CreateEventModal;