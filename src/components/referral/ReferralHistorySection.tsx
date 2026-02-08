import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Referral {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
  avatar_url: string | null;
}

interface BonusTransaction {
  id: number;
  amount: number;
  description: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface ReferralHistorySectionProps {
  bonuses: BonusTransaction[];
  referrals: Referral[];
}

const ReferralHistorySection = ({ bonuses, referrals }: ReferralHistorySectionProps) => {
  return (
    <>
      {bonuses.length > 0 && (
        <Card className="mb-8 rounded-3xl border-2">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6">История начислений</h2>
            <div className="space-y-3">
              {bonuses.map((bonus) => (
                <div
                  key={bonus.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border bg-card"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="Coins" size={20} className="text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {bonus.first_name || bonus.last_name
                        ? `${bonus.first_name || ''} ${bonus.last_name || ''}`.trim()
                        : bonus.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bonus.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-emerald-600">+{bonus.amount} ₽</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(bonus.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {referrals.length > 0 && (
        <Card className="mb-8 rounded-3xl border-2">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6">Приглашенные пользователи</h2>
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={referral.avatar_url || undefined} />
                    <AvatarFallback>
                      {referral.first_name?.[0] || referral.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {referral.first_name || referral.last_name
                        ? `${referral.first_name || ''} ${referral.last_name || ''}`.trim()
                        : referral.email}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {referral.email}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ReferralHistorySection;
