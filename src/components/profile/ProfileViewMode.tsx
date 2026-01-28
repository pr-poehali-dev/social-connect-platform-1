import { Badge } from '@/components/ui/badge';

interface ProfileViewModeProps {
  user: any;
}

const ProfileViewMode = ({ user }: ProfileViewModeProps) => {
  return (
    <div className="space-y-4 p-6 bg-muted/50 rounded-2xl">
      <div className="grid md:grid-cols-2 gap-6">
        {user.first_name && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Имя</p>
            <p className="text-base">{user.first_name}</p>
          </div>
        )}
        {user.last_name && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Фамилия</p>
            <p className="text-base">{user.last_name}</p>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Nickname</p>
          <p className="text-base">@{user.nickname}</p>
        </div>
        {user.gender && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Пол</p>
            <p className="text-base">{user.gender === 'male' ? 'Мужской' : 'Женский'}</p>
          </div>
        )}
        {(user.age_from || user.age_to) && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Возраст партнёра</p>
            <p className="text-base">{user.age_from} - {user.age_to} лет</p>
          </div>
        )}
        {user.zodiac_sign && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Знак зодиака</p>
            <p className="text-base">
              {user.zodiac_sign === 'aries' && '♈ Овен'}
              {user.zodiac_sign === 'taurus' && '♉ Телец'}
              {user.zodiac_sign === 'gemini' && '♊ Близнецы'}
              {user.zodiac_sign === 'cancer' && '♋ Рак'}
              {user.zodiac_sign === 'leo' && '♌ Лев'}
              {user.zodiac_sign === 'virgo' && '♍ Дева'}
              {user.zodiac_sign === 'libra' && '♎ Весы'}
              {user.zodiac_sign === 'scorpio' && '♏ Скорпион'}
              {user.zodiac_sign === 'sagittarius' && '♐ Стрелец'}
              {user.zodiac_sign === 'capricorn' && '♑ Козерог'}
              {user.zodiac_sign === 'aquarius' && '♒ Водолей'}
              {user.zodiac_sign === 'pisces' && '♓ Рыбы'}
            </p>
          </div>
        )}
        {user.city && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Город</p>
            <p className="text-base">{user.city}{user.district && `, ${user.district}`}</p>
          </div>
        )}
        {user.height && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Рост</p>
            <p className="text-base">{user.height} см</p>
          </div>
        )}
        {user.body_type && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Телосложение</p>
            <p className="text-base">
              {user.body_type === 'slim' && 'Стройное'}
              {user.body_type === 'athletic' && 'Спортивное'}
              {user.body_type === 'average' && 'Обычное'}
              {user.body_type === 'curvy' && 'Полное'}
            </p>
          </div>
        )}
        {user.marital_status && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Семейное положение</p>
            <p className="text-base">
              {user.marital_status === 'single' && 'Не женат/не замужем'}
              {user.marital_status === 'divorced' && 'В разводе'}
              {user.marital_status === 'widowed' && 'Вдовец/вдова'}
            </p>
          </div>
        )}
        {user.children && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Дети</p>
            <p className="text-base">
              {user.children === 'no' && 'Нет'}
              {user.children === 'yes_living_together' && 'Есть, живём вместе'}
              {user.children === 'yes_living_separately' && 'Есть, живут отдельно'}
            </p>
          </div>
        )}
        {user.financial_status && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Финансовое положение</p>
            <p className="text-base">
              {user.financial_status === 'below_average' && 'Ниже среднего'}
              {user.financial_status === 'average' && 'Среднее'}
              {user.financial_status === 'above_average' && 'Выше среднего'}
              {user.financial_status === 'high' && 'Высокое'}
            </p>
          </div>
        )}
        {user.has_car && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Авто</p>
            <p className="text-base">{user.has_car === 'yes' ? 'Есть' : 'Нет'}</p>
          </div>
        )}
        {user.has_housing && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Жильё</p>
            <p className="text-base">
              {user.has_housing === 'own' && 'Своё'}
              {user.has_housing === 'rent' && 'Аренда'}
              {user.has_housing === 'living_with_parents' && 'С родителями'}
              {user.has_housing === 'no' && 'Нет'}
            </p>
          </div>
        )}
        {user.dating_goal && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Цель знакомства</p>
            <p className="text-base">
              {user.dating_goal === 'friendship' && 'Дружба'}
              {user.dating_goal === 'dating' && 'Романтические отношения'}
              {user.dating_goal === 'marriage' && 'Создание семьи'}
              {user.dating_goal === 'flirt' && 'Флирт'}
              {user.dating_goal === 'communication' && 'Общение'}
            </p>
          </div>
        )}
        {user.profession && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Профессия</p>
            <p className="text-base">{user.profession}</p>
          </div>
        )}
      </div>
      {user.interests && user.interests.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Интересы</p>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest: string) => (
              <Badge key={interest} variant="secondary" className="rounded-xl px-3 py-1">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">О себе</p>
        <p className="text-base">{user.bio}</p>
      </div>
    </div>
  );
};

export default ProfileViewMode;