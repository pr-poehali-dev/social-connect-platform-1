import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const VoiceAssistantModal = ({ isOpen, onOpenChange }: VoiceAssistantModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [query, setQuery] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      setError(null);
      setResults(null);
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
        setResults(data.results);
        setQuery(data.query);
      };
    } catch (err) {
      setError('Не удалось обработать голосовой запрос');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewProfile = (userId: number) => {
    onOpenChange(false);
    navigate(`/profile/${userId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Mic" size={24} className="text-purple-500" />
            Голосовой помощник
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 py-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`flex items-center justify-center w-20 h-20 rounded-full transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
              ) : (
                <Icon name={isRecording ? 'Square' : 'Mic'} size={40} className="text-white" />
              )}
            </button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isRecording
                  ? 'Говорите... (нажмите еще раз для остановки)'
                  : isProcessing
                  ? 'Обрабатываю запрос...'
                  : 'Нажмите на микрофон и скажите что ищете'}
              </p>
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <p className="font-medium mb-1">Примеры команд:</p>
            <ul className="space-y-1">
              <li>• "найди девушек из Москвы"</li>
              <li>• "покажи парней 25-30 лет"</li>
              <li>• "кто интересуется спортом"</li>
            </ul>
          </div>

          {query && results && (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium">Ваш запрос: "{query}"</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Найдено: {results.length} {results.length === 1 ? 'человек' : 'людей'}
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.map((profile) => (
                  <div
                    key={profile.id}
                    onClick={() => handleViewProfile(profile.user_id)}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border hover:border-purple-500 cursor-pointer transition-colors"
                  >
                    <img
                      src={profile.avatar_url || 'https://via.placeholder.com/48'}
                      alt={profile.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{profile.name}, {profile.age}</p>
                      <p className="text-sm text-muted-foreground truncate">{profile.city}</p>
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceAssistantModal;
