import Icon from '@/components/ui/icon';

interface ProfileContactProps {
  user: any;
  editMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
}

const ProfileContact = ({ user, editMode, formData, setFormData }: ProfileContactProps) => {
  return (
    <div className="pt-6 border-t">
      <h2 className="text-2xl font-bold mb-4">Контактная информация</h2>
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
        <div className="space-y-3">
          {user.phone && (
            <div className="flex items-center gap-3">
              <Icon name="Phone" size={20} className="text-muted-foreground" />
              <span className="text-lg">{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Icon name="Mail" size={20} className="text-muted-foreground" />
            <span className="text-lg">{user.email}</span>
          </div>
          {!user.phone && (
            <p className="text-muted-foreground text-sm">Добавьте номер телефона в режиме редактирования</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileContact;
