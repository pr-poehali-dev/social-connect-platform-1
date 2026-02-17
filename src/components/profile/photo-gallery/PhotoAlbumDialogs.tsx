import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Album } from './types';

interface CreateAlbumDialogProps {
  show: boolean;
  onClose: () => void;
  name: string;
  onNameChange: (v: string) => void;
  type: 'open' | 'private';
  onTypeChange: (v: 'open' | 'private') => void;
  accessKey: string;
  onAccessKeyChange: (v: string) => void;
  onCreate: () => void;
}

export const CreateAlbumDialog = ({
  show, onClose, name, onNameChange, type, onTypeChange, accessKey, onAccessKeyChange, onCreate
}: CreateAlbumDialogProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">Новый альбом</h3>
        <Input
          placeholder="Название альбома"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          className="rounded-xl"
        />
        <div className="flex gap-2">
          <Button
            variant={type === 'open' ? 'default' : 'outline'}
            onClick={() => onTypeChange('open')}
            className="flex-1 rounded-xl gap-1"
            size="sm"
          >
            <Icon name="Globe" size={14} />
            Открытый
          </Button>
          <Button
            variant={type === 'private' ? 'default' : 'outline'}
            onClick={() => onTypeChange('private')}
            className="flex-1 rounded-xl gap-1"
            size="sm"
          >
            <Icon name="Lock" size={14} />
            Закрытый
          </Button>
        </div>
        {type === 'private' && (
          <Input
            placeholder="Ключ доступа (код разблокировки)"
            value={accessKey}
            onChange={e => onAccessKeyChange(e.target.value)}
            className="rounded-xl font-mono"
          />
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Отмена</Button>
          <Button onClick={onCreate} className="flex-1 rounded-xl">Создать</Button>
        </div>
      </div>
    </div>
  );
};

interface EditAlbumDialogProps {
  album: Album | null;
  onClose: () => void;
  name: string;
  onNameChange: (v: string) => void;
  accessKey: string;
  onAccessKeyChange: (v: string) => void;
  onSave: () => void;
}

export const EditAlbumDialog = ({
  album, onClose, name, onNameChange, accessKey, onAccessKeyChange, onSave
}: EditAlbumDialogProps) => {
  if (!album) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">Редактировать альбом</h3>
        <Input
          placeholder="Название"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          className="rounded-xl"
        />
        {album.type === 'private' && (
          <Input
            placeholder="Новый ключ доступа"
            value={accessKey}
            onChange={e => onAccessKeyChange(e.target.value)}
            className="rounded-xl font-mono"
          />
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Отмена</Button>
          <Button onClick={onSave} className="flex-1 rounded-xl">Сохранить</Button>
        </div>
      </div>
    </div>
  );
};

export default CreateAlbumDialog;
