import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  filterVip: string;
  setFilterVip: (value: string) => void;
  filterBlocked: string;
  setFilterBlocked: (value: string) => void;
}

const UserFilters = ({
  search,
  setSearch,
  filterVip,
  setFilterVip,
  filterBlocked,
  setFilterBlocked
}: UserFiltersProps) => {
  return (
    <div className="flex gap-4 mt-4">
      <Input
        placeholder="Поиск по email, имени..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <Select value={filterVip} onValueChange={setFilterVip}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все</SelectItem>
          <SelectItem value="true">Только VIP</SelectItem>
          <SelectItem value="false">Не VIP</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterBlocked} onValueChange={setFilterBlocked}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все</SelectItem>
          <SelectItem value="true">Заблокированные</SelectItem>
          <SelectItem value="false">Активные</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserFilters;
