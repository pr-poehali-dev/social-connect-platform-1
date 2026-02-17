import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const GALLERY_URL = 'https://functions.poehali.dev/e762cdb2-751d-45d3-8ac1-62e736480782';

interface Photo {
  id: number;
  photo_url: string;
  likes_count?: number;
  is_liked?: boolean;
  album_id?: number;
}

interface Album {
  id: number;
  name: string;
  type: 'open' | 'private';
  photos_count: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  userId: number | string;
  editable?: boolean;
  onAddPhoto?: () => void;
  canLike?: boolean;
}

const PhotoGallery = ({ photos, userId, editable = false, onAddPhoto, canLike = true }: PhotoGalleryProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activeAlbumId, setActiveAlbumId] = useState<number | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [unlockedAlbums, setUnlockedAlbums] = useState<Set<number>>(new Set());
  const [keyError, setKeyError] = useState('');

  useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  useEffect(() => {
    loadAlbums();
  }, [userId]);

  const loadAlbums = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${GALLERY_URL}?action=albums&user_id=${userId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const visibleAlbums = (data.albums || []).filter((a: Album) => a.name !== '[удалён]');
        setAlbums(visibleAlbums);
        if (visibleAlbums.length > 0 && !activeAlbumId) {
          const firstOpen = visibleAlbums.find((a: Album) => a.type === 'open');
          setActiveAlbumId(firstOpen?.id || visibleAlbums[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load albums', e);
    }
  };

  useEffect(() => {
    if (activeAlbumId) {
      loadAlbumPhotos(activeAlbumId);
    }
  }, [activeAlbumId]);

  const loadAlbumPhotos = async (albumId: number) => {
    const album = albums.find(a => a.id === albumId);
    if (album?.type === 'private' && !unlockedAlbums.has(albumId)) {
      setAlbumPhotos([]);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${GALLERY_URL}?action=list&user_id=${userId}&album_id=${albumId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.locked) {
          setAlbumPhotos([]);
        } else {
          setAlbumPhotos(data.photos || []);
        }
      }
    } catch {
      setAlbumPhotos([]);
    }
  };

  const handleVerifyKey = async () => {
    if (!activeAlbumId || !accessKey.trim()) return;
    setKeyError('');

    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${GALLERY_URL}?action=verify-key`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ album_id: activeAlbumId, key: accessKey.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access) {
          setUnlockedAlbums(prev => new Set([...prev, activeAlbumId]));
          setShowKeyInput(false);
          setAccessKey('');
          loadAlbumPhotos(activeAlbumId);
        } else {
          setKeyError('Неверный ключ');
        }
      }
    } catch {
      setKeyError('Ошибка проверки');
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_id: photo.id })
      });
      if (response.ok) {
        const data = await response.json();
        const updatePhoto = (p: Photo) => p.id === photo.id ? { ...p, is_liked: !p.is_liked, likes_count: data.likes_count } : p;
        setLocalPhotos(prev => prev.map(updatePhoto));
        setAlbumPhotos(prev => prev.map(updatePhoto));
        if (selectedPhoto?.id === photo.id) {
          setSelectedPhoto({ ...photo, is_liked: !photo.is_liked, likes_count: data.likes_count });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const activeAlbum = albums.find(a => a.id === activeAlbumId);
  const isPrivateLocked = activeAlbum?.type === 'private' && !unlockedAlbums.has(activeAlbum.id);
  const displayPhotos = activeAlbumId ? albumPhotos : localPhotos;

  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !selectedPhoto) return;
    const distance = touchStart - touchEnd;
    const currentIndex = displayPhotos.findIndex(p => p.id === selectedPhoto.id);
    if (distance > 50 && currentIndex < displayPhotos.length - 1) setSelectedPhoto(displayPhotos[currentIndex + 1]);
    if (distance < -50 && currentIndex > 0) setSelectedPhoto(displayPhotos[currentIndex - 1]);
  };

  return (
    <>
      <Card className="p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="Images" size={20} />
          Фотографии
        </h2>

        {albums.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {albums.map(album => (
              <Button
                key={album.id}
                variant={activeAlbumId === album.id ? 'default' : 'outline'}
                size="sm"
                className="rounded-xl gap-1.5 text-sm"
                onClick={() => {
                  setActiveAlbumId(album.id);
                  if (album.type === 'private' && !unlockedAlbums.has(album.id)) {
                    setShowKeyInput(true);
                  }
                }}
              >
                <Icon name={album.type === 'private' ? 'Lock' : 'Images'} size={14} />
                {album.name}
                <span className="opacity-60 text-xs">({album.photos_count})</span>
              </Button>
            ))}
          </div>
        )}

        {isPrivateLocked ? (
          <div className="text-center py-8 space-y-4">
            <Icon name="Lock" size={48} className="mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">Закрытый альбом</p>
            {showKeyInput ? (
              <div className="max-w-xs mx-auto space-y-2">
                <Input
                  placeholder="Введите ключ доступа"
                  value={accessKey}
                  onChange={e => { setAccessKey(e.target.value); setKeyError(''); }}
                  className="rounded-xl font-mono text-center"
                  onKeyDown={e => e.key === 'Enter' && handleVerifyKey()}
                />
                {keyError && <p className="text-sm text-destructive">{keyError}</p>}
                <Button onClick={handleVerifyKey} className="w-full rounded-xl">Разблокировать</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowKeyInput(true)} className="rounded-xl gap-2">
                <Icon name="Key" size={14} />
                Ввести ключ
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {displayPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img src={photo.photo_url} alt={`Фото ${index + 1}`} className="w-full h-full object-cover" />
                {canLike && (
                  <button
                    onClick={(e) => handleLike(photo, e)}
                    className="absolute bottom-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="Heart" size={16} className={photo.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-700'} />
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
            {displayPhotos.length === 0 && (
              <div className="col-span-3 text-center py-6 text-sm text-muted-foreground">Нет фотографий</div>
            )}
          </div>
        )}
      </Card>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full z-10" onClick={() => setSelectedPhoto(null)}>
            <Icon name="X" size={24} />
          </Button>
          {canLike && (
            <Button variant="ghost" className="absolute top-4 left-4 text-white hover:bg-white/20 rounded-full z-10 gap-2" onClick={(e) => { e.stopPropagation(); handleLike(selectedPhoto); }}>
              <Icon name="Heart" size={24} className={selectedPhoto.is_liked ? 'fill-red-500 text-red-500' : ''} />
              {(selectedPhoto.likes_count ?? 0) > 0 && <span>{selectedPhoto.likes_count}</span>}
            </Button>
          )}
          {displayPhotos.findIndex(p => p.id === selectedPhoto.id) > 0 && (
            <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full z-10 hidden md:flex"
              onClick={(e) => { e.stopPropagation(); const i = displayPhotos.findIndex(p => p.id === selectedPhoto.id); if (i > 0) setSelectedPhoto(displayPhotos[i - 1]); }}>
              <Icon name="ChevronLeft" size={32} />
            </Button>
          )}
          {displayPhotos.findIndex(p => p.id === selectedPhoto.id) < displayPhotos.length - 1 && (
            <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full z-10 hidden md:flex"
              onClick={(e) => { e.stopPropagation(); const i = displayPhotos.findIndex(p => p.id === selectedPhoto.id); if (i < displayPhotos.length - 1) setSelectedPhoto(displayPhotos[i + 1]); }}>
              <Icon name="ChevronRight" size={32} />
            </Button>
          )}
          <div className="relative max-w-4xl w-full max-h-[90vh]" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <img src={selectedPhoto.photo_url} alt="Полное фото" className="w-full h-full object-contain rounded-2xl select-none" onClick={(e) => e.stopPropagation()} draggable={false} />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-3 py-2 rounded-full">
              {displayPhotos.map((p) => (
                <button key={p.id} className={`w-2 h-2 rounded-full transition-colors ${p.id === selectedPhoto.id ? 'bg-white' : 'bg-white/30'}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedPhoto(p); }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;
