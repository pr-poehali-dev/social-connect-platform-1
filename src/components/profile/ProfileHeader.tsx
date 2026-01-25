import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import ImageCropper from './ImageCropper';

interface ProfileHeaderProps {
  user: any;
  editMode: boolean;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onAvatarUpdate?: (avatarUrl: string) => void;
}

const ProfileHeader = ({ user, editMode, onLogout, onDeleteAccount, onAvatarUpdate }: ProfileHeaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setShowCropper(true);
    }
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
          if (onAvatarUpdate) {
            onAvatarUpdate(data.url);
          }
          toast({
            title: 'Фото обновлено',
            description: 'Ваше фото профиля успешно загружено',
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Avatar upload error:', response.status, errorData);
          toast({
            title: 'Ошибка загрузки',
            description: errorData.error || 'Не удалось загрузить фото',
            variant: 'destructive',
          });
        }
      };
      reader.readAsDataURL(croppedBlob);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить фото',
        variant: 'destructive',
      });
    }
  };

  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      toast({
        title: 'Камера открыта',
        description: 'Функция в разработке',
      });
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast({
        title: 'Ошибка доступа к камере',
        description: 'Проверьте разрешения браузера',
        variant: 'destructive',
      });
    }
    setShowPhotoMenu(false);
  };

  const handleGallery = () => {
    fileInputRef.current?.click();
    setShowPhotoMenu(false);
  };

  const handleDeleteAvatar = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar_url: '' })
      });

      if (response.ok) {
        if (onAvatarUpdate) {
          onAvatarUpdate('');
        }
        toast({
          title: 'Фото удалено',
          description: 'Фото профиля успешно удалено',
        });
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
      <CardHeader className="text-center space-y-6 pb-8">
      <div className="relative w-32 h-32 mx-auto group">
        <Avatar className="w-32 h-32 border-4 border-primary">
          {user.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt={user.name} />
          ) : (
            <AvatarFallback className="text-4xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
              {user.name.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        {editMode && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-200 rounded-full flex items-center justify-center">
              <DropdownMenu open={showPhotoMenu} onOpenChange={setShowPhotoMenu}>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    className="opacity-80 group-hover:opacity-100 transition-opacity duration-200 rounded-full w-12 h-12 bg-white text-primary hover:bg-white/90"
                  >
                    <Icon name="Camera" size={24} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleCamera} className="gap-2 cursor-pointer">
                    <Icon name="Camera" size={18} />
                    Сделать фото с камеры
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleGallery} className="gap-2 cursor-pointer">
                    <Icon name="Image" size={18} />
                    Выбрать из галереи
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {user.avatar_url && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200 rounded-full w-8 h-8"
                onClick={handleDeleteAvatar}
              >
                <Icon name="X" size={16} />
              </Button>
            )}
          </>
        )}
      </div>
      <div>
        <CardTitle className="text-3xl mb-2">{user.name}</CardTitle>
        <CardDescription className="text-base">{user.email}</CardDescription>
        <p className="text-sm text-muted-foreground mt-2">
          @{user.nickname}
        </p>
        <p className="text-sm text-muted-foreground">
          На платформе с {user.joinedDate}
        </p>
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link to={`/${user.nickname}`}>
          <Button variant="outline" className="gap-2 rounded-xl">
            <Icon name="Eye" size={18} />
            Мой профиль
          </Button>
        </Link>
        <Button onClick={onLogout} variant="outline" className="gap-2 rounded-xl">
          <Icon name="LogOut" size={18} />
          Выйти
        </Button>
        <Button 
          onClick={onDeleteAccount} 
          variant="destructive" 
          className="gap-2 rounded-xl"
        >
          <Icon name="Trash2" size={18} />
          Удалить аккаунт
        </Button>
      </div>
      </CardHeader>
    </>
  );
};

export default ProfileHeader;