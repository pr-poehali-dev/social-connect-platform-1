import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ImageCropper from './ImageCropper';

interface Photo {
  id: number;
  photo_url: string;
  position: number;
  created_at: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  editMode: boolean;
  onPhotosUpdate: () => void;
}

const GALLERY_URL = 'https://functions.poehali.dev/e762cdb2-751d-45d3-8ac1-62e736480782';

const PhotoGallery = ({ photos, editMode, onPhotosUpdate }: PhotoGalleryProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [uploadingPosition, setUploadingPosition] = useState<number | null>(null);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<number | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, position: number) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Ошибка',
          description: 'Выберите файл изображения',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      setUploadingPosition(position);
      setShowCropper(true);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setSelectedFile(null);

    if (uploadingPosition === null) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${GALLERY_URL}?action=upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            image: base64String,
            position: uploadingPosition
          })
        });

        if (response.ok) {
          toast({
            title: 'Фото добавлено',
            description: 'Фотография успешно загружена в галерею',
          });
          onPhotosUpdate();
        } else {
          throw new Error('Upload failed');
        }
      };
      reader.readAsDataURL(croppedBlob);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить фото',
        variant: 'destructive',
      });
    } finally {
      setUploadingPosition(null);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${GALLERY_URL}?photo_id=${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Фото удалено',
          description: 'Фотография успешно удалена из галереи',
        });
        onPhotosUpdate();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: 'Ошибка удаления',
        description: 'Не удалось удалить фото',
        variant: 'destructive',
      });
    }
  };

  const slots = Array.from({ length: 9 }, (_, i) => {
    const photo = photos.find(p => p.position === i);
    return { position: i, photo };
  });

  return (
    <>
      {showCropper && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setSelectedFile(null);
            setUploadingPosition(null);
          }}
        />
      )}
      <Card className="rounded-3xl border-2">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Галерея фотографий</h3>
          
          {photos.length === 0 ? (
            <div className="text-center py-4">
              <Button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => handleFileSelect(e as any, 0);
                  input.click();
                }}
                className="gap-2 rounded-xl"
                size="sm"
              >
                <Icon name="Plus" size={18} />
                Добавить фото
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={photo.id} className="relative aspect-square group">
                  <img
                    src={photo.photo_url}
                    alt={`Фото ${index + 1}`}
                    className="w-full h-full object-cover rounded-2xl cursor-pointer"
                    onClick={() => !editMode && setFullscreenPhoto(index)}
                  />
                  {editMode && (
                    <>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 rounded-2xl flex items-center justify-center">
                        <Button
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full w-12 h-12 bg-white text-primary hover:bg-white/90"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => handleFileSelect(e as any, photo.position);
                            input.click();
                          }}
                        >
                          <Icon name="Camera" size={24} />
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full w-8 h-8"
                        onClick={() => handleDeletePhoto(photo.id)}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </>
                  )}
                </div>
              ))}
              
              {photos.length < 9 && (
                <div className="relative aspect-square">
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => handleFileSelect(e as any, photos.length);
                      input.click();
                    }}
                    className="w-full h-full border-2 border-dashed border-muted-foreground/30 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                  >
                    <Icon name="Plus" size={32} />
                    <span className="text-xs">Добавить фото</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {fullscreenPhoto !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreenPhoto(null)}
        >
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-12 h-12"
            onClick={() => setFullscreenPhoto(null)}
          >
            <Icon name="X" size={24} />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 disabled:opacity-30"
            disabled={fullscreenPhoto === 0 || !photos.find(p => p.position < fullscreenPhoto)}
            onClick={(e) => {
              e.stopPropagation();
              const prevPhoto = photos
                .filter(p => p.position < fullscreenPhoto)
                .sort((a, b) => b.position - a.position)[0];
              if (prevPhoto) setFullscreenPhoto(prevPhoto.position);
            }}
          >
            <Icon name="ChevronLeft" size={32} />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 disabled:opacity-30"
            disabled={fullscreenPhoto === 8 || !photos.find(p => p.position > fullscreenPhoto)}
            onClick={(e) => {
              e.stopPropagation();
              const nextPhoto = photos
                .filter(p => p.position > fullscreenPhoto)
                .sort((a, b) => a.position - b.position)[0];
              if (nextPhoto) setFullscreenPhoto(nextPhoto.position);
            }}
          >
            <Icon name="ChevronRight" size={32} />
          </Button>

          <div className="max-w-7xl max-h-[90vh] w-full px-16">
            <img
              src={photos.find(p => p.position === fullscreenPhoto)?.photo_url}
              alt={`Фото ${fullscreenPhoto + 1}`}
              className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {photos.findIndex(p => p.position === fullscreenPhoto) + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;