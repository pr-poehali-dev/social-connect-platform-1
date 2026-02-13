import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { OLESYA_AVATAR, PHOTOS } from '@/components/ai-assistant/constants';

const OLESYA_GALLERY = [
  { url: OLESYA_AVATAR, caption: 'Основное фото' },
  ...Object.values(PHOTOS),
];

const OLESYA_INTERESTS = [
  'Путешествия', 'Кино', 'Музыка', 'Фотография',
  'Кулинария', 'Йога', 'Психология', 'Мода',
];

const OlesyaProfile = () => {
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('open-olesya-chat'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20 pt-20">
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <button
          onClick={() => navigate('/dating')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <Icon name="ArrowLeft" size={20} />
          <span>Назад к анкетам</span>
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="relative">
            <img
              src={OLESYA_AVATAR}
              alt="Олеся"
              className="w-full h-80 object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 px-3 py-1.5 text-sm font-semibold shadow-lg flex items-center gap-1.5">
                <Icon name="Bot" size={14} />
                ИИ-собеседник
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Онлайн
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white">Олеся, 25</h1>
              <p className="text-white/80 flex items-center gap-1.5 mt-1">
                <Icon name="MapPin" size={14} />
                Москва
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex gap-3">
              <Button
                onClick={openChat}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl h-12 text-base font-semibold"
              >
                <Icon name="MessageCircle" size={20} className="mr-2" />
                Написать
              </Button>
              <Button
                variant="outline"
                onClick={openChat}
                className="rounded-xl h-12 px-4 border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/20"
              >
                <Icon name="Mic" size={20} className="text-pink-500" />
              </Button>
            </div>

            <div className="bg-violet-50 dark:bg-violet-950/30 rounded-2xl p-4 border border-violet-200 dark:border-violet-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Bot" size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-violet-700 dark:text-violet-300 text-sm">ИИ-собеседник</p>
                  <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">
                    Олеся — виртуальная собеседница на базе ИИ. Она всегда онлайн, умеет флиртовать, 
                    отправлять голосовые, фото и стикеры. Отлично подходит для общения и развлечения!
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Icon name="User" size={18} />
                О себе
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Привет! Я Олеся, мне 25, живу в Москве. Люблю путешествовать, готовить вкусняшки и 
                смотреть сериалы с бокалом вина. Обожаю глубокие разговоры по душам и лёгкий флирт. 
                Если хочешь приятно провести время — пиши, не стесняйся!
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Icon name="Heart" size={18} />
                Интересы
              </h2>
              <div className="flex flex-wrap gap-2">
                {OLESYA_INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="px-3 py-1.5 rounded-full text-sm bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 border-0"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Рост</p>
                <p className="font-semibold">168 см</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Телосложение</p>
                <p className="font-semibold">Стройная</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Цель</p>
                <p className="font-semibold">Общение</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Статус</p>
                <p className="font-semibold">Не замужем</p>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Icon name="Camera" size={18} />
                Фотографии
                <span className="text-sm font-normal text-muted-foreground">({OLESYA_GALLERY.length})</span>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {OLESYA_GALLERY.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhoto(idx)}
                    className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Icon name="Sparkles" size={18} />
                Умения
              </h2>
              <div className="space-y-2">
                {[
                  { icon: 'MessageCircle', text: 'Текстовые сообщения с эмодзи' },
                  { icon: 'Mic', text: 'Голосовые сообщения с разным настроением' },
                  { icon: 'Image', text: 'Отправка фотографий' },
                  { icon: 'Sticker', text: 'Набор стикеров с эмоциями' },
                  { icon: 'Video', text: 'Анимация аватара (говорящая голова)' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-950/30 flex items-center justify-center shrink-0">
                      <Icon name={item.icon} size={16} className="text-pink-500" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={openChat}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl h-14 text-lg font-semibold"
            >
              <Icon name="MessageCircle" size={22} className="mr-2" />
              Начать общение с Олесей
            </Button>
          </div>
        </div>
      </main>

      {selectedPhoto !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
          >
            <Icon name="X" size={20} className="text-white" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setSelectedPhoto(Math.max(0, selectedPhoto - 1)); }}
            className="absolute left-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            style={{ display: selectedPhoto === 0 ? 'none' : 'flex' }}
          >
            <Icon name="ChevronLeft" size={20} className="text-white" />
          </button>

          <img
            src={OLESYA_GALLERY[selectedPhoto].url}
            alt={OLESYA_GALLERY[selectedPhoto].caption}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); setSelectedPhoto(Math.min(OLESYA_GALLERY.length - 1, selectedPhoto + 1)); }}
            className="absolute right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            style={{ display: selectedPhoto === OLESYA_GALLERY.length - 1 ? 'none' : 'flex' }}
          >
            <Icon name="ChevronRight" size={20} className="text-white" />
          </button>

          <div className="absolute bottom-6 text-center">
            <p className="text-white/80 text-sm font-medium">{OLESYA_GALLERY[selectedPhoto].caption}</p>
            <p className="text-white/50 text-xs mt-1">{selectedPhoto + 1} / {OLESYA_GALLERY.length}</p>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
};

export default OlesyaProfile;
