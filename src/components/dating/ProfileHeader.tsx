import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
}

const ProfileHeader = ({ profile, isOwnProfile, isFavorite, onBack, onToggleFavorite }: ProfileHeaderProps) => {
  return (
    <div className="relative md:rounded-3xl overflow-hidden">
      <div className="aspect-[3/4] md:aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden">
        {profile.image ? (
          <img 
            src={profile.image} 
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="User" size={96} className="text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 md:-left-16 bg-black/30 hover:bg-black/50 text-white rounded-full"
        onClick={onBack}
      >
        <Icon name="ArrowLeft" size={24} />
      </Button>

      {!isOwnProfile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full"
          onClick={onToggleFavorite}
        >
          <Icon name={isFavorite ? "Heart" : "Heart"} size={24} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
        </Button>
      )}
    </div>
  );
};

export default ProfileHeader;