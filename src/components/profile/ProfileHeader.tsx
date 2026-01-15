import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface ProfileHeaderProps {
  user: any;
  editMode: boolean;
  onLogout: () => void;
}

const ProfileHeader = ({ user, editMode, onLogout }: ProfileHeaderProps) => {
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
          <Button
            size="icon"
            className="absolute bottom-0 right-0 rounded-full w-10 h-10"
          >
            <Icon name="Camera" size={20} />
          </Button>
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
      <div className="flex gap-3 justify-center">
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
      </div>
    </CardHeader>
  );
};

export default ProfileHeader;
