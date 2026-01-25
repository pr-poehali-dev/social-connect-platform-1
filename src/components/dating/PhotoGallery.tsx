import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PhotoGalleryProps {
  photos: string[];
  editable?: boolean;
  onAddPhoto?: () => void;
}

const PhotoGallery = ({ photos, editable = false, onAddPhoto }: PhotoGalleryProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (selectedPhoto) {
      const currentIndex = photos.indexOf(selectedPhoto);
      
      if (isLeftSwipe && currentIndex < photos.length - 1) {
        setSelectedPhoto(photos[currentIndex + 1]);
      }
      
      if (isRightSwipe && currentIndex > 0) {
        setSelectedPhoto(photos[currentIndex - 1]);
      }
    }
  };

  const goToNextPhoto = () => {
    if (selectedPhoto) {
      const currentIndex = photos.indexOf(selectedPhoto);
      if (currentIndex < photos.length - 1) {
        setSelectedPhoto(photos[currentIndex + 1]);
      }
    }
  };

  const goToPrevPhoto = () => {
    if (selectedPhoto) {
      const currentIndex = photos.indexOf(selectedPhoto);
      if (currentIndex > 0) {
        setSelectedPhoto(photos[currentIndex - 1]);
      }
    }
  };

  return (
    <>
      <Card className="p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="Images" size={20} />
          Фотографии
          <span className="text-sm font-normal text-muted-foreground ml-1">
            {photos.length}
          </span>
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo}
                alt={`Фото ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {editable && photos.length < 9 && (
            <button
              onClick={onAddPhoto}
              className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center"
            >
              <Icon name="Plus" size={32} className="text-muted-foreground/50" />
            </button>
          )}
        </div>
      </Card>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full z-10"
            onClick={() => setSelectedPhoto(null)}
          >
            <Icon name="X" size={24} />
          </Button>
          
          {photos.indexOf(selectedPhoto) > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full z-10 hidden md:flex"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevPhoto();
              }}
            >
              <Icon name="ChevronLeft" size={32} />
            </Button>
          )}

          {photos.indexOf(selectedPhoto) < photos.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full z-10 hidden md:flex"
              onClick={(e) => {
                e.stopPropagation();
                goToNextPhoto();
              }}
            >
              <Icon name="ChevronRight" size={32} />
            </Button>
          )}
          
          <div 
            className="relative max-w-4xl w-full max-h-[90vh]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={selectedPhoto}
              alt="Полное фото"
              className="w-full h-full object-contain rounded-2xl select-none"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-3 py-2 rounded-full">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    photo === selectedPhoto ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(photo);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;