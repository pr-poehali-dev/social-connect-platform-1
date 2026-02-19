import { useState, useEffect, useRef, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import TopAdsCarousel from '@/components/dating/TopAdsCarousel';
import ProfileCard from '@/components/dating/ProfileCard';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { useDatingFilters } from '@/components/dating/DatingFiltersState';
import { useDatingProfilesLoader, formatLastSeen } from '@/components/dating/DatingProfilesLoader';
import { useDatingActionsHandlers } from '@/components/dating/DatingActionsHandlers';
import OlesyaCard from '@/components/dating/OlesyaCard';
import DimaCard from '@/components/dating/DimaCard';
import { parseSmartSearch, hasSmartFilters, formatSmartFilters, ParsedSearch } from '@/utils/smartSearchParser';

const SMART_EXAMPLES = [
  'девушек из Екатеринбурга от 25 до 35 лет',
  'парней из Москвы от 30 лет',
  'девушку из Казани до 28 лет',
  'мужчин из Питера 35-45 лет',
];

const Dating = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceResults, setVoiceResults] = useState<Record<string, unknown>[] | null>(null);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [smartParsed, setSmartParsed] = useState<ParsedSearch | null>(null);
  const [smartApplied, setSmartApplied] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const example = SMART_EXAMPLES[Math.floor(Math.random() * SMART_EXAMPLES.length)];
    setPlaceholder(example);
  }, []);

  const applySmartFilters = useCallback((parsed: ParsedSearch) => {
    if (parsed.gender && parsed.gender !== filters.gender) {
      handleFilterChange('gender', parsed.gender);
    }
    if (parsed.ageFrom && parsed.ageFrom !== filters.ageFrom) {
      handleFilterChange('ageFrom', parsed.ageFrom);
    }
    if (parsed.ageTo && parsed.ageTo !== filters.ageTo) {
      handleFilterChange('ageTo', parsed.ageTo);
    }
    if (parsed.city && parsed.city !== filters.city) {
      handleFilterChange('city', parsed.city);
    }
    setSmartApplied(true);
  }, [filters, handleFilterChange]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (value.length >= 3) {
        const parsed = parseSmartSearch(value);
        setSmartParsed(parsed);

        if (hasSmartFilters(parsed)) {
          applySmartFilters(parsed);
        }
      } else {
        setSmartParsed(null);
      }
    }, 600);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.length >= 3) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const parsed = parseSmartSearch(searchQuery);
      setSmartParsed(parsed);
      if (hasSmartFilters(parsed)) {
        applySmartFilters(parsed);
      }
    }
  };

  const clearSmartSearch = () => {
    setSearchQuery('');
    setSmartParsed(null);
    setSmartApplied(false);
    resetFilters();
  };

  const removeSmartTag = (type: 'gender' | 'city' | 'age') => {
    if (type === 'gender') handleFilterChange('gender', '');
    if (type === 'city') handleFilterChange('city', '');
    if (type === 'age') {
      handleFilterChange('ageFrom', '');
      handleFilterChange('ageTo', '');
    }
  };

  const handleVoiceResults = (results: Record<string, unknown>[], query: string) => {
    setVoiceResults(results);
    setVoiceQuery(query);
    setSearchQuery('');
    setSmartParsed(null);
  };

  const clearVoiceResults = () => {
    setVoiceResults(null);
    setVoiceQuery('');
  };

  const displayProfiles = voiceResults || profiles;

  const textQuery = smartParsed?.textQuery || '';
  const searchLower = smartApplied ? textQuery.toLowerCase() : searchQuery.toLowerCase();

  const filteredProfiles = displayProfiles
    .filter(profile =>
      !profile.isTopAd &&
      (!searchLower || 
        profile.name?.toLowerCase().includes(searchLower) ||
        profile.city?.toLowerCase().includes(searchLower) ||
        profile.about?.toLowerCase().includes(searchLower))
    )
    .sort((a, b) => {
      if (a.is_vip && !b.is_vip) return -1;
      if (!a.is_vip && b.is_vip) return 1;
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB, 'ru');
    });

  const smartTags = smartParsed && hasSmartFilters(smartParsed) ? formatSmartFilters(smartParsed) : [];

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

        <div className="mb-6 space-y-2">
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder={`Например: ${placeholder}`}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-800"
            />
            {searchQuery && (
              <button
                onClick={clearSmartSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={18} />
              </button>
            )}
          </div>

          {smartTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Icon name="Sparkles" size={12} />
                Найдено:
              </span>
              {smartParsed?.gender && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs font-medium">
                  {smartParsed.gender === 'female' ? 'Женский пол' : 'Мужской пол'}
                  <button onClick={() => removeSmartTag('gender')} className="hover:text-pink-900 dark:hover:text-pink-100">
                    <Icon name="X" size={12} />
                  </button>
                </span>
              )}
              {smartParsed?.city && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                  {smartParsed.city}
                  <button onClick={() => removeSmartTag('city')} className="hover:text-blue-900 dark:hover:text-blue-100">
                    <Icon name="X" size={12} />
                  </button>
                </span>
              )}
              {(smartParsed?.ageFrom || smartParsed?.ageTo) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                  {smartParsed?.ageFrom && smartParsed?.ageTo
                    ? `${smartParsed.ageFrom}–${smartParsed.ageTo} лет`
                    : smartParsed?.ageFrom
                    ? `от ${smartParsed.ageFrom} лет`
                    : `до ${smartParsed?.ageTo} лет`}
                  <button onClick={() => removeSmartTag('age')} className="hover:text-green-900 dark:hover:text-green-100">
                    <Icon name="X" size={12} />
                  </button>
                </span>
              )}
            </div>
          )}
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
            <p className="text-muted-foreground mb-4">Попробуйте изменить параметры поиска</p>
            {smartApplied && (
              <button
                onClick={clearSmartSearch}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90"
              >
                Сбросить фильтры
              </button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {!searchQuery && !voiceResults && <OlesyaCard />}
            {!searchQuery && !voiceResults && <DimaCard />}
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