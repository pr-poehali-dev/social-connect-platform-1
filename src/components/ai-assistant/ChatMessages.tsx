import { useRef, useEffect } from 'react';
import { OLESYA_AVATAR, parseMessageContent, type ChatMessage } from './constants';
import { renderMessageContent } from './MessageContent';
import UserVoiceBubble from './UserVoiceBubble';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-950">
      {messages.map((msg, i) => {
        const isUserVoice = msg.role === 'user' && msg.audioUrl;
        const parts = parseMessageContent(msg.content);
        const isOnlySticker = parts.length === 1 && parts[0].type === 'sticker';
        const isOnlyVoice = parts.length === 1 && parts[0].type === 'voice';
        const isSpecial = isOnlySticker || isOnlyVoice || isUserVoice;

        return (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <img src={OLESYA_AVATAR} alt="Олеся" className="w-8 h-8 rounded-full object-cover shrink-0 mt-1" />
            )}
            <div className={`max-w-[80%] ${isSpecial ? 'p-1' : 'px-3 py-2'} rounded-2xl text-sm leading-relaxed ${
              isOnlySticker
                ? 'bg-transparent border-none shadow-none'
                : isOnlyVoice
                  ? 'bg-white dark:bg-slate-800 rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700 px-2 py-2'
                  : isUserVoice
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm px-3 py-2'
                    : msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 text-foreground rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700'
            }`}>
              {isUserVoice ? (
                <UserVoiceBubble audioUrl={msg.audioUrl!} />
              ) : (
                renderMessageContent(msg.content)
              )}
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex gap-2">
          <img src={OLESYA_AVATAR} alt="Олеся" className="w-8 h-8 rounded-full object-cover shrink-0 mt-1" />
          <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
