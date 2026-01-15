import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ProfileEditFormProps {
  formData: any;
  setFormData: (data: any) => void;
  availableInterests: string[];
  toggleInterest: (interest: string) => void;
}

const ProfileEditForm = ({ formData, setFormData, availableInterests, toggleInterest }: ProfileEditFormProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">Nickname</Label>
          <div className="flex gap-2">
            <span className="flex items-center px-3 bg-muted rounded-xl text-muted-foreground">@</span>
            <Input
              id="nickname"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              placeholder="nickname"
              className="rounded-xl"
              maxLength={50}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Пол</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите пол" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Мужской</SelectItem>
              <SelectItem value="female">Женский</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate">Дата рождения</Label>
        <Input
          id="birthdate"
          type="date"
          value={formData.age_from}
          onChange={(e) => setFormData({ ...formData, age_from: e.target.value })}
          className="rounded-xl"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Город</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Москва"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">Район</Label>
          <Input
            id="district"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            placeholder="Центральный"
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height">Рост (см)</Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            placeholder="170"
            className="rounded-xl"
            min="140"
            max="220"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body_type">Телосложение</Label>
          <Select value={formData.body_type} onValueChange={(value) => setFormData({ ...formData, body_type: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slim">Стройное</SelectItem>
              <SelectItem value="athletic">Спортивное</SelectItem>
              <SelectItem value="average">Обычное</SelectItem>
              <SelectItem value="curvy">Полное</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marital_status">Семейное положение</Label>
          <Select value={formData.marital_status} onValueChange={(value) => setFormData({ ...formData, marital_status: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Не женат/не замужем</SelectItem>
              <SelectItem value="divorced">В разводе</SelectItem>
              <SelectItem value="widowed">Вдовец/вдова</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="children">Наличие детей</Label>
          <Select value={formData.children} onValueChange={(value) => setFormData({ ...formData, children: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">Нет</SelectItem>
              <SelectItem value="yes_living_together">Есть, живём вместе</SelectItem>
              <SelectItem value="yes_living_separately">Есть, живут отдельно</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="financial_status">Финансовое положение</Label>
          <Select value={formData.financial_status} onValueChange={(value) => setFormData({ ...formData, financial_status: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="below_average">Ниже среднего</SelectItem>
              <SelectItem value="average">Среднее</SelectItem>
              <SelectItem value="above_average">Выше среднего</SelectItem>
              <SelectItem value="high">Высокое</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="has_car">Наличие авто</Label>
          <Select value={formData.has_car} onValueChange={(value) => setFormData({ ...formData, has_car: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Есть</SelectItem>
              <SelectItem value="no">Нет</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="has_housing">Наличие жилья</Label>
          <Select value={formData.has_housing} onValueChange={(value) => setFormData({ ...formData, has_housing: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="own">Своё</SelectItem>
              <SelectItem value="rent">Аренда</SelectItem>
              <SelectItem value="living_with_parents">С родителями</SelectItem>
              <SelectItem value="no">Нет</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dating_goal">Цель знакомства</Label>
        <Select value={formData.dating_goal} onValueChange={(value) => setFormData({ ...formData, dating_goal: value })}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Выберите цель" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="friendship">Дружба</SelectItem>
            <SelectItem value="dating">Романтические отношения</SelectItem>
            <SelectItem value="marriage">Создание семьи</SelectItem>
            <SelectItem value="flirt">Флирт</SelectItem>
            <SelectItem value="communication">Общение</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profession">Профессия</Label>
        <Input
          id="profession"
          value={formData.profession}
          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
          placeholder="Ваша профессия"
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label>Интересы</Label>
        <div className="flex flex-wrap gap-2">
          {availableInterests.map((interest) => (
            <Badge
              key={interest}
              variant={formData.interests.includes(interest) ? 'default' : 'outline'}
              className="cursor-pointer rounded-xl px-4 py-2 text-sm"
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">О себе</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Расскажите о себе"
          className="rounded-xl min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.bio.length}/500
        </p>
      </div>
    </div>
  );
};

export default ProfileEditForm;