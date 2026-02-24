import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { DIMA_AVATAR, DIMA_PHOTOS, DIMA_INTERESTS } from '@/components/dating/dima-constants';

const DimaProfile = () => {
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('open-dima-chat'));
  };

  const dimaProfile = {
    image: DIMA_AVATAR,
    name: 'Алексей',
    age: 33,
    city: 'Москва',
    isOnline: true,
    about: 'Привет! Я Алексей, 33 года, Москва. Предприниматель в IT, спортсмен и гитарист. Бисексуал — мне интересны люди, а не их пол. Открыт к любому общению без табу. Люблю горы, готовку и откровенные разговоры. Пиши — не пожалеешь 😏',
    height: 183,
    bodyType: 'athletic',
    dating_goal: 'casual',
    marital_status: 'not_married',
    gender: 'male',
    interests: DIMA_INTERESTS,
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-0 relative">
      <div className="fixed inset-0 bg-background" />
      <div className="relative z-10">
        <Navigation />

        <div className="max-w-4xl mx-auto lg:pt-20 pt-16">
          <div className="grid md:grid-cols-[300px_1fr] gap-0 md:gap-6">

            {/* Sidebar */}
            <div className="md:sticky md:top-20 h-fit">
              <div className="relative md:rounded-3xl overflow-hidden">
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden">
                  <img
                    src={DIMA_AVATAR}
                    alt="Алексей"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 md:-left-16 bg-black/30 hover:bg-black/50 text-white rounded-full"
                  onClick={() => navigate(-1)}
                >
                  <Icon name="ArrowLeft" size={24} />
                </Button>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 px-3 py-1.5 text-sm font-semibold shadow-lg flex items-center gap-1.5">
                    <Icon name="Bot" size={14} />
                    ИИ
                  </Badge>
                </div>
              </div>

              <div className="hidden md:block mt-4 px-0">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={openChat}
                    className="w-full rounded-xl h-12 text-base font-semibold"
                  >
                    <Icon name="MessageCircle" size={20} className="mr-2" />
                    Написать
                  </Button>
                  <Button
                    onClick={openChat}
                    variant="outline"
                    className="w-full rounded-xl h-12 text-base font-semibold border-blue-300 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  >
                    <Icon name="Mic" size={20} className="mr-2" />
                    Голосовое
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 md:px-6 md:py-0 py-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">{dimaProfile.name}</h1>
                    <span className="text-xl md:text-2xl text-muted-foreground">{dimaProfile.age}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Онлайн</span>
                  </div>
                </div>
              </div>

              {/* Mobile actions */}
              <div className="md:hidden">
                <div className="flex gap-3">
                  <Button
                    onClick={openChat}
                    className="flex-1 rounded-xl h-12 text-base font-semibold"
                  >
                    <Icon name="MessageCircle" size={20} className="mr-2" />
                    Написать
                  </Button>
                  <Button
                    onClick={openChat}
                    variant="outline"
                    className="rounded-xl h-12 px-4 border-blue-300 text-blue-500 hover:bg-blue-50"
                  >
                    <Icon name="Mic" size={20} />
                  </Button>
                </div>
              </div>

              {/* AI notice */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="Bot" size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm">ИИ-собеседник</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Алексей — виртуальный собеседник на базе ИИ. Всегда онлайн, поддержит любой разговор 18+, отправит голосовые и фото.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <Card className="p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Icon name="Info" size={20} />
                  Информация
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon name="MapPin" size={18} />
                    <span>Москва</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon name="Ruler" size={18} />
                    <span>Рост: 183 см</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon name="User" size={18} />
                    <span>Телосложение: Спортивное</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon name="Target" size={18} />
                    <span>Цель знакомства: Неформальное общение</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon name="Heart" size={18} />
                    <span>Семейное положение: Не женат</span>
                  </div>
                </div>
              </Card>

              {/* About */}
              <Card className="p-6 rounded-2xl">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Icon name="FileText" size={20} />
                  О себе
                </h2>
                <p className="text-muted-foreground leading-relaxed">{dimaProfile.about}</p>
              </Card>

              {/* Interests */}
              <Card className="p-6 rounded-2xl">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Heart" size={20} />
                  Интересы
                </h2>
                <div className="flex flex-wrap gap-2">
                  {DIMA_INTERESTS.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Photos */}
              <Card className="p-6 rounded-2xl">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Camera" size={20} />
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
              </Card>

              {/* Skills */}
              <Card className="p-6 rounded-2xl">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Sparkles" size={20} />
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
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon name={item.icon} size={16} className="text-primary" />
                      </div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default DimaProfile;
