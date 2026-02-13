import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { DIMA_AVATAR, DIMA_PHOTOS, DIMA_INTERESTS } from '@/components/dating/dima-constants';

const DimaProfile = () => {
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('open-dima-chat'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20 pt-20">
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
              src={DIMA_AVATAR}
              alt="Дима"
              className="w-full h-80 object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 px-3 py-1.5 text-sm font-semibold shadow-lg flex items-center gap-1.5">
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
              <h1 className="text-3xl font-bold text-white">Дима, 35</h1>
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
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl h-12 text-base font-semibold"
              >
                <Icon name="MessageCircle" size={20} className="mr-2" />
                Написать
              </Button>
              <Button
                variant="outline"
                onClick={openChat}
                className="rounded-xl h-12 px-4 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <Icon name="Mic" size={20} className="text-blue-500" />
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Bot" size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm">ИИ-собеседник</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Дима — виртуальный собеседник на базе ИИ. Он всегда онлайн, поддержит разговор на любую тему,
                    отправит голосовые и фото. Отлично подходит для общения и приятного времяпровождения!
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
                Привет! Я Дима, 35 лет, живу в Москве. Предприниматель, занимаюсь IT.
                В свободное время хожу в горы, готовлю итальянскую кухню и играю на гитаре.
                Ценю искренность и хорошее чувство юмора. Давай пообщаемся!
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Icon name="Heart" size={18} />
                Интересы
              </h2>
              <div className="flex flex-wrap gap-2">
                {DIMA_INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="px-3 py-1.5 rounded-full text-sm bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-0"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Рост</p>
                <p className="font-semibold">183 см</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Телосложение</p>
                <p className="font-semibold">Спортивное</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Цель</p>
                <p className="font-semibold">Общение</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Статус</p>
                <p className="font-semibold">Не женат</p>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Icon name="Camera" size={18} />
                Фотографии
                <span className="text-sm font-normal text-muted-foreground">({DIMA_PHOTOS.length})</span>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {DIMA_PHOTOS.map((photo, idx) => (
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
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                      <Icon name={item.icon} size={16} className="text-blue-500" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {selectedPhoto !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setSelectedPhoto(null)}
          >
            <Icon name="X" size={28} />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : DIMA_PHOTOS.length - 1);
            }}
          >
            <Icon name="ChevronLeft" size={36} />
          </button>

          <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={DIMA_PHOTOS[selectedPhoto].url}
              alt={DIMA_PHOTOS[selectedPhoto].caption}
              className="w-full rounded-2xl"
            />
            <p className="text-white/80 text-center mt-3 text-sm">
              {DIMA_PHOTOS[selectedPhoto].caption} ({selectedPhoto + 1}/{DIMA_PHOTOS.length})
            </p>
          </div>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto(selectedPhoto < DIMA_PHOTOS.length - 1 ? selectedPhoto + 1 : 0);
            }}
          >
            <Icon name="ChevronRight" size={36} />
          </button>
        </div>
      )}

      <Navigation />
    </div>
  );
};

export default DimaProfile;