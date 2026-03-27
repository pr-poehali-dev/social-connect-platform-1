import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import PhotoGallery from '@/components/profile/PhotoGallery';
import { Photo, GALLERY_URL, getToken } from '@/components/profile/photo-gallery/types';

const MyPhotos = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${GALLERY_URL}?action=list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate(-1)}>
            <Icon name="ArrowLeft" size={18} />
            Назад
          </Button>
          <h1 className="text-2xl font-bold mb-6">Мои фото</h1>
          <PhotoGallery
            photos={photos}
            editMode={true}
            onPhotosUpdate={loadPhotos}
          />
        </div>
      </main>
    </div>
  );
};

export default MyPhotos;
