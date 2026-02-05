import BasicInfoFields from './form-sections/BasicInfoFields';
import LocationFields from './form-sections/LocationFields';
import PersonalCharacteristicsFields from './form-sections/PersonalCharacteristicsFields';
import InterestsAndBioFields from './form-sections/InterestsAndBioFields';
import DatingPreferencesFields from './form-sections/DatingPreferencesFields';

interface ProfileEditFormProps {
  formData: any;
  setFormData: (data: any) => void;
  availableInterests: string[];
  toggleInterest: (interest: string) => void;
  isVerified?: boolean;
}

const ProfileEditForm = ({ formData, setFormData, availableInterests, toggleInterest, isVerified = false }: ProfileEditFormProps) => {
  return (
    <div className="space-y-6">
      <BasicInfoFields formData={formData} setFormData={setFormData} isVerified={isVerified} />
      <LocationFields formData={formData} setFormData={setFormData} />
      <PersonalCharacteristicsFields formData={formData} setFormData={setFormData} />
      <DatingPreferencesFields formData={formData} setFormData={setFormData} />
      <InterestsAndBioFields 
        formData={formData} 
        setFormData={setFormData} 
        availableInterests={availableInterests}
        toggleInterest={toggleInterest}
      />
    </div>
  );
};

export default ProfileEditForm;