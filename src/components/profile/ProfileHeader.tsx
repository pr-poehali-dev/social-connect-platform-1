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

interface ProfileHeaderProps {
  user: any;
  editMode: boolean;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const ProfileHeader = ({ user, editMode, onLogout, onDeleteAccount }: ProfileHeaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: 'Фото загружено',
        description: 'Ваше фото профиля обновлено',
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

  return (
    <CardHeader className="text-center space-y-6 pb-8">
      <div className="relative w-32 h-32 mx-auto">
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
            <DropdownMenu open={showPhotoMenu} onOpenChange={setShowPhotoMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full w-10 h-10"
                >
                  <Icon name="Camera" size={20} />
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
  );
};

export default ProfileHeader;