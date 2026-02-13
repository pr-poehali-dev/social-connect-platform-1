import { useState } from 'react';
import { STICKERS, PHOTOS, parseMessageContent } from './constants';
import VoiceBubble from './VoiceBubble';
import Icon from '@/components/ui/icon';

const PhotoBubble = ({ id }: { id: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const photo = PHOTOS[id];
  if (!photo) return null;

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="relative group mt-1 block">
        <img
          src={photo.url}
          alt={photo.caption}
          className="w-48 h-48 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl px-2 py-1.5">
          <p className="text-white text-xs font-medium">{photo.caption}</p>
        </div>
        <div className="absolute top-2 right-2 w-6 h-6 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon name="Maximize2" size={12} className="text-white" />
        </div>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Icon name="X" size={20} className="text-white" />
          </button>
          <img
            src={photo.url}
            alt={photo.caption}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 text-white/80 text-sm font-medium">{photo.caption}</p>
        </div>
      )}
    </>
  );
};

export const renderMessageContent = (content: string) => {
  const parts = parseMessageContent(content);
  const hasOnlySticker = parts.length === 1 && parts[0].type === 'sticker';
  const hasOnlyVoice = parts.length === 1 && parts[0].type === 'voice';
  const hasOnlyPhoto = parts.length === 1 && parts[0].type === 'photo';

  return (
    <div className={hasOnlySticker || hasOnlyVoice || hasOnlyPhoto ? 'flex flex-col' : ''}>
      {parts.map((part, idx) => {
        if (part.type === 'sticker') {
          const sticker = STICKERS[part.id];
          if (!sticker) return null;
          return (
            <img
              key={idx}
              src={sticker.url}
              alt={sticker.label}
              className={`rounded-xl ${hasOnlySticker ? 'w-28 h-28' : 'w-20 h-20 inline-block mt-1'} object-cover`}
            />
          );
        }
        if (part.type === 'voice') {
          return <VoiceBubble key={idx} text={part.text} mood={part.mood} />;
        }
        if (part.type === 'photo') {
          return <PhotoBubble key={idx} id={part.id} />;
        }
        return <span key={idx}>{part.value}</span>;
      })}
    </div>
  );
};

interface StickerPickerProps {
  onSendSticker: (stickerId: string) => void;
}

export const StickerPicker = ({ onSendSticker }: StickerPickerProps) => {
  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shrink-0">
      <div className="grid grid-cols-6 gap-1.5">
        {Object.entries(STICKERS).map(([id, sticker]) => (
          <button
            key={id}
            onClick={() => onSendSticker(id)}
            className="aspect-square rounded-xl overflow-hidden hover:scale-110 transition-transform active:scale-95 border border-slate-100 dark:border-slate-700"
            title={sticker.label}
          >
            <img src={sticker.url} alt={sticker.label} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default renderMessageContent;
