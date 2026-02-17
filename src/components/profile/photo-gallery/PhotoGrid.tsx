import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Photo } from './types';

interface PhotoGridProps {
  photos: Photo[];
  editMode: boolean;
  canLike: boolean;
  activeAlbumId: number | null;
  onPhotoClick: (photoId: number) => void;
  onLike: (photo: Photo, e?: React.MouseEvent) => void;
  onDelete: (photoId: number) => void;
  onTriggerFileInput: (position: number) => void;
}

const PhotoGrid = ({
  photos, editMode, canLike, activeAlbumId,
  onPhotoClick, onLike, onDelete, onTriggerFileInput
}: PhotoGridProps) => {
  if (photos.length === 0 && !editMode) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">Нет фотографий</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {photos.map((photo, index) => (
        <div key={photo.id} className="relative aspect-square group">
          <img
            src={photo.photo_url}
            alt={`Фото ${index + 1}`}
            className="w-full h-full object-cover rounded-2xl cursor-pointer"
            onClick={() => !editMode && onPhotoClick(photo.id)}
          />
          {canLike && !editMode && (
            <>
              <button
                onClick={(e) => onLike(photo, e)}
                className="absolute bottom-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon name="Heart" size={16} className={photo.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-700'} />
              </button>
              {(photo.likes_count ?? 0) > 0 && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                  <Icon name="Heart" size={12} className="fill-white" />
                  {photo.likes_count}
                </div>
              )}
            </>
          )}
          {editMode && (
            <>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 rounded-2xl flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full w-10 h-10 bg-white text-primary hover:bg-white/90"
                  onClick={() => onTriggerFileInput(photo.position)}
                >
                  <Icon name="Camera" size={20} />
                </Button>
              </div>
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full w-8 h-8"
                onClick={() => onDelete(photo.id)}
              >
                <Icon name="X" size={16} />
              </Button>
            </>
          )}
        </div>
      ))}

      {editMode && activeAlbumId && (
        <div className="relative aspect-square">
          <button
            onClick={() => onTriggerFileInput(photos.length)}
            className="w-full h-full border-2 border-dashed border-muted-foreground/30 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Icon name="Plus" size={32} />
            <span className="text-xs">Добавить фото</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoGrid;
