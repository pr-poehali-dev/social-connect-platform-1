import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ProfileInfoProps {
  profile: any;
}

const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  return (
    <>
      <Card className="p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon name="Info" size={20} />
          Информация
        </h2>
        
        <div className="space-y-3">
          {profile.city && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="MapPin" size={18} />
              <span>{profile.city}{profile.district ? `, ${profile.district}` : ''}</span>
            </div>
          )}

          {profile.gender && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="Users" size={18} />
              <span>{profile.gender === 'male' ? 'Мужчина' : profile.gender === 'female' ? 'Женщина' : 'Не указан'}</span>
            </div>
          )}

          {profile.height && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="Ruler" size={18} />
              <span>Рост: {profile.height} см</span>
            </div>
          )}

          {profile.weight && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="Activity" size={18} />
              <span>Вес: {profile.weight} кг</span>
            </div>
          )}

          {profile.physique && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="User" size={18} />
              <span>Телосложение: {profile.physique}</span>
            </div>
          )}
        </div>
      </Card>

      {profile.about && (
        <Card className="p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon name="FileText" size={20} />
            О себе
          </h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {profile.about}
          </p>
        </Card>
      )}

      {profile.interests && profile.interests.length > 0 && (
        <Card className="p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon name="Heart" size={20} />
            Интересы
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest: string, index: number) => (
              <span 
                key={index}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </Card>
      )}
    </>
  );
};

export default ProfileInfo;
