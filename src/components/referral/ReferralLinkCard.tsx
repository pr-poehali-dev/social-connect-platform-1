import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface ReferralLinkCardProps {
  referralCode: string;
}

const ReferralLinkCard = ({ referralCode }: ReferralLinkCardProps) => {
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const referralLink = referralCode 
    ? `loveis.city/ref/${referralCode}`
    : '';

  useEffect(() => {
    if (referralLink) {
      QRCode.toDataURL(`https://${referralLink}`, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrCodeUrl);
    }
  }, [referralLink]);

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast({ title: 'Скопировано!', description: 'Реферальная ссылка в буфере обмена' });
  };

  return (
    <Card className="mb-8 rounded-3xl border-2 shadow-xl">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Ваша реферальная ссылка</h2>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="font-mono rounded-2xl text-sm h-9"
              />
              <Button onClick={copyLink} className="rounded-2xl h-9 w-9" size="icon">
                <Icon name="Copy" size={16} />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Код:</span>
              <code className="font-mono font-bold text-foreground bg-muted px-2 py-1 rounded">
                {referralCode || 'Загрузка...'}
              </code>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (referralCode) {
                    navigator.clipboard.writeText(referralCode);
                    toast({ title: 'Скопировано!', description: 'Код в буфере обмена' });
                  }
                }} 
                variant="ghost" 
                size="icon"
                className="h-6 w-6"
              >
                <Icon name="Copy" size={14} />
              </Button>
            </div>
          </div>
          {qrCodeUrl && (
            <div className="flex-shrink-0">
              <img 
                src={qrCodeUrl} 
                alt="QR код реферальной ссылки" 
                className="w-[88px] h-[88px] border-2 border-gray-200 rounded-xl"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralLinkCard;
