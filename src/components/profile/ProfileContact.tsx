import Icon from '@/components/ui/icon';

interface ProfileContactProps {
  user: any;
  editMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
}

const ProfileContact = ({ user, editMode, formData, setFormData }: ProfileContactProps) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-3">Контактная информация</h3>
      {editMode ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Icon name="Phone" size={16} className="inline mr-2" />
              Телефон
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (___) ___-__-__"
              className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <Icon name="Mail" size={16} className="inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full px-4 py-3 border border-input rounded-xl bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">Email нельзя изменить</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {user.phone && (
            <div className="flex items-center gap-2">
              <Icon name="Phone" size={18} className="text-muted-foreground" />
              <span className="text-sm">{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Icon name="Mail" size={18} className="text-muted-foreground" />
            <span className="text-sm">{user.email}</span>
          </div>
          {!user.phone && (
            <p className="text-muted-foreground text-xs">Добавьте номер телефона в режиме редактирования</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileContact;