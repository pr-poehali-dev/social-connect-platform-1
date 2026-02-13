import { useState, useEffect } from 'react';
import { OLESYA_AVATAR } from './ai-assistant/constants';
import { DIMA_AVATAR } from './dima-assistant/constants';
import Icon from '@/components/ui/icon';

const ChatSwitcher = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [olesyaOpen, setOlesyaOpen] = useState(false);
  const [dimaOpen, setDimaOpen] = useState(false);

  useEffect(() => {
    const onOlesyaOpen = () => setOlesyaOpen(true);
    const onOlesyaClose = () => setOlesyaOpen(false);
    const onDimaOpen = () => setDimaOpen(true);
    const onDimaClose = () => setDimaOpen(false);

    window.addEventListener('olesya-chat-opened', onOlesyaOpen);
    window.addEventListener('olesya-chat-closed', onOlesyaClose);
    window.addEventListener('dima-chat-opened', onDimaOpen);
    window.addEventListener('dima-chat-closed', onDimaClose);
    return () => {
      window.removeEventListener('olesya-chat-opened', onOlesyaOpen);
      window.removeEventListener('olesya-chat-closed', onOlesyaClose);
      window.removeEventListener('dima-chat-opened', onDimaOpen);
      window.removeEventListener('dima-chat-closed', onDimaClose);
    };
  }, []);

  if (olesyaOpen || dimaOpen) return null;

  const openOlesya = () => {
    setIsExpanded(false);
    window.dispatchEvent(new CustomEvent('open-olesya-chat'));
  };

  const openDima = () => {
    setIsExpanded(false);
    window.dispatchEvent(new CustomEvent('open-dima-chat'));
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse items-end gap-2">
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <button onClick={openOlesya} className="group flex items-center gap-2">
            <span className="bg-white dark:bg-slate-800 text-sm font-medium px-3 py-1.5 rounded-full shadow-lg border border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Олеся
            </span>
            <div className="relative">
              <img src={OLESYA_AVATAR} alt="Олеся" className="w-12 h-12 rounded-full border-2 border-pink-400 shadow-lg object-cover group-hover:scale-110 transition-transform" />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
          </button>
          <button onClick={openDima} className="group flex items-center gap-2">
            <span className="bg-white dark:bg-slate-800 text-sm font-medium px-3 py-1.5 rounded-full shadow-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Дима
            </span>
            <div className="relative">
              <img src={DIMA_AVATAR} alt="Дима" className="w-12 h-12 rounded-full border-2 border-blue-400 shadow-lg object-cover group-hover:scale-110 transition-transform" />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
          </button>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative group"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
          {isExpanded ? (
            <Icon name="X" size={22} className="text-white" />
          ) : (
            <div className="flex -space-x-2">
              <img src={OLESYA_AVATAR} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
              <img src={DIMA_AVATAR} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
            </div>
          )}
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        {!isExpanded && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow">
            Чаты ИИ
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatSwitcher;
