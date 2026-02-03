import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Photo {
  id: number;
  photo_url: string;
  likes_count?: number;
  is_liked?: boolean;
}

interface PhotoGalleryProps {
  photos: Photo[];
  editable?: boolean;
  onAddPhoto?: () => void;
  canLike?: boolean;
}

const PhotoGallery = ({ photos, editable = false, onAddPhoto, canLike = true }: PhotoGalleryProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos);

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
      const currentIndex = localPhotos.findIndex(p => p.id === selectedPhoto.id);
      
      if (isLeftSwipe && currentIndex < localPhotos.length - 1) {
        setSelectedPhoto(localPhotos[currentIndex + 1]);
      }
      
      if (isRightSwipe && currentIndex > 0) {
        setSelectedPhoto(localPhotos[currentIndex - 1]);
      }
    }
  };

  const goToNextPhoto = () => {
    if (selectedPhoto) {
      const currentIndex = localPhotos.findIndex(p => p.id === selectedPhoto.id);
      if (currentIndex < localPhotos.length - 1) {
        setSelectedPhoto(localPhotos[currentIndex + 1]);
      }
    }
  };

  const goToPrevPhoto = () => {
    if (selectedPhoto) {
      const currentIndex = localPhotos.findIndex(p => p.id === selectedPhoto.id);
      if (currentIndex > 0) {
        setSelectedPhoto(localPhotos[currentIndex - 1]);
      }
    }
  };

  const handleLike = async (photo: Photo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const action = photo.is_liked ? 'unlike' : 'like';
    
    try {
      const response = await fetch(`https://functions.poehali.dev/e762cdb2-751d-45d3-8ac1-62e736480782?action=${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ photo_id: photo.id })
      });

      if (response.ok) {
        const data = await response.json();
        
        setLocalPhotos(prev => prev.map(p => 
          p.id === photo.id 
            ? { ...p, is_liked: !p.is_liked, likes_count: data.likes_count }
            : p
        ));

        if (selectedPhoto && selectedPhoto.id === photo.id) {
          setSelectedPhoto({ ...photo, is_liked: !photo.is_liked, likes_count: data.likes_count });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <>
      <Card className="p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="Images" size={20} />
          Фотографии
          <span className="text-sm font-normal text-muted-foreground ml-1">
            {localPhotos.length}
          </span>
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {localPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.photo_url}
                alt={`Фото ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {canLike && (
                <button
                  onClick={(e) => handleLike(photo, e)}
                  className="absolute bottom-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon 
                    name="Heart" 
                    size={16} 
                    className={photo.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-700'}
                  />
                </button>
              )}
              {(photo.likes_count ?? 0) > 0 && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                  <Icon name="Heart" size={12} className="fill-white" />
                  {photo.likes_count}
                </div>
              )}
            </div>
          ))}
          {editable && localPhotos.length < 9 && (
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
          
          {canLike && (
            <Button
              variant="ghost"
              className="absolute top-4 left-4 text-white hover:bg-white/20 rounded-full z-10 gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleLike(selectedPhoto);
              }}
            >
              <Icon 
                name="Heart" 
                size={24} 
                className={selectedPhoto.is_liked ? 'fill-red-500 text-red-500' : ''}
              />
              {(selectedPhoto.likes_count ?? 0) > 0 && (
                <span>{selectedPhoto.likes_count}</span>
              )}
            </Button>
          )}
          
          {localPhotos.findIndex(p => p.id === selectedPhoto.id) > 0 && (
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

          {localPhotos.findIndex(p => p.id === selectedPhoto.id) < localPhotos.length - 1 && (
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
              src={selectedPhoto.photo_url}
              alt="Полное фото"
              className="w-full h-full object-contain rounded-2xl select-none"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-3 py-2 rounded-full">
              {localPhotos.map((photo, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    photo.id === selectedPhoto.id ? 'bg-white w-6' : 'bg-white/50'
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
