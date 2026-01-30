import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface InterestsAndBioFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  availableInterests: string[];
  toggleInterest: (interest: string) => void;
}

const InterestsAndBioFields = ({ formData, setFormData, availableInterests, toggleInterest }: InterestsAndBioFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label>Интересы</Label>
        <div className="flex flex-wrap gap-2">
          {availableInterests.map((interest) => (
            <Badge
              key={interest}
              variant={formData.interests.includes(interest) ? 'default' : 'outline'}
              className="cursor-pointer rounded-xl px-4 py-2 text-sm"
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">О себе</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Расскажите о себе"
          className="rounded-xl min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.bio.length}/500
        </p>
      </div>
    </>
  );
};

export default InterestsAndBioFields;
