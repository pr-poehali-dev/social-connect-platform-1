import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  album_id?: number;
}

interface Album {
  id: number;
  name: string;
  type: 'open' | 'private';
  access_key?: string | null;
  photos_count: number;
  created_at: string;
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
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activeAlbumId, setActiveAlbumId] = useState<number | null>(null);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumType, setNewAlbumType] = useState<'open' | 'private'>('open');
  const [newAlbumKey, setNewAlbumKey] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [uploadingPosition, setUploadingPosition] = useState<number | null>(null);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<number | null>(null);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [editAlbumName, setEditAlbumName] = useState('');
  const [editAlbumKey, setEditAlbumKey] = useState('');

  useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  useEffect(() => {
    loadAlbums();
  }, []);

  const getToken = () => localStorage.getItem('access_token');

  const loadAlbums = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${GALLERY_URL}?action=albums`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAlbums(data.albums || []);
        if (!activeAlbumId && data.albums?.length > 0) {
          setActiveAlbumId(data.albums[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load albums', e);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    if (newAlbumType === 'private' && !newAlbumKey.trim()) {
      toast({ title: 'Укажите ключ', description: 'Для закрытого альбома нужен ключ доступа', variant: 'destructive' });
      return;
    }

    const token = getToken();
    try {
      const res = await fetch(`${GALLERY_URL}?action=create-album`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAlbumName.trim(),
          type: newAlbumType,
          access_key: newAlbumType === 'private' ? newAlbumKey.trim() : null
        })
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: 'Альбом создан', description: `Альбом "${data.album.name}" добавлен` });
        setShowCreateAlbum(false);
        setNewAlbumName('');
        setNewAlbumKey('');
        setNewAlbumType('open');
        loadAlbums();
        setActiveAlbumId(data.album.id);
      } else {
        const err = await res.json();
        toast({ title: 'Ошибка', description: err.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось создать альбом', variant: 'destructive' });
    }
  };

  const handleUpdateAlbum = async () => {
    if (!editingAlbum) return;
    const token = getToken();
    try {
      const res = await fetch(`${GALLERY_URL}?action=update-album`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          album_id: editingAlbum.id,
          name: editAlbumName.trim() || undefined,
          access_key: editAlbumKey || undefined
        })
      });
      if (res.ok) {
        toast({ title: 'Альбом обновлён' });
        setEditingAlbum(null);
        loadAlbums();
      }
    } catch {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const handleDeleteAlbum = async (albumId: number) => {
    const token = getToken();
    try {
      const res = await fetch(`${GALLERY_URL}?action=delete-album`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ album_id: albumId })
      });
      if (res.ok) {
        toast({ title: 'Альбом удалён' });
        loadAlbums();
        setActiveAlbumId(null);
        onPhotosUpdate();
      }
    } catch {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, position: number) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Ошибка', description: 'Выберите файл изображения', variant: 'destructive' });
        return;
      }
      setSelectedFile(file);
      setUploadingPosition(position);
      setShowCropper(true);
    }
  };

  const triggerFileInput = (position: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleFileSelect(e as unknown as React.ChangeEvent<HTMLInputElement>, position);
    input.click();
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setSelectedFile(null);
    if (uploadingPosition === null) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const token = getToken();
        const activeAlbum = albums.find(a => a.id === activeAlbumId);
        
        const response = await fetch(`${GALLERY_URL}?action=upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            image: base64String,
            position: uploadingPosition,
            is_private: activeAlbum?.type === 'private',
            album_id: activeAlbumId
          })
        });

        if (response.ok) {
          toast({ title: 'Фото добавлено' });
          onPhotosUpdate();
          loadAlbums();
        } else {
          const err = await response.json();
          toast({ title: 'Ошибка загрузки', description: err.error || 'Не удалось загрузить фото', variant: 'destructive' });
        }
      };
      reader.readAsDataURL(croppedBlob);
    } catch {
      toast({ title: 'Ошибка загрузки', description: 'Не удалось загрузить фото', variant: 'destructive' });
    } finally {
      setUploadingPosition(null);
    }
  };

  const handleLike = async (photo: Photo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const token = getToken();
    if (!token) return;

    const action = photo.is_liked ? 'unlike' : 'like';
    try {
      const response = await fetch(`${GALLERY_URL}?action=${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_id: photo.id })
      });
      if (response.ok) {
        const data = await response.json();
        setLocalPhotos(prev => prev.map(p =>
          p.id === photo.id ? { ...p, is_liked: !p.is_liked, likes_count: data.likes_count } : p
        ));
        onPhotosUpdate();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      const token = getToken();
      const response = await fetch(`${GALLERY_URL}?photo_id=${photoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: 'Фото удалено' });
        onPhotosUpdate();
        loadAlbums();
      } else {
        throw new Error('Delete failed');
      }
    } catch {
      toast({ title: 'Ошибка удаления', description: 'Не удалось удалить фото', variant: 'destructive' });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const handleTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || fullscreenPhoto === null) return;
    const distance = touchStart - touchEnd;
    const filtered = filteredPhotos;
    const currentIdx = filtered.findIndex(p => p.id === fullscreenPhoto);
    if (distance > 50 && currentIdx < filtered.length - 1) setFullscreenPhoto(filtered[currentIdx + 1].id);
    if (distance < -50 && currentIdx > 0) setFullscreenPhoto(filtered[currentIdx - 1].id);
  };

  const activeAlbum = albums.find(a => a.id === activeAlbumId);
  const filteredPhotos = activeAlbumId
    ? localPhotos.filter(p => p.album_id === activeAlbumId)
    : localPhotos.filter(p => !p.album_id);

  return (
    <>
      {showCropper && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={() => { setShowCropper(false); setSelectedFile(null); setUploadingPosition(null); }}
        />
      )}
      <Card className="rounded-3xl border-2">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {albums.map(album => (
              <Button
                key={album.id}
                variant={activeAlbumId === album.id ? 'default' : 'outline'}
                onClick={() => setActiveAlbumId(album.id)}
                className="rounded-xl gap-1.5 text-sm"
                size="sm"
              >
                <Icon name={album.type === 'private' ? 'Lock' : 'Images'} size={14} />
                {album.name}
                <span className="opacity-60 text-xs">({album.photos_count})</span>
              </Button>
            ))}
            {editMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateAlbum(true)}
                className="rounded-xl gap-1"
              >
                <Icon name="Plus" size={14} />
                Альбом
              </Button>
            )}
            {editMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAccessDialog(true)}
                className="rounded-xl ml-auto"
                title="Управление доступом"
              >
                <Icon name="Users" size={14} />
              </Button>
            )}
          </div>

          {/* Инфо об альбоме для владельца */}
          {editMode && activeAlbum && activeAlbum.type === 'private' && (
            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Key" size={14} className="text-purple-500" />
                  <span className="text-muted-foreground">Ключ доступа:</span>
                  <span className="font-mono font-semibold">{activeAlbum.access_key}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => {
                    setEditingAlbum(activeAlbum);
                    setEditAlbumName(activeAlbum.name);
                    setEditAlbumKey(activeAlbum.access_key || '');
                  }}>
                    <Icon name="Pencil" size={12} />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => handleDeleteAlbum(activeAlbum.id)}>
                    <Icon name="Trash2" size={12} />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {editMode && activeAlbum && activeAlbum.type === 'open' && (
            <div className="mb-4 flex gap-1 justify-end">
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => {
                setEditingAlbum(activeAlbum);
                setEditAlbumName(activeAlbum.name);
                setEditAlbumKey('');
              }}>
                <Icon name="Pencil" size={12} className="mr-1" />
                <span className="text-xs">Редактировать</span>
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => handleDeleteAlbum(activeAlbum.id)}>
                <Icon name="Trash2" size={12} />
              </Button>
            </div>
          )}

          {/* Сетка фото */}
          {filteredPhotos.length === 0 && !editMode ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">Нет фотографий</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredPhotos.map((photo, index) => (
                <div key={photo.id} className="relative aspect-square group">
                  <img
                    src={photo.photo_url}
                    alt={`Фото ${index + 1}`}
                    className="w-full h-full object-cover rounded-2xl cursor-pointer"
                    onClick={() => !editMode && setFullscreenPhoto(photo.id)}
                  />
                  {canLike && !editMode && (
                    <>
                      <button
                        onClick={(e) => handleLike(photo, e)}
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
                          onClick={() => triggerFileInput(photo.position)}
                        >
                          <Icon name="Camera" size={20} />
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

              {editMode && activeAlbumId && (
                <div className="relative aspect-square">
                  <button
                    onClick={() => triggerFileInput(filteredPhotos.length)}
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

      <PrivateAlbumAccessDialog open={showAccessDialog} onOpenChange={setShowAccessDialog} />

      {/* Создание альбома */}
      {showCreateAlbum && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowCreateAlbum(false)}>
          <div className="bg-background rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Новый альбом</h3>
            <Input
              placeholder="Название альбома"
              value={newAlbumName}
              onChange={e => setNewAlbumName(e.target.value)}
              className="rounded-xl"
            />
            <div className="flex gap-2">
              <Button
                variant={newAlbumType === 'open' ? 'default' : 'outline'}
                onClick={() => setNewAlbumType('open')}
                className="flex-1 rounded-xl gap-1"
                size="sm"
              >
                <Icon name="Globe" size={14} />
                Открытый
              </Button>
              <Button
                variant={newAlbumType === 'private' ? 'default' : 'outline'}
                onClick={() => setNewAlbumType('private')}
                className="flex-1 rounded-xl gap-1"
                size="sm"
              >
                <Icon name="Lock" size={14} />
                Закрытый
              </Button>
            </div>
            {newAlbumType === 'private' && (
              <Input
                placeholder="Ключ доступа (код разблокировки)"
                value={newAlbumKey}
                onChange={e => setNewAlbumKey(e.target.value)}
                className="rounded-xl font-mono"
              />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCreateAlbum(false)} className="flex-1 rounded-xl">Отмена</Button>
              <Button onClick={handleCreateAlbum} className="flex-1 rounded-xl">Создать</Button>
            </div>
          </div>
        </div>
      )}

      {/* Редактирование альбома */}
      {editingAlbum && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditingAlbum(null)}>
          <div className="bg-background rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Редактировать альбом</h3>
            <Input
              placeholder="Название"
              value={editAlbumName}
              onChange={e => setEditAlbumName(e.target.value)}
              className="rounded-xl"
            />
            {editingAlbum.type === 'private' && (
              <Input
                placeholder="Новый ключ доступа"
                value={editAlbumKey}
                onChange={e => setEditAlbumKey(e.target.value)}
                className="rounded-xl font-mono"
              />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingAlbum(null)} className="flex-1 rounded-xl">Отмена</Button>
              <Button onClick={handleUpdateAlbum} className="flex-1 rounded-xl">Сохранить</Button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen */}
      {fullscreenPhoto !== null && (() => {
        const currentPhoto = filteredPhotos.find(p => p.id === fullscreenPhoto);
        const currentIdx = filteredPhotos.findIndex(p => p.id === fullscreenPhoto);
        if (!currentPhoto) return null;
        return (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setFullscreenPhoto(null)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-12 h-12 z-10" onClick={() => setFullscreenPhoto(null)}>
              <Icon name="X" size={24} />
            </Button>
            {editMode && (
              <Button size="icon" variant="destructive" className="absolute top-4 right-20 rounded-full w-12 h-12 z-10" onClick={async (e) => {
                e.stopPropagation();
                await handleDeletePhoto(currentPhoto.id);
                setFullscreenPhoto(null);
              }}>
                <Icon name="Trash2" size={20} />
              </Button>
            )}
            <Button size="icon" variant="ghost"
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 disabled:opacity-30"
              disabled={currentIdx <= 0}
              onClick={(e) => { e.stopPropagation(); if (currentIdx > 0) setFullscreenPhoto(filteredPhotos[currentIdx - 1].id); }}
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
              disabled={currentIdx >= filteredPhotos.length - 1}
              onClick={(e) => { e.stopPropagation(); if (currentIdx < filteredPhotos.length - 1) setFullscreenPhoto(filteredPhotos[currentIdx + 1].id); }}
            >
              <Icon name="ChevronRight" size={28} />
            </Button>
            <div className="absolute bottom-4 text-white/60 text-sm">
              {currentIdx + 1} / {filteredPhotos.length}
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default PhotoGallery;
