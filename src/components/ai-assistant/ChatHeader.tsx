import { useRef } from 'react';
import Icon from '@/components/ui/icon';
import { OLESYA_AVATAR } from './constants';

interface ChatHeaderProps {
  isLoading: boolean;
  isGeneratingVideo: boolean;
  talkingVideoUrl: string | null;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onClose: () => void;
  onCloseTalkingVideo: () => void;
  onVideoEnded: () => void;
}

const ChatHeader = ({
  isLoading,
  isGeneratingVideo,
  talkingVideoUrl,
  voiceEnabled,
  onToggleVoice,
  onClose,
  onCloseTalkingVideo,
  onVideoEnded,
}: ChatHeaderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white shrink-0">
        <div className="relative">
          <img src={OLESYA_AVATAR} alt="Олеся" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
          {isGeneratingVideo && (
            <div className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping" />
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-pink-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Олеся</p>
          <p className="text-xs text-white/70">
            {isLoading ? 'печатает...' : isGeneratingVideo ? 'оживает...' : talkingVideoUrl ? 'говорит...' : 'онлайн'}
          </p>
        </div>
        <button
          onClick={onToggleVoice}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          title={voiceEnabled ? 'Выключить анимацию' : 'Включить анимацию'}
        >
          <Icon name={voiceEnabled ? "Video" : "VideoOff"} size={18} />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <Icon name="X" size={18} />
        </button>
      </div>

      {talkingVideoUrl && (
        <div className="flex justify-center py-2 animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-pink-400/50 bg-black">
            <video
              ref={videoRef}
              src={talkingVideoUrl}
              autoPlay
              playsInline
              className="w-52 h-52 object-cover"
              onEnded={onVideoEnded}
              onError={onVideoEnded}
            />
            <button
              onClick={onCloseTalkingVideo}
              className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <Icon name="X" size={12} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
              <p className="text-white text-[10px] font-medium">Олеся говорит...</p>
            </div>
          </div>
        </div>
      )}

      {isGeneratingVideo && !talkingVideoUrl && (
        <div className="flex justify-center py-2 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 px-3 py-1.5 rounded-full text-xs">
            <div className="w-3 h-3 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
            Олеся оживает...
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;
