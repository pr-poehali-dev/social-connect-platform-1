import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const GALLERY_URL = 'https://functions.poehali.dev/e762cdb2-751d-45d3-8ac1-62e736480782';
const PROFILES_URL = 'https://functions.poehali.dev/fd0a5e8d-13a1-4b70-a54e-1eb72b3b1b39';

interface User {
  granted_to_user_id: number;
  first_name: string;
  last_name: string;
  nickname: string;
  avatar_url: string;
}

interface PrivateAlbumAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivateAlbumAccessDialog = ({ open, onOpenChange }: PrivateAlbumAccessDialogProps) => {
  const { toast } = useToast();
  const [accessList, setAccessList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadAccessList();
    }
  }, [open]);

  const loadAccessList = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${GALLERY_URL}?action=access-list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAccessList(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load access list:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${PROFILES_URL}?action=search&query=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Исключаем пользователей, у которых уже есть доступ
        const filtered = (data.users || []).filter(
          (u: any) => !accessList.some(a => a.granted_to_user_id === u.id)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const grantAccess = async (userId: number) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${GALLERY_URL}?action=grant-access`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ granted_to_user_id: userId })
      });

      if (response.ok) {
        toast({ title: 'Доступ открыт', description: 'Пользователь может просматривать закрытый альбом' });
        loadAccessList();
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось открыть доступ', variant: 'destructive' });
    }
  };

  const revokeAccess = async (userId: number) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${GALLERY_URL}?action=revoke-access`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ granted_to_user_id: userId })
      });

      if (response.ok) {
        toast({ title: 'Доступ закрыт', description: 'Пользователь больше не видит закрытый альбом' });
        loadAccessList();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось закрыть доступ', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Lock" size={24} />
            Доступ к закрытому альбому
          </DialogTitle>
          <DialogDescription>
            Управляйте списком пользователей, которые могут видеть ваши приватные фото
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Поиск пользователей */}
          <div>
            <div className="flex gap-2">
              <Input
                placeholder="Поиск по имени..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
              />
              <Button onClick={searchUsers} disabled={loading}>
                <Icon name="Search" size={18} />
              </Button>
            </div>

            {/* Результаты поиска */}
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-2 p-2 border rounded-xl bg-muted/50">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg bg-background">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.first_name?.[0] || user.nickname?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : user.nickname}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => grantAccess(user.id)}>
                      <Icon name="UserPlus" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Список пользователей с доступом */}
          <div>
            <h4 className="font-medium mb-2">Имеют доступ ({accessList.length})</h4>
            {accessList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Никто не имеет доступа к закрытому альбому
              </p>
            ) : (
              <div className="space-y-2">
                {accessList.map((user) => (
                  <div key={user.granted_to_user_id} className="flex items-center gap-3 p-3 rounded-xl border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.first_name?.[0] || user.nickname?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : user.nickname}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => revokeAccess(user.granted_to_user_id)}
                    >
                      <Icon name="UserMinus" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivateAlbumAccessDialog;
