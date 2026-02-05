import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ImageCropper from './ImageCropper';
import BanOverlay from './BanOverlay';

interface ProfileAvatarProps {
  user: any;
  editMode: boolean;
  onAvatarUpdate: (avatarUrl: string) => void;
}

const ProfileAvatar = ({ user, editMode, onAvatarUpdate }: ProfileAvatarProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleUploadAvatar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          toast({ title: 'Ошибка', description: 'Выберите файл изображения', variant: 'destructive' });
          return;
        }
        setSelectedFile(file);
        setShowCropper(true);
      }
    };
    input.click();
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setSelectedFile(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const token = localStorage.getItem('access_token');
        const response = await fetch('https://functions.poehali.dev/99ffce65-6223-4c0e-93d7-d7d44514ef4b', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: base64String })
        });
        if (response.ok) {
          const data = await response.json();
          onAvatarUpdate(data.url);
          toast({ title: 'Фото обновлено', description: 'Фото профиля успешно загружено' });
        } else {
          toast({ title: 'Ошибка', description: 'Не удалось загрузить фото', variant: 'destructive' });
        }
      };
      reader.readAsDataURL(croppedBlob);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить фото', variant: 'destructive' });
    }
  };

  const handleDeleteAvatar = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar_url: '' })
      });
      if (response.ok) {
        onAvatarUpdate('');
        toast({ title: 'Фото удалено', description: 'Фото профиля успешно удалено' });
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось удалить фото', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить фото', variant: 'destructive' });
    }
  };

  return (
    <>
      {showCropper && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setSelectedFile(null);
          }}
        />
      )}
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200 group">
      {user.avatar_url ? (
        <img 
          src={user.avatar_url} 
          alt={user.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
          <Icon name="User" size={80} className="text-muted-foreground mb-4" />
          {!editMode && (
            <div className="bg-transparent rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-800">
                Без фото профиль не участвует в выдаче Знакомств
              </p>
            </div>
          )}
        </div>
      )}
      
      {user.is_banned && user.ban_info && (
        <BanOverlay 
          reason={user.ban_info.reason}
          bannedUntil={user.ban_info.banned_until}
          banCount={user.ban_info.ban_count}
        />
      )}
      {editMode && (
        <>
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
            <Button
              size="lg"
              className="opacity-80 group-hover:opacity-100 transition-opacity duration-200 rounded-xl gap-2 bg-white text-primary hover:bg-white/90"
              onClick={handleUploadAvatar}
            >
              <Icon name="Camera" size={24} />
              Загрузить фото
            </Button>
          </div>
          {user.avatar_url && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200 rounded-full w-10 h-10"
              onClick={handleDeleteAvatar}
            >
              <Icon name="X" size={20} />
            </Button>
          )}
        </>
      )}
    </div>
    </>
  );
};

export default ProfileAvatar;