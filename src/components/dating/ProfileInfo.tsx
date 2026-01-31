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
          {profile.status_text && (
            <div className="flex items-center gap-3 text-muted-foreground italic">
              <Icon name="MessageSquare" size={18} />
              <span>{profile.status_text}</span>
            </div>
          )}
          
          {profile.city && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="MapPin" size={18} />
              <span>{profile.city}{profile.district ? `, ${profile.district}` : ''}</span>
            </div>
          )}

          {profile.distance !== undefined && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="Navigation" size={18} />
              <span>{profile.distance < 1 ? `${Math.round(profile.distance * 1000)} м` : `${profile.distance} км`} от вас</span>
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

          {profile.bodyType && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="User" size={18} />
              <span>Телосложение: {{
                'slim': 'Стройное',
                'athletic': 'Спортивное',
                'average': 'Среднее',
                'muscular': 'Мускулистое',
                'curvy': 'Пышное',
                'overweight': 'Полное'
              }[profile.bodyType] || profile.bodyType}</span>
            </div>
          )}

          {profile.marital_status && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="Heart" size={18} />
              <span>Семейное положение: {(() => {
                const isMale = profile.gender === 'male';
                const translations: Record<string, { male: string; female: string }> = {
                  'married': { male: 'Женат', female: 'Замужем' },
                  'not_married': { male: 'Не женат', female: 'Не замужем' },
                  'single': { male: 'Холост', female: 'Холостая' },
                  'in_relationship': { male: 'Есть подруга', female: 'Есть парень' },
                  'divorced': { male: 'В разводе', female: 'В разводе' },
                  'searching': { male: 'В активном поиске', female: 'В активном поиске' },
                  'complicated': { male: 'Всё сложно', female: 'Всё сложно' },
                  'widowed': { male: 'Вдовец', female: 'Вдова' }
                };
                return translations[profile.marital_status]?.[isMale ? 'male' : 'female'] || profile.marital_status;
              })()}</span>
            </div>
          )}

          {profile.children && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="Baby" size={18} />
              <span>Дети: {{
                'no': 'Нет',
                'yes': 'Есть',
                'want': 'Хочу в будущем',
                'not_want': 'Не хочу'
              }[profile.children] || profile.children}</span>
            </div>
          )}

          {profile.profession && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="Briefcase" size={18} />
              <span>Профессия: {profile.profession}</span>
            </div>
          )}

          {profile.financial_status && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="Wallet" size={18} />
              <span>Финансовое положение: {{
                'low': 'Низкое',
                'below_average': 'Ниже среднего',
                'average': 'Среднее',
                'above_average': 'Выше среднего',
                'high': 'Высокое'
              }[profile.financial_status] || profile.financial_status}</span>
            </div>
          )}

          {profile.has_car !== null && profile.has_car !== undefined && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="Car" size={18} />
              <span>Автомобиль: {profile.has_car ? 'Есть' : 'Нет'}</span>
            </div>
          )}

          {profile.has_housing !== null && profile.has_housing !== undefined && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="Home" size={18} />
              <span>Жилье: {profile.has_housing ? 'Есть' : 'Нет'}</span>
            </div>
          )}

          {profile.dating_goal && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon name="Target" size={18} />
              <span>Цель знакомства: {{
                'friendship': 'Дружба',
                'dating': 'Свидания',
                'serious_relationship': 'Серьёзные отношения',
                'marriage': 'Брак',
                'casual': 'Неформальное общение'
              }[profile.dating_goal] || profile.dating_goal}</span>
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

      {(profile.phone || profile.telegram || profile.instagram) && (
        <Card className="p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon name="Phone" size={20} />
            Контакты
          </h2>
          <div className="space-y-3">
            {profile.phone && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Icon name="Phone" size={18} />
                <a href={`tel:${profile.phone}`} className="hover:text-primary">
                  {profile.phone}
                </a>
              </div>
            )}
            {profile.telegram && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Icon name="Send" size={18} />
                <a href={`https://t.me/${profile.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  @{profile.telegram.replace('@', '')}
                </a>
              </div>
            )}
            {profile.instagram && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Icon name="Instagram" size={18} />
                <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  @{profile.instagram.replace('@', '')}
                </a>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
};

export default ProfileInfo;