import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DatingPreferencesFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

const DatingPreferencesFields = ({ formData, setFormData }: DatingPreferencesFieldsProps) => {
  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💝</span>
        <h3 className="text-lg font-semibold text-gray-900">Кого вы хотите найти</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="looking-for-gender">Пол</Label>
          <Select
            value={formData.lookingForGender || ''}
            onValueChange={(value) => setFormData({ ...formData, lookingForGender: value })}
          >
            <SelectTrigger id="looking-for-gender" className="rounded-xl">
              <SelectValue placeholder="Не указано" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Мужчина</SelectItem>
              <SelectItem value="female">Женщина</SelectItem>
              <SelectItem value="any">Любой</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dating-goal">Цель знакомства</Label>
          <Select
            value={formData.dating_goal || ''}
            onValueChange={(value) => setFormData({ ...formData, dating_goal: value })}
          >
            <SelectTrigger id="dating-goal" className="rounded-xl">
              <SelectValue placeholder="Не указано" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friendship">Дружба</SelectItem>
              <SelectItem value="dating">Романтические отношения</SelectItem>
              <SelectItem value="marriage">Создание семьи</SelectItem>
              <SelectItem value="communication">Общение</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="age-from">Возраст от</Label>
          <Input
            id="age-from"
            type="number"
            min="18"
            max="100"
            value={formData.age_from || ''}
            onChange={(e) => setFormData({ ...formData, age_from: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="18"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age-to">Возраст до</Label>
          <Input
            id="age-to"
            type="number"
            min="18"
            max="100"
            value={formData.age_to || ''}
            onChange={(e) => setFormData({ ...formData, age_to: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="65"
            className="rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default DatingPreferencesFields;
