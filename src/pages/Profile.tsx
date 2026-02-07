import { useProfileData } from '@/components/profile/ProfileDataProvider';
import { useProfileActions } from '@/components/profile/ProfileActionsHandlers';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileSettingsDialog from '@/components/profile/ProfileSettingsDialog';

const Profile = () => {
  const {
    user,
    setUser,
    editMode,
    setEditMode,
    photos,
    settingsOpen,
    setSettingsOpen,
    verificationStatus,
    soundEnabled,
    setSoundEnabled,
    datingVisible,
    setDatingVisible,
    shareLocation,
    setShareLocation,
    darkMode,
    setDarkMode,
    premiumOnly,
    setPremiumOnly,
    animateAvatar,
    setAnimateAvatar,
    contactPrice,
    setContactPrice,
    formData,
    setFormData,
    loadPhotos,
    navigate,
  } = useProfileData();

  const {
    handleLogout,
    handleSaveProfile,
    handleCancel,
    handleDeleteAccount,
    toggleInterest,
    handleAvatarUpdate,
    handleSoundToggle,
    handleDatingVisibilityToggle,
    handleShareLocationToggle,
    handleThemeToggle,
    handlePremiumOnlyToggle,
    handleAnimateAvatarToggle,
    handleAnimationTextChange,
    handleAnimationVoiceChange,
    handleAnimationDriverChange,
    handleContactPriceChange
  } = useProfileActions({
    user,
    setUser,
    formData,
    setFormData,
    setEditMode,
    datingVisible,
    shareLocation,
    premiumOnly,
    animateAvatar,
    animationText,
    animationVoice,
    animationDriver,
    contactPrice,
    setSoundEnabled,
    setDatingVisible,
    setShareLocation,
    setPremiumOnly,
    setDarkMode,
    setAnimateAvatar,
    setAnimationText,
    setAnimationVoice,
    setAnimationDriver,
    setContactPrice
  });

  const availableInterests = [
    'Спорт', 'Путешествия', 'Кино', 'Музыка', 'Книги', 'Кулинария',
    'Искусство', 'Фотография', 'Танцы', 'Йога', 'Природа', 'Животные',
    'Технологии', 'Игры', 'Мода', 'Психология'
  ];

  const stats = [
    { icon: 'Heart', label: 'Знакомства', value: '0', color: 'from-pink-500 to-rose-500' },
    { icon: 'MessageSquare', label: 'Объявления', value: '0', color: 'from-purple-500 to-indigo-500' },
    { icon: 'Briefcase', label: 'Услуги', value: '0', color: 'from-blue-500 to-cyan-500' },
    { icon: 'Users', label: 'Рефералы', value: '0', color: 'from-emerald-500 to-teal-500' }
  ];

  return (
    <>
      <ProfileContent
        user={user}
        editMode={editMode}
        setEditMode={setEditMode}
        setSettingsOpen={setSettingsOpen}
        formData={formData}
        setFormData={setFormData}
        photos={photos}
        verificationStatus={verificationStatus}
        availableInterests={availableInterests}
        stats={stats}
        handleSaveProfile={handleSaveProfile}
        handleCancel={handleCancel}
        handleAvatarUpdate={handleAvatarUpdate}
        handleLogout={handleLogout}
        handleDeleteAccount={handleDeleteAccount}
        toggleInterest={toggleInterest}
        loadPhotos={loadPhotos}
        navigate={navigate}
      />

      <ProfileSettingsDialog
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        soundEnabled={soundEnabled}
        datingVisible={datingVisible}
        shareLocation={shareLocation}
        darkMode={darkMode}
        premiumOnly={premiumOnly}
        animateAvatar={animateAvatar}
        animationText={animationText}
        animationVoice={animationVoice}
        animationDriver={animationDriver}
        contactPrice={contactPrice}
        isVip={user?.is_vip}
        handleSoundToggle={handleSoundToggle}
        handleDatingVisibilityToggle={handleDatingVisibilityToggle}
        handleShareLocationToggle={handleShareLocationToggle}
        handleThemeToggle={handleThemeToggle}
        handlePremiumOnlyToggle={handlePremiumOnlyToggle}
        handleAnimateAvatarToggle={handleAnimateAvatarToggle}
        handleAnimationTextChange={handleAnimationTextChange}
        handleAnimationVoiceChange={handleAnimationVoiceChange}
        handleAnimationDriverChange={handleAnimationDriverChange}
        handleContactPriceChange={handleContactPriceChange}
      />
    </>
  );
};

export default Profile;