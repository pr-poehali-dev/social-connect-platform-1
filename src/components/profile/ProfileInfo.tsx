import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

const REFERRAL_API_URL = 'https://functions.poehali.dev/17091600-02b0-442b-a13d-2b57827b7106';

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
      const res = await fetch(`${REFERRAL_API_URL}?action=mentor`, {
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
    <div className="border-2 border-red-800/20 rounded-sm p-6 bg-white/50">
      {/* Заголовок ФИО */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-red-800 font-semibold mb-1">Фамилия, Имя, Отчество</div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 flex-wrap border-b-2 border-red-800/30 pb-2">
          <span className="break-words">
            {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.name || user.nickname}
          </span>
          {user.is_verified && (
            <Icon name="BadgeCheck" size={24} className="text-blue-500 md:w-8 md:h-8 flex-shrink-0" />
          )}
          {user.is_vip && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Icon name="Crown" size={14} className="mr-1" />
              Premium
            </Badge>
          )}
        </h1>
      </div>

      {/* Паспортные данные */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-red-800 font-semibold mb-1">Личный номер</div>
          <div className="font-mono text-lg font-semibold text-gray-900">№ {user.id}</div>
        </div>
        
        {(user.city || user.district) && (
          <div>
            <div className="text-xs uppercase tracking-wider text-red-800 font-semibold mb-1">Место регистрации</div>
            <div className="flex items-center gap-2 text-gray-900">
              <Icon name="MapPin" size={16} className="text-red-700" />
              <span className="font-medium">{[user.city, user.district].filter(Boolean).join(', ')}</span>
            </div>
          </div>
        )}
      </div>

      {!editMode && user.status_text && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-700 rounded">
          <div className="text-xs uppercase tracking-wider text-red-800 font-semibold mb-1">Статус</div>
          <div className="text-gray-900 italic">{user.status_text}</div>
        </div>
      )}

      {!editMode && !loadingMentor && mentor && (
        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-600 rounded">
          <div className="text-xs uppercase tracking-wider text-yellow-800 font-semibold mb-1">Ваш наставник</div>
          <div className="flex items-center gap-2 text-gray-900 font-medium">
            <Icon name="Award" size={16} className="text-yellow-600" />
            <span>
              {mentor.first_name || mentor.last_name
                ? `${mentor.first_name || ''} ${mentor.last_name || ''}`.trim()
                : mentor.email}
            </span>
          </div>
        </div>
      )}

      {editMode && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wider text-red-800 font-semibold mb-2">Статус</div>
          <input
            type="text"
            value={formData.status_text}
            onChange={(e) => setFormData({ ...formData, status_text: e.target.value })}
            placeholder="Статус (например: На работе, В отпуске...)" 
            className="w-full px-3 py-2 border-2 border-red-800/20 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
            maxLength={150}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;