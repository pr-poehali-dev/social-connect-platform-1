import { useState, useRef, useEffect, useCallback } from 'react';
import {
  OLESYA_AVATAR,
  AI_URL,
  ANIMATE_URL,
  STICKERS,
  STICKER_REGEX,
  VOICE_REGEX,
  getCachedVideo,
  setCachedVideo,
  type ChatMessage,
  type SpeechRecognitionEvent,
} from './ai-assistant/constants';
import ChatHeader from './ai-assistant/ChatHeader';
import ChatMessages from './ai-assistant/ChatMessages';
import ChatInput from './ai-assistant/ChatInput';

const AiAssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [talkingVideoUrl, setTalkingVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const recognitionRef = useRef<unknown>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Привет! Я Олеся 😊 Чем могу помочь? Можем поболтать, или подскажу что-нибудь по сайту!'
      }]);
    }
  }, [isOpen, messages.length]);

  const generateTalkingHead = useCallback(async (text: string) => {
    if (!voiceEnabled) return;

    const cleanText = text.replace(STICKER_REGEX, '').replace(VOICE_REGEX, '$2').trim();
    if (!cleanText) return;

    const shortText = cleanText.length > 250 ? cleanText.slice(0, 247) + '...' : cleanText;

    const cached = getCachedVideo(shortText);
    if (cached) {
      setTalkingVideoUrl(cached);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsGeneratingVideo(true);
    setTalkingVideoUrl(null);

    try {
      const response = await fetch(ANIMATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: OLESYA_AVATAR,
          text: shortText,
          voice: 'ru-RU-SvetlanaNeural'
        }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error('Failed');

      const data = await response.json();
      if (data.videoUrl && !controller.signal.aborted) {
        setCachedVideo(shortText, data.videoUrl);
        setTalkingVideoUrl(data.videoUrl);
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.log('D-ID animation unavailable');
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [voiceEnabled]);

  const sendMessage = async (text: string, audioUrl?: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed, audioUrl };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setShowStickerPicker(false);

    try {
      const response = await fetch(AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: newMessages.slice(-20).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error('Server error');

      const data = await response.json();
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMsg]);
      generateTalkingHead(data.reply);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Ой, что-то пошло не так... Попробуй ещё раз через минутку 🙈'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendSticker = (stickerId: string) => {
    const sticker = STICKERS[stickerId];
    if (!sticker || isLoading) return;
    setShowStickerPicker(false);
    sendMessage(`[sticker:${stickerId}]`);
  };

  const startListening = () => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new (SpeechRecognition as new () => {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      onresult: (event: SpeechRecognitionEvent) => void;
      onerror: () => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    })();

    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript;
      setIsListening(false);
      sendMessage(result);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop();
      setIsListening(false);
    }
  };

  const startRecording = async () => {
    if (isLoading || isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        finishRecording(url);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new (SpeechRecognition as new () => {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          onresult: (event: SpeechRecognitionEvent) => void;
          onerror: () => void;
          onend: () => void;
          start: () => void;
          stop: () => void;
        })();

        recognition.lang = 'ru-RU';
        recognition.interimResults = false;
        recognition.continuous = true;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = '';
          for (let i = 0; i < Object.keys(event.results).length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            recognitionRef.current = { ...recognition, transcript: transcript.trim() };
          }
        };

        recognition.onerror = () => {};
        recognition.onend = () => {};

        recognitionRef.current = recognition;
        recognition.start();
      }
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (recognitionRef.current && typeof (recognitionRef.current as Record<string, unknown>).stop === 'function') {
      (recognitionRef.current as { stop: () => void }).stop();
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
    setRecordingTime(0);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (recognitionRef.current && typeof (recognitionRef.current as Record<string, unknown>).stop === 'function') {
      (recognitionRef.current as { stop: () => void }).stop();
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  };

  const finishRecording = (audioUrl: string) => {
    const rec = recognitionRef.current as Record<string, unknown> | null;
    const transcript = rec && typeof rec.transcript === 'string' ? rec.transcript : '';
    recognitionRef.current = null;

    const text = transcript || 'голосовое сообщение';
    sendMessage(text, audioUrl);
  };

  const closeTalkingVideo = () => {
    setTalkingVideoUrl(null);
    setIsGeneratingVideo(false);
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 group"
      >
        <div className="relative">
          <img
            src={OLESYA_AVATAR}
            alt="Олеся"
            className="w-14 h-14 rounded-full border-3 border-pink-400 shadow-lg object-cover group-hover:scale-110 transition-transform"
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow">
            Олеся
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 z-50 w-full sm:w-96 h-[100dvh] sm:h-[550px] flex flex-col bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <ChatHeader
        isLoading={isLoading}
        isGeneratingVideo={isGeneratingVideo}
        talkingVideoUrl={talkingVideoUrl}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        onClose={() => { setIsOpen(false); closeTalkingVideo(); }}
        onCloseTalkingVideo={closeTalkingVideo}
        onVideoEnded={() => setTalkingVideoUrl(null)}
      />

      <ChatMessages
        messages={messages}
        isLoading={isLoading}
      />

      <ChatInput
        input={input}
        isLoading={isLoading}
        isListening={isListening}
        isRecording={isRecording}
        recordingTime={recordingTime}
        showStickerPicker={showStickerPicker}
        onInputChange={setInput}
        onSend={(text) => sendMessage(text)}
        onSendSticker={sendSticker}
        onStartListening={startListening}
        onStopListening={stopListening}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onCancelRecording={cancelRecording}
        onToggleStickerPicker={() => setShowStickerPicker(!showStickerPicker)}
      />
    </div>
  );
};

export default AiAssistantChat;
