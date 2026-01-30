import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

const BasicInfoFields = ({ formData, setFormData }: BasicInfoFieldsProps) => {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Имя</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            placeholder="Ваше имя"
            className="rounded-xl"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Фамилия</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            placeholder="Ваша фамилия"
            className="rounded-xl"
            maxLength={100}
          />
        </div>
      </div>

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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birth_date">Дата рождения</Label>
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            className="rounded-xl"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zodiac_sign">Знак зодиака</Label>
          <Select value={formData.zodiac_sign} onValueChange={(value) => setFormData({ ...formData, zodiac_sign: value })}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Выберите знак" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aries">Овен</SelectItem>
              <SelectItem value="taurus">Телец</SelectItem>
              <SelectItem value="gemini">Близнецы</SelectItem>
              <SelectItem value="cancer">Рак</SelectItem>
              <SelectItem value="leo">Лев</SelectItem>
              <SelectItem value="virgo">Дева</SelectItem>
              <SelectItem value="libra">Весы</SelectItem>
              <SelectItem value="scorpio">Скорпион</SelectItem>
              <SelectItem value="sagittarius">Стрелец</SelectItem>
              <SelectItem value="capricorn">Козерог</SelectItem>
              <SelectItem value="aquarius">Водолей</SelectItem>
              <SelectItem value="pisces">Рыбы</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default BasicInfoFields;