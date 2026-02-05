import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

interface VoiceAssistantProps {
  onResults: (results: any[], query: string, explanation: string) => void;
}

const VoiceAssistant = ({ onResults }: VoiceAssistantProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Не удалось получить доступ к микрофону');
      console.error('Microphone error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Конвертируем в base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        const response = await fetch('https://functions.poehali.dev/b193ada3-6fc7-4a7d-aaf0-1f33cc4fa615', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audio: base64Audio })
        });

        if (!response.ok) {
          throw new Error('Ошибка обработки запроса');
        }

        const data = await response.json();
        onResults(data.results, data.query, data.explanation);
      };
    } catch (err) {
      setError('Не удалось обработать голосовой запрос');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border-2 border-purple-300 dark:border-purple-700">
      <div className="flex items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`flex items-center justify-center w-16 h-16 rounded-full transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          ) : (
            <Icon name={isRecording ? 'Square' : 'Mic'} size={32} className="text-white" />
          )}
        </button>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Голосовой поиск</h3>
          <p className="text-sm text-muted-foreground">
            {isRecording
              ? 'Говорите... (нажмите еще раз для остановки)'
              : isProcessing
              ? 'Обрабатываю запрос...'
              : 'Нажмите на микрофон и скажите что вы ищете'}
          </p>
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
      </div>
      
      <div className="mt-3 text-xs text-muted-foreground">
        <p>Примеры: "найди девушек из Москвы", "покажи парней 25-30 лет", "кто интересуется спортом"</p>
      </div>
    </Card>
  );
};

export default VoiceAssistant;
