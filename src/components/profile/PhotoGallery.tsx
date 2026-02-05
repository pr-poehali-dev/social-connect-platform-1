import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ImageCropper from './ImageCropper';
import PrivateAlbumAccessDialog from './PrivateAlbumAccessDialog';

interface Photo {
  id: number;
  photo_url: string;
  position: number;
  created_at: string;
  likes_count?: number;
  is_liked?: boolean;
  is_private?: boolean;
}

interface PhotoGalleryProps {
  photos: Photo[];
  editMode: boolean;
  onPhotosUpdate: () => void;
  canLike?: boolean;
}

const GALLERY_URL = 'https://functions.poehali.dev/e762cdb2-751d-45d3-8ac1-62e736480782';

const PhotoGallery = ({ photos, editMode, onPhotosUpdate, canLike = false }: PhotoGalleryProps) => {
  const { toast } = useToast();
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos);

  useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [uploadingPosition, setUploadingPosition] = useState<number | null>(null);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<number | null>(null);
  const [showPrivateTab, setShowPrivateTab] = useState(false);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
            position: uploadingPosition,
            is_private: showPrivateTab
          })
        });

        if (response.ok) {
          toast({
            title: 'Фото добавлено',
            description: `Фотография добавлена в ${showPrivateTab ? 'закрытый' : 'открытый'} альбом`,
          });
          onPhotosUpdate();
        } else {
          const errorData = await response.json();
          toast({
            title: 'Ошибка загрузки',
            description: errorData.error || 'Не удалось загрузить фото',
            variant: 'destructive',
          });
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

  const handleLike = async (photo: Photo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const action = photo.is_liked ? 'unlike' : 'like';
    
    try {
      const response = await fetch(`${GALLERY_URL}?action=${action}`, {
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
        onPhotosUpdate();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || fullscreenPhoto === null) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      const nextPhoto = photos
        .filter(p => p.position > fullscreenPhoto)
        .sort((a, b) => a.position - b.position)[0];
      if (nextPhoto) setFullscreenPhoto(nextPhoto.position);
    }

    if (isRightSwipe) {
      const prevPhoto = photos
        .filter(p => p.position < fullscreenPhoto)
        .sort((a, b) => b.position - a.position)[0];
      if (prevPhoto) setFullscreenPhoto(prevPhoto.position);
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button
                variant={!showPrivateTab ? 'default' : 'outline'}
                onClick={() => setShowPrivateTab(false)}
                className="rounded-xl"
              >
                <Icon name="Image" size={16} className="mr-2" />
                Открытый
              </Button>
              <Button
                variant={showPrivateTab ? 'default' : 'outline'}
                onClick={() => setShowPrivateTab(true)}
                className="rounded-xl"
              >
                <Icon name="Lock" size={16} className="mr-2" />
                Закрытый альбом
              </Button>
              {editMode && (
                <Button
                  variant="outline"
                  onClick={() => setShowAccessDialog(true)}
                  className="rounded-xl"
                  title="Управление доступом"
                >
                  <Icon name="Users" size={16} />
                </Button>
              )}
            </div>
            {photos.length === 0 && (
              <Button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => handleFileSelect(e as any, 0);
                  input.click();
                }}
                className="gap-2 rounded-xl lg:px-4"
                size="icon"
              >
                <Icon name="Plus" size={28} className="lg:hidden" />
                <span className="hidden lg:flex lg:items-center lg:gap-2">
                  <Icon name="Plus" size={18} />
                  Добавить фото
                </span>
              </Button>
            )}
          </div>
          
          {photos.length === 0 ? (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Добавьте свои фотографии</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {localPhotos.filter(p => showPrivateTab ? p.is_private : !p.is_private).map((photo, index) => (
                <div key={photo.id} className="relative aspect-square group">
                  <img
                    src={photo.photo_url}
                    alt={`Фото ${index + 1}`}
                    className="w-full h-full object-cover rounded-2xl cursor-pointer"
                    onClick={() => !editMode && setFullscreenPhoto(index)}
                  />
                  {canLike && !editMode && (
                    <>
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
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => handleFileSelect(e as any, photo.position);
                            input.click();
                          }}
                        >
                          <Icon name="Camera" size={20} />
                        </Button>
                        <Button
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full w-10 h-10 bg-white text-blue-500 hover:bg-blue-500 hover:text-white"
                          onClick={async () => {
                            const token = localStorage.getItem('access_token');
                            const response = await fetch(`${GALLERY_URL}?action=toggle-privacy`, {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.dumps({ photo_id: photo.id })
                            });
                            if (response.ok) {
                              const data = await response.json();
                              toast({ 
                                title: data.is_private ? 'Фото скрыто' : 'Фото открыто',
                                description: data.is_private ? 'Фото перемещено в закрытый альбом' : 'Фото перемещено в открытый альбом'
                              });
                              onPhotosUpdate();
                            }
                          }}
                        >
                          <Icon name={photo.is_private ? "Unlock" : "Lock"} size={18} />
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
                      {photo.is_private && (
                        <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <Icon name="Lock" size={12} />
                          Закрыто
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              
              {editMode && (() => {
                const currentAlbumPhotos = localPhotos.filter(p => showPrivateTab ? p.is_private : !p.is_private);
                const maxPhotos = showPrivateTab ? 30 : 9;
                return currentAlbumPhotos.length < maxPhotos && (
                  <div className="relative aspect-square">
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => handleFileSelect(e as any, currentAlbumPhotos.length);
                        input.click();
                      }}
                      className="w-full h-full border-2 border-dashed border-muted-foreground/30 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Icon name="Plus" size={32} />
                      <span className="text-xs">Добавить фото</span>
                      <span className="text-xs opacity-70">{currentAlbumPhotos.length}/{maxPhotos}</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      <PrivateAlbumAccessDialog 
        open={showAccessDialog} 
        onOpenChange={setShowAccessDialog} 
      />

      {fullscreenPhoto !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreenPhoto(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-12 h-12 z-10"
            onClick={() => setFullscreenPhoto(null)}
          >
            <Icon name="X" size={24} />
          </Button>

          {editMode && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-4 right-20 rounded-full w-12 h-12 z-10"
              onClick={async (e) => {
                e.stopPropagation();
                const currentPhoto = photos.find(p => p.position === fullscreenPhoto);
                if (currentPhoto) {
                  await handleDeletePhoto(currentPhoto.id);
                  setFullscreenPhoto(null);
                }
              }}
            >
              <Icon name="Trash2" size={20} />
            </Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 disabled:opacity-30"
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
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 disabled:opacity-30"
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

          <div className="flex items-center justify-center px-4 md:px-16">
            <div className="aspect-square max-w-[90vh] max-h-[90vh] w-full">
              <img
                src={photos.find(p => p.position === fullscreenPhoto)?.photo_url}
                alt={`Фото ${fullscreenPhoto + 1}`}
                className="w-full h-full object-cover rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
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