import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ReferralMentorCard from '@/components/referral/ReferralMentorCard';
import ReferralLinkCard from '@/components/referral/ReferralLinkCard';
import ReferralInfoSection from '@/components/referral/ReferralInfoSection';
import ReferralHistorySection from '@/components/referral/ReferralHistorySection';

const REFERRAL_API_URL = 'https://functions.poehali.dev/17091600-02b0-442b-a13d-2b57827b7106';

interface Referral {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
  avatar_url: string | null;
}

interface ReferralInfo {
  referral_code: string;
  referrals_count: number;
  bonus_balance: number;
  referral_bonus_available: boolean;
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

interface Mentor {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
}

const Referral = () => {
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [bonuses, setBonuses] = useState<BonusTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [mentor, setMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    let userId = localStorage.getItem('userId');
    
    // Fallback: try to get userId from user object
    if (!userId) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id?.toString();
          if (userId) {
            localStorage.setItem('userId', userId);
            console.log('Recovered userId from user object:', userId);
          }
        } catch (e) {
          console.error('Failed to parse user object:', e);
        }
      }
    }
    
    console.log('Loading referral data for userId:', userId);
    
    if (!userId) {
      console.log('No userId found in localStorage');
      setLoading(false);
      return;
    }

    try {
      const [infoRes, referralsRes, bonusesRes, mentorRes] = await Promise.all([
        fetch(`${REFERRAL_API_URL}?action=info`, {
          headers: { 'X-User-Id': userId }
        }),
        fetch(`${REFERRAL_API_URL}?action=referrals`, {
          headers: { 'X-User-Id': userId }
        }),
        fetch(`${REFERRAL_API_URL}?action=bonuses`, {
          headers: { 'X-User-Id': userId }
        }),
        fetch(`${REFERRAL_API_URL}?action=mentor`, {
          headers: { 'X-User-Id': userId }
        })
      ]);

      console.log('Info response status:', infoRes.status);
      console.log('Referrals response status:', referralsRes.status);

      if (infoRes.ok) {
        const info = await infoRes.json();
        console.log('Referral info loaded:', info);
        setReferralInfo(info);
      } else {
        console.error('Failed to load referral info:', await infoRes.text());
      }

      if (referralsRes.ok) {
        const data = await referralsRes.json();
        console.log('Referrals loaded:', data);
        setReferrals(data.referrals || []);
      } else {
        console.error('Failed to load referrals:', await referralsRes.text());
      }

      if (bonusesRes.ok) {
        const data = await bonusesRes.json();
        console.log('Bonuses loaded:', data);
        setBonuses(data.bonuses || []);
      } else {
        console.error('Failed to load bonuses:', await bonusesRes.text());
      }

      if (mentorRes.ok) {
        const data = await mentorRes.json();
        console.log('Mentor loaded:', data);
        setMentor(data.mentor);
      } else {
        console.error('Failed to load mentor:', await mentorRes.text());
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 lg:overflow-auto overflow-y-auto overflow-x-hidden">
      <Navigation />
      
      <main className="pt-32 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 bg-clip-text text-transparent">
                Партнёрская программа
              </h1>
              <p className="text-xl text-muted-foreground">
                Приглашайте друзей и зарабатывайте вместе
              </p>
            </div>

            <ReferralMentorCard 
              mentor={mentor} 
              onMentorSet={setMentor}
              apiUrl={REFERRAL_API_URL}
              referralBonusAvailable={referralInfo?.referral_bonus_available || false}
            />

            <ReferralInfoSection 
              referralsCount={referralInfo?.referrals_count || 0}
              bonusBalance={referralInfo?.bonus_balance || 0}
            />

            <ReferralLinkCard referralCode={referralInfo?.referral_code || ''} />

            <ReferralHistorySection bonuses={bonuses} referrals={referrals} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Referral;