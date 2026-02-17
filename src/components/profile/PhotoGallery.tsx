import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ImageCropper from './ImageCropper';
import PrivateAlbumAccessDialog from './PrivateAlbumAccessDialog';
import { Photo, Album, GALLERY_URL, getToken } from './photo-gallery/types';
import { CreateAlbumDialog, EditAlbumDialog } from './photo-gallery/PhotoAlbumDialogs';
import PhotoGrid from './photo-gallery/PhotoGrid';
import PhotoFullscreen from './photo-gallery/PhotoFullscreen';

interface PhotoGalleryProps {
  photos: Photo[];
  editMode: boolean;
  onPhotosUpdate: () => void;
  canLike?: boolean;
}

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
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [editAlbumName, setEditAlbumName] = useState('');
  const [editAlbumKey, setEditAlbumKey] = useState('');

  useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  useEffect(() => {
    loadAlbums();
  }, []);

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

          <PhotoGrid
            photos={filteredPhotos}
            editMode={editMode}
            canLike={canLike}
            activeAlbumId={activeAlbumId}
            onPhotoClick={(id) => setFullscreenPhoto(id)}
            onLike={handleLike}
            onDelete={handleDeletePhoto}
            onTriggerFileInput={triggerFileInput}
          />
        </CardContent>
      </Card>

      <PrivateAlbumAccessDialog open={showAccessDialog} onOpenChange={setShowAccessDialog} />

      <CreateAlbumDialog
        show={showCreateAlbum}
        onClose={() => setShowCreateAlbum(false)}
        name={newAlbumName}
        onNameChange={setNewAlbumName}
        type={newAlbumType}
        onTypeChange={setNewAlbumType}
        accessKey={newAlbumKey}
        onAccessKeyChange={setNewAlbumKey}
        onCreate={handleCreateAlbum}
      />

      <EditAlbumDialog
        album={editingAlbum}
        onClose={() => setEditingAlbum(null)}
        name={editAlbumName}
        onNameChange={setEditAlbumName}
        accessKey={editAlbumKey}
        onAccessKeyChange={setEditAlbumKey}
        onSave={handleUpdateAlbum}
      />

      <PhotoFullscreen
        photos={filteredPhotos}
        activePhotoId={fullscreenPhoto}
        editMode={editMode}
        onClose={() => setFullscreenPhoto(null)}
        onNavigate={(id) => setFullscreenPhoto(id)}
        onDelete={async (id) => { await handleDeletePhoto(id); setFullscreenPhoto(null); }}
      />
    </>
  );
};

export default PhotoGallery;
