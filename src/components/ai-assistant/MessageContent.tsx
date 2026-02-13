import { STICKERS, parseMessageContent } from './constants';
import VoiceBubble from './VoiceBubble';

export const renderMessageContent = (content: string) => {
  const parts = parseMessageContent(content);
  const hasOnlySticker = parts.length === 1 && parts[0].type === 'sticker';
  const hasOnlyVoice = parts.length === 1 && parts[0].type === 'voice';

  return (
    <div className={hasOnlySticker || hasOnlyVoice ? 'flex flex-col' : ''}>
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
          return <VoiceBubble key={idx} text={part.text} />;
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
