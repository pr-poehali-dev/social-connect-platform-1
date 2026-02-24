import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PROFESSIONS from '@/data/professions';

interface PersonalCharacteristicsFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

const PersonalCharacteristicsFields = ({ formData, setFormData }: PersonalCharacteristicsFieldsProps) => {
  return (
    <>
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
              {formData.gender === 'male' ? (
                <>
                  <SelectItem value="married">Женат</SelectItem>
                  <SelectItem value="not_married">Не женат</SelectItem>
                  <SelectItem value="single">Холост</SelectItem>
                  <SelectItem value="in_relationship">Есть подруга</SelectItem>
                  <SelectItem value="divorced">В разводе</SelectItem>
                  <SelectItem value="searching">В активном поиске</SelectItem>
                  <SelectItem value="complicated">Всё сложно</SelectItem>
                  <SelectItem value="widowed">Вдовец</SelectItem>
                </>
              ) : formData.gender === 'female' ? (
                <>
                  <SelectItem value="married">Замужем</SelectItem>
                  <SelectItem value="not_married">Не замужем</SelectItem>
                  <SelectItem value="single">Холостая</SelectItem>
                  <SelectItem value="in_relationship">Есть парень</SelectItem>
                  <SelectItem value="divorced">В разводе</SelectItem>
                  <SelectItem value="searching">В активном поиске</SelectItem>
                  <SelectItem value="complicated">Всё сложно</SelectItem>
                  <SelectItem value="widowed">Вдова</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="married">Женат/Замужем</SelectItem>
                  <SelectItem value="not_married">Не женат/Не замужем</SelectItem>
                  <SelectItem value="single">Холост/Холостая</SelectItem>
                  <SelectItem value="in_relationship">Есть подруга/парень</SelectItem>
                  <SelectItem value="divorced">В разводе</SelectItem>
                  <SelectItem value="searching">В активном поиске</SelectItem>
                  <SelectItem value="complicated">Всё сложно</SelectItem>
                  <SelectItem value="widowed">Вдовец/Вдова</SelectItem>
                </>
              )}
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
        <Label>Профессия</Label>
        <Select
          value={formData.profession || ''}
          onValueChange={(value) => setFormData({ ...formData, profession: value })}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Выберите профессию" />
          </SelectTrigger>
          <SelectContent>
            {PROFESSIONS.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default PersonalCharacteristicsFields;