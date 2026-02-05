import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

interface ProfileInfoProps {
  user: any;
  editMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
}

interface Mentor {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
}

const ProfileInfo = ({ user, editMode, formData, setFormData }: ProfileInfoProps) => {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loadingMentor, setLoadingMentor] = useState(true);

  useEffect(() => {
    loadMentor();
  }, []);

  const loadMentor = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setLoadingMentor(false);
      return;
    }

    try {
      const res = await fetch('https://functions.poehali.dev/17091600-02b0-442b-a13d-2b57827b7106?action=mentor', {
        headers: { 'X-User-Id': userId }
      });

      if (res.ok) {
        const data = await res.json();
        setMentor(data.mentor);
      }
    } catch (error) {
      console.error('Failed to load mentor:', error);
    } finally {
      setLoadingMentor(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center gap-2">
        <span className="break-words">
          {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.name || user.nickname}
        </span>
        {user.is_verified && (
          <Icon name="BadgeCheck" size={24} className="text-blue-500 md:w-8 md:h-8 flex-shrink-0" />
        )}
      </h1>
      {!editMode && user.status_text && (
        <div className="mb-3 text-muted-foreground italic">
          {user.status_text}
        </div>
      )}
      {!editMode && !loadingMentor && mentor && (
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl p-2">
          <Icon name="Award" size={16} />
          <span>Ваш наставник: <span className="font-medium text-foreground">
            {mentor.first_name || mentor.last_name
              ? `${mentor.first_name || ''} ${mentor.last_name || ''}`.trim()
              : mentor.email}
          </span></span>
        </div>
      )}
      {editMode && (
        <div className="mb-3">
          <input
            type="text"
            value={formData.status_text}
            onChange={(e) => setFormData({ ...formData, status_text: e.target.value })}
            placeholder="Статус (например: На работе, В отпуске...)" 
            className="w-full px-3 py-2 border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={150}
          />
        </div>
      )}
      {(user.city || user.district) && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon name="MapPin" size={18} />
          <span>{[user.city, user.district].filter(Boolean).join(', ')}</span>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;