import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import TopAdsCarousel from '@/components/dating/TopAdsCarousel';
import DatingFilters from '@/components/dating/DatingFilters';
import ProfileCard from '@/components/dating/ProfileCard';
import VoiceAssistant from '@/components/VoiceAssistant';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useDatingFilters } from '@/components/dating/DatingFiltersState';
import { useDatingProfilesLoader, formatLastSeen } from '@/components/dating/DatingProfilesLoader';
import { useDatingActionsHandlers } from '@/components/dating/DatingActionsHandlers';

const Dating = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceResults, setVoiceResults] = useState<any[] | null>(null);
  const [voiceQuery, setVoiceQuery] = useState('');
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const { filters, handleFilterChange, resetFilters } = useDatingFilters({
    onFiltersChange: () => loadProfiles()
  });

  const { profiles, setProfiles, loading, currentUserId, loadProfiles } = useDatingProfilesLoader({ filters });

  const {
    friendRequests,
    friends,
    favorites,
    actionLoading,
    handleAddFriend,
    handleAddToFavorites,
    handleMessage
  } = useDatingActionsHandlers({ profiles, setProfiles, currentUserId });

  const topAds = profiles.filter(p => p.isTopAd);

  const handleVoiceResults = (results: any[], query: string, explanation: string) => {
    setVoiceResults(results);
    setVoiceQuery(query);
    setSearchQuery('');
  };

  const clearVoiceResults = () => {
    setVoiceResults(null);
    setVoiceQuery('');
  };

  const displayProfiles = voiceResults || profiles;

  const filteredProfiles = displayProfiles
    .filter(profile =>
      !profile.isTopAd &&
      (profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.about?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.is_vip && !b.is_vip) return -1;
      if (!a.is_vip && b.is_vip) return 1;
      
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB, 'ru');
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20 pt-20 lg:overflow-auto overflow-y-auto overflow-x-hidden">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        
        {voiceQuery && (
          <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Результаты голосового поиска:</p>
              <p className="font-medium">"{voiceQuery}"</p>
            </div>
            <button
              onClick={clearVoiceResults}
              className="px-3 py-1 text-sm bg-white dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Очистить
            </button>
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по имени, городу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {topAds.length > 0 && (
          <div className="mb-8">
            <TopAdsCarousel 
              profiles={topAds}
              onAddFriend={handleAddFriend}
              onMessage={handleMessage}
              onAddToFavorites={handleAddToFavorites}
              friendRequests={friendRequests}
              friends={friends}
              favorites={favorites}
              actionLoading={actionLoading}
              formatLastSeen={formatLastSeen}
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <Card className="p-8 text-center">
            <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Профили не найдены</h3>
            <p className="text-muted-foreground">Попробуйте изменить параметры фильтров или поиска</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onAddFriend={handleAddFriend}
                onToggleFavorite={handleAddToFavorites}
                isFriendRequestSent={friendRequests.includes(profile.id) || profile.friend_request_sent}
                isFriend={friends.includes(profile.id) || profile.is_friend}
                isFavorite={favorites.includes(profile.id) || profile.is_favorite}
              />
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default Dating;