import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import ProfileViewMode from '@/components/profile/ProfileViewMode';
import ProfileStats from '@/components/profile/ProfileStats';
import PhotoGallery from '@/components/profile/PhotoGallery';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileContact from '@/components/profile/ProfileContact';
import { ProfileFormData } from './ProfileDataProvider';

interface ProfileContentProps {
  user: any;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  formData: ProfileFormData;
  setFormData: (data: ProfileFormData) => void;
  photos: any[];
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  availableInterests: string[];
  stats: any[];
  handleSaveProfile: () => void;
  handleCancel: () => void;
  handleAvatarUpdate: (url: string) => void;
  handleLogout: () => void;
  handleDeleteAccount: () => void;
  toggleInterest: (interest: string) => void;
  loadPhotos: () => void;
  navigate: any;
}

const ProfileContent = ({
  user,
  editMode,
  setEditMode,
  setSettingsOpen,
  formData,
  setFormData,
  photos,
  verificationStatus,
  availableInterests,
  stats,
  handleSaveProfile,
  handleCancel,
  handleAvatarUpdate,
  handleLogout,
  handleDeleteAccount,
  toggleInterest,
  loadPhotos,
  navigate
}: ProfileContentProps) => {
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-5xl mx-auto rounded-3xl border-2 shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                  <ProfileAvatar 
                    user={user}
                    editMode={editMode}
                    onAvatarUpdate={handleAvatarUpdate}
                  />
                  
                  {!editMode ? (
                    <div className="flex flex-col gap-2 mt-4">
                      <Button onClick={() => setEditMode(true)} variant="outline" className="w-full gap-2 rounded-xl h-12">
                        <Icon name="Edit" size={20} />
                        Редактировать
                      </Button>
                      <Button onClick={() => setSettingsOpen(true)} variant="outline" className="w-full gap-2 rounded-xl h-12">
                        <Icon name="Settings" size={20} />
                        Настройки
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleSaveProfile} className="flex-1 gap-2 rounded-xl h-12">
                        <Icon name="Check" size={20} />
                        Сохранить
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="gap-2 rounded-xl h-12 px-4">
                        <Icon name="X" size={20} />
                      </Button>
                    </div>
                  )}

                  <ProfileContact 
                    user={user}
                    editMode={editMode}
                    formData={formData}
                    setFormData={setFormData}
                  />
                </div>

                <div className="lg:w-2/3 space-y-6">
                  <ProfileInfo 
                    user={user}
                    editMode={editMode}
                    formData={formData}
                    setFormData={setFormData}
                  />

                  <ProfileActions 
                    user={user}
                    verificationStatus={verificationStatus}
                    onRequestVerification={() => {
                      navigate('/verification-request');
                    }}
                  />

                  <Button 
                    onClick={() => navigate('/referral')}
                    variant="outline" 
                    className="w-full gap-2 rounded-xl h-12"
                  >
                    <Icon name="Users" size={20} />
                    Партнёрская программа
                  </Button>

                  {editMode ? (
                    <div className="pt-6 border-t">
                      <ProfileEditForm
                        formData={formData}
                        setFormData={setFormData}
                        availableInterests={availableInterests}
                        toggleInterest={toggleInterest}
                        isVerified={user?.is_verified}
                      />
                    </div>
                  ) : (
                    <div className="pt-6 border-t">
                      <ProfileViewMode user={user} />
                    </div>
                  )}

                  {!editMode && (
                    <div className="pt-6 border-t">
                      <ProfileStats stats={stats} />
                    </div>
                  )}

                  {!editMode && (
                    <div className="pt-6 border-t">
                      <PhotoGallery 
                        photos={photos}
                        editMode={editMode}
                        onPhotosUpdate={loadPhotos}
                      />
                    </div>
                  )}

                  {!editMode && (
                    <div className="pt-6 border-t">
                      <ProfileActions 
                        user={user}
                        verificationStatus={verificationStatus}
                      />
                    </div>
                  )}

                  {!editMode && (
                    <div className="pt-6 border-t flex flex-col gap-3">
                      <Button 
                        onClick={handleLogout}
                        variant="outline" 
                        className="w-full gap-2 rounded-xl h-12"
                      >
                        <Icon name="LogOut" size={20} />
                        Выйти из аккаунта
                      </Button>
                    </div>
                  )}
                  
                  {editMode && (
                    <div className="pt-6 border-t">
                      <Button 
                        onClick={handleDeleteAccount}
                        variant="destructive" 
                        className="w-full gap-2 rounded-xl h-12"
                      >
                        <Icon name="Trash2" size={20} />
                        Удалить аккаунт
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfileContent;