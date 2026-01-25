import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Contact {
  id: number;
  name: string;
  phone?: string;
  instagram?: string;
  telegram?: string;
  avatar?: string;
  notes?: string;
}

interface ContactsListProps {
  userId: number | null;
  toast: any;
}

const ContactsList = ({ userId, toast }: ContactsListProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    instagram: '',
    telegram: '',
    avatar: '',
    notes: ''
  });

  const CONTACTS_URL = 'https://functions.poehali.dev/92e6c953-51c7-4322-a4f4-9d2b06c5c58b';

  useEffect(() => {
    if (userId) {
      loadContacts();
    }
  }, [userId]);

  const loadContacts = async () => {
    if (!userId) return;

    try {
      const response = await fetch(CONTACTS_URL, {
        headers: {
          'X-User-Id': userId.toString()
        }
      });
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить контакты',
        variant: 'destructive'
      });
    }
  };

  const handleSave = async () => {
    if (!userId || !formData.name) return;

    try {
      const method = editingContact ? 'PUT' : 'POST';
      const body = editingContact 
        ? { ...formData, id: editingContact.id }
        : formData;

      const response = await fetch(CONTACTS_URL, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: editingContact ? 'Контакт обновлен' : 'Контакт добавлен'
        });
        setIsDialogOpen(false);
        resetForm();
        loadContacts();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить контакт',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!userId) return;

    try {
      const response = await fetch(`${CONTACTS_URL}?id=${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': userId.toString()
        }
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Контакт удален'
        });
        loadContacts();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить контакт',
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone || '',
      instagram: contact.instagram || '',
      telegram: contact.telegram || '',
      avatar: contact.avatar || '',
      notes: contact.notes || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      instagram: '',
      telegram: '',
      avatar: '',
      notes: ''
    });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(search.toLowerCase()) ||
    contact.phone?.includes(search) ||
    contact.instagram?.toLowerCase().includes(search.toLowerCase()) ||
    contact.telegram?.toLowerCase().includes(search.toLowerCase())
  );

  const detectContactType = (contact: Contact): string[] => {
    const types: string[] = [];
    if (contact.phone) types.push('phone');
    if (contact.instagram) types.push('instagram');
    if (contact.telegram) types.push('telegram');
    return types;
  };

  return (
    <Card className="rounded-3xl border-2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Телефонная книга</h2>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? 'Редактировать контакт' : 'Новый контакт'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Имя *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Иван Иванов"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 999 123-45-67"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@username"
                  />
                </div>
                <div>
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    placeholder="@username"
                  />
                </div>
                <div>
                  <Label htmlFor="avatar">URL аватара</Label>
                  <Input
                    id="avatar"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Заметки</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Дополнительная информация..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleSave} disabled={!formData.name}>
                    Сохранить
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Поиск по имени, телефону, соцсетям..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="BookUser" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {search ? 'Контакты не найдены' : 'Список контактов пуст'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContacts.map((contact) => {
              const types = detectContactType(contact);
              return (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{contact.name}</h3>
                      <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                        {contact.phone && (
                          <div className="flex items-center gap-1">
                            <Icon name="Phone" size={14} />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.instagram && (
                          <div className="flex items-center gap-1">
                            <Icon name="Instagram" size={14} />
                            <span>{contact.instagram}</span>
                          </div>
                        )}
                        {contact.telegram && (
                          <div className="flex items-center gap-1">
                            <Icon name="Send" size={14} />
                            <span>{contact.telegram}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(contact)}
                    >
                      <Icon name="Pencil" size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Icon name="Trash2" size={18} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactsList;
