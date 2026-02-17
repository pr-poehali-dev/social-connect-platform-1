import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Photo } from './types';

interface PhotoFullscreenProps {
  photos: Photo[];
  activePhotoId: number | null;
  editMode: boolean;
  onClose: () => void;
  onNavigate: (photoId: number) => void;
  onDelete: (photoId: number) => void;
}

const PhotoFullscreen = ({
  photos, activePhotoId, editMode, onClose, onNavigate, onDelete
}: PhotoFullscreenProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  if (activePhotoId === null) return null;

  const currentPhoto = photos.find(p => p.id === activePhotoId);
  const currentIdx = photos.findIndex(p => p.id === activePhotoId);
  if (!currentPhoto) return null;

  const handleTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const handleTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50 && currentIdx < photos.length - 1) onNavigate(photos[currentIdx + 1].id);
    if (distance < -50 && currentIdx > 0) onNavigate(photos[currentIdx - 1].id);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-12 h-12 z-10" onClick={onClose}>
        <Icon name="X" size={24} />
      </Button>
      {editMode && (
        <Button size="icon" variant="destructive" className="absolute top-4 right-20 rounded-full w-12 h-12 z-10" onClick={async (e) => {
          e.stopPropagation();
          onDelete(currentPhoto.id);
        }}>
          <Icon name="Trash2" size={20} />
        </Button>
      )}
      <Button size="icon" variant="ghost"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 disabled:opacity-30"
        disabled={currentIdx <= 0}
        onClick={(e) => { e.stopPropagation(); if (currentIdx > 0) onNavigate(photos[currentIdx - 1].id); }}
      >
        <Icon name="ChevronLeft" size={28} />
      </Button>
      <img
        src={currentPhoto.photo_url}
        alt="Фото"
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />
      <Button size="icon" variant="ghost"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 disabled:opacity-30"
        disabled={currentIdx >= photos.length - 1}
        onClick={(e) => { e.stopPropagation(); if (currentIdx < photos.length - 1) onNavigate(photos[currentIdx + 1].id); }}
      >
        <Icon name="ChevronRight" size={28} />
      </Button>
      <div className="absolute bottom-4 text-white/60 text-sm">
        {currentIdx + 1} / {photos.length}
      </div>
    </div>
  );
};

export default PhotoFullscreen;
