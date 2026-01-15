import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Profile {
  id: number;
  name: string;
  age: number;
  city: string;
  interests: string[];
  bio: string;
  image: string;
}

interface ProfileCardProps {
  profile: Profile;
  isFavorite: boolean;
  isFriendRequestSent: boolean;
  onToggleFavorite: (id: number) => void;
  onAddFriend: (id: number) => void;
}

const ProfileCard = ({
  profile,
  isFavorite,
  isFriendRequestSent,
  onToggleFavorite,
  onAddFriend,
}: ProfileCardProps) => {
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl overflow-hidden border-2">
      <div className="relative h-64 overflow-hidden">
        <img
          src={profile.image}
          alt={profile.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 rounded-full"
          onClick={() => onToggleFavorite(profile.id)}
        >
          <Icon 
            name="Star"
            size={20} 
            className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""}
          />
        </Button>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-bold">{profile.name}, {profile.age}</h3>
          <p className="flex items-center gap-1 text-sm">
            <Icon name="MapPin" size={14} />
            {profile.city}
          </p>
        </div>
      </div>
      
      <CardContent className="p-6">
        <p className="text-muted-foreground mb-4">{profile.bio}</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {profile.interests.map((interest, index) => (
            <Badge key={index} variant="secondary" className="rounded-full">
              {interest}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <Icon name="X" size={20} />
          </Button>
          <Button size="icon" className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
            <Icon name="Heart" size={20} />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <Icon name="MessageCircle" size={20} />
          </Button>
          <Button 
            variant={isFriendRequestSent ? "secondary" : "outline"} 
            size="icon" 
            className="rounded-full"
            onClick={() => onAddFriend(profile.id)}
            disabled={isFriendRequestSent}
          >
            <Icon name={isFriendRequestSent ? "UserCheck" : "UserPlus"} size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
