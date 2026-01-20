import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/1a9ecaa4-2882-4498-965a-c16eb32920ec';

interface Filter {
  id: number;
  section: string;
  key: string;
  label: string;
  type: string;
  options: any;
  active: boolean;
  sort_order: number;
}

const AdminFilters = () => {
  const [searchParams] = useSearchParams();
  const [section, setSection] = useState(searchParams.get('section') || 'dating');
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);
  const [filterKey, setFilterKey] = useState('');
  const [filterLabel, setFilterLabel] = useState('');
  const [filterType, setFilterType] = useState('select');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadFilters(token);
  }, [section, navigate]);

  const loadFilters = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${ADMIN_API}?action=get_filters&section=${section}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFilters(data.filters);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить фильтры', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createFilter = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=create_filter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_filter',
          section,
          filter_key: filterKey,
          filter_label: filterLabel,
          filter_type: filterType
        })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Фильтр создан' });
        setShowDialog(false);
        resetForm();
        loadFilters(token);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать фильтр', variant: 'destructive' });
    }
  };

  const updateFilter = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token || !editingFilter) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=update_filter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_filter',
          filter_id: editingFilter.id,
          filter_label: filterLabel,
          filter_type: filterType,
          is_active: editingFilter.active
        })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: 'Фильтр обновлён' });
        setShowDialog(false);
        resetForm();
        loadFilters(token);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить фильтр', variant: 'destructive' });
    }
  };

  const toggleFilter = async (filter: Filter) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=update_filter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_filter',
          filter_id: filter.id,
          filter_label: filter.label,
          filter_type: filter.type,
          is_active: !filter.active
        })
      });

      if (response.ok) {
        loadFilters(token);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить фильтр', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFilterKey('');
    setFilterLabel('');
    setFilterType('select');
    setEditingFilter(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  const openEditDialog = (filter: Filter) => {
    setEditingFilter(filter);
    setFilterKey(filter.key);
    setFilterLabel(filter.label);
    setFilterType(filter.type);
    setShowDialog(true);
  };

  const getSectionName = (key: string) => {
    switch (key) {
      case 'dating': return 'Знакомства';
      case 'ads': return 'Объявления';
      case 'services': return 'Услуги';
      case 'events': return 'Мероприятия';
      default: return key;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/admin/sections" className="flex items-center gap-3">
              <Icon name="ArrowLeft" size={24} className="text-white" />
              <h1 className="text-xl font-bold text-white">Управление фильтрами</h1>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Card className="bg-white/95 backdrop-blur mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>Раздел:</span>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dating">Знакомства</SelectItem>
                    <SelectItem value="ads">Объявления</SelectItem>
                    <SelectItem value="services">Услуги</SelectItem>
                    <SelectItem value="events">Мероприятия</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={openCreateDialog}>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать фильтр
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Загрузка...</div>
            ) : filters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Нет фильтров для раздела "{getSectionName(section)}"
              </div>
            ) : (
              <div className="space-y-3">
                {filters.map((filter) => (
                  <div key={filter.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium">{filter.label}</div>
                      <div className="text-sm text-muted-foreground">
                        Ключ: {filter.key} • Тип: {filter.type}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`filter-${filter.id}`} className="text-sm">
                          {filter.active ? 'Активен' : 'Неактивен'}
                        </Label>
                        <Switch
                          id={`filter-${filter.id}`}
                          checked={filter.active}
                          onCheckedChange={() => toggleFilter(filter)}
                        />
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(filter)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFilter ? 'Редактировать фильтр' : 'Создать фильтр'}</DialogTitle>
            <DialogDescription>
              Настройте параметры фильтра для раздела "{getSectionName(section)}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ключ фильтра</Label>
              <Input
                value={filterKey}
                onChange={(e) => setFilterKey(e.target.value)}
                placeholder="age_range"
                disabled={!!editingFilter}
              />
            </div>
            <div>
              <Label>Название фильтра</Label>
              <Input
                value={filterLabel}
                onChange={(e) => setFilterLabel(e.target.value)}
                placeholder="Возраст"
              />
            </div>
            <div>
              <Label>Тип фильтра</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Выпадающий список</SelectItem>
                  <SelectItem value="range">Диапазон</SelectItem>
                  <SelectItem value="checkbox">Чекбокс</SelectItem>
                  <SelectItem value="multiselect">Множественный выбор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Отмена
            </Button>
            <Button onClick={editingFilter ? updateFilter : createFilter}>
              {editingFilter ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFilters;
