import Icon from '@/components/ui/icon';

interface ProfileInfoProps {
  user: any;
  editMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
}

const ProfileInfo = ({ user, editMode, formData, setFormData }: ProfileInfoProps) => {
  return (
    <div>
      <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center gap-2">
        <span className="break-words">{user.name || user.nickname}</span>
        {user.phone_verified && (
          <Icon name="BadgeCheck" size={24} className="text-blue-500 md:w-8 md:h-8 flex-shrink-0" />
        )}
      </h1>
      {!editMode && user.status_text && (
        <div className="mb-3 text-muted-foreground italic">
          {user.status_text}
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