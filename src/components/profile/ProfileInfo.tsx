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
      <h1 className="text-4xl font-bold mb-2">
        {user.name || user.nickname}
      </h1>
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span>Онлайн</span>
      </div>
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
