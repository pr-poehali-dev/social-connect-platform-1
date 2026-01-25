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
          <div className="grid grid-cols-3 gap-4">
            {slots.map(({ position, photo }) => (
              <div key={position} className="relative aspect-square group">
                {photo ? (
                  <>
                    <img
                      src={photo.photo_url}
                      alt={`Фото ${position + 1}`}
                      className="w-full h-full object-cover rounded-2xl"
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
                              input.onchange = (e) => handleFileSelect(e as any, position);
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
                  </>
                ) : (
                  editMode && (
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => handleFileSelect(e as any, position);
                        input.click();
                      }}
                      className="w-full h-full border-2 border-dashed border-muted-foreground/30 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Icon name="Plus" size={32} />
                      <span className="text-xs">Добавить фото</span>
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
          {!editMode && photos.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Фотографий пока нет</p>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default PhotoGallery;
