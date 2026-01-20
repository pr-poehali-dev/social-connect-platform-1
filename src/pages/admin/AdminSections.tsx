import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/1a9ecaa4-2882-4498-965a-c16eb32920ec';

interface Section {
  id: number;
  key: string;
  name: string;
  enabled: boolean;
  settings: any;
  updated_at: string;
}

const AdminSections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadSections(token);
  }, [navigate]);

  const loadSections = async (token: string) => {
    try {
      const response = await fetch(`${ADMIN_API}?action=get_sections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSections(data.sections);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить разделы', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = async (section: Section) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_API}?action=update_section`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_section',
          section_id: section.id,
          is_enabled: !section.enabled
        })
      });

      if (response.ok) {
        toast({ title: 'Успешно', description: `Раздел "${section.name}" ${!section.enabled ? 'включен' : 'выключен'}` });
        loadSections(token);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить раздел', variant: 'destructive' });
    }
  };

  const getSectionIcon = (key: string) => {
    switch (key) {
      case 'dating': return 'Heart';
      case 'ads': return 'MessageSquare';
      case 'services': return 'Briefcase';
      case 'events': return 'Calendar';
      default: return 'Layout';
    }
  };

  const getSectionColor = (key: string) => {
    switch (key) {
      case 'dating': return 'from-pink-500 to-pink-600';
      case 'ads': return 'from-blue-500 to-blue-600';
      case 'services': return 'from-green-500 to-green-600';
      case 'events': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <Icon name="ArrowLeft" size={24} className="text-white" />
              <h1 className="text-xl font-bold text-white">Управление разделами сайта</h1>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-white text-center py-8">Загрузка...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((section) => (
              <Card key={section.id} className={`bg-gradient-to-br ${getSectionColor(section.key)} text-white`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name={getSectionIcon(section.key)} size={24} />
                      {section.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`toggle-${section.id}`} className="text-white/90 text-sm">
                        {section.enabled ? 'Включен' : 'Выключен'}
                      </Label>
                      <Switch
                        id={`toggle-${section.id}`}
                        checked={section.enabled}
                        onCheckedChange={() => toggleSection(section)}
                        className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/30"
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-white/80">
                    <div><strong>Ключ:</strong> {section.key}</div>
                    <div><strong>Обновлён:</strong> {new Date(section.updated_at).toLocaleString('ru-RU')}</div>
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                        onClick={() => navigate(`/admin/filters?section=${section.key}`)}
                      >
                        <Icon name="Filter" size={16} className="mr-2" />
                        Настроить фильтры
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSections;
