import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ProfileViewModeProps {
  user: any;
}

const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const isBirthday = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
};

const ProfileViewMode = ({ user }: ProfileViewModeProps) => {
  const age = user.birth_date ? calculateAge(user.birth_date) : null;
  const showBirthdayIcon = user.birth_date && isBirthday(user.birth_date);

  return (
    <div className="space-y-4 p-6 bg-muted/50 rounded-2xl">
      <div className="grid md:grid-cols-2 gap-6">
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
        {age !== null && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Возраст</p>
            <p className="text-base flex items-center gap-2">
              {age} {age % 10 === 1 && age !== 11 ? 'год' : age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20) ? 'года' : 'лет'}
              {showBirthdayIcon && (
                <span className="inline-flex items-center gap-1 text-primary animate-pulse">
                  <Icon name="Cake" size={18} />
                  <span className="text-sm font-medium">День рождения!</span>
                </span>
              )}
            </p>
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
              {user.marital_status === 'married' && (user.gender === 'male' ? 'Женат' : user.gender === 'female' ? 'Замужем' : 'Женат/Замужем')}
              {user.marital_status === 'single' && (user.gender === 'male' ? 'Не женат' : user.gender === 'female' ? 'Не замужем' : 'Не женат/не замужем')}
              {user.marital_status === 'bachelor' && (user.gender === 'male' ? 'Холост' : user.gender === 'female' ? 'Холостая' : 'Холост/Холостая')}
              {user.marital_status === 'in_relationship' && (user.gender === 'male' ? 'Есть подруга' : user.gender === 'female' ? 'Есть парень' : 'Есть подруга/парень')}
              {user.marital_status === 'divorced' && 'В разводе'}
              {user.marital_status === 'actively_searching' && 'В активном поиске'}
              {user.marital_status === 'complicated' && 'Всё сложно'}
              {user.marital_status === 'widowed' && (user.gender === 'male' ? 'Вдовец' : user.gender === 'female' ? 'Вдова' : 'Вдовец/Вдова')}
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