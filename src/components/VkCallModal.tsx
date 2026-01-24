import { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface VkCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId?: string;
  recipientName: string;
  callType: 'audio' | 'video';
}

export function VkCallModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  callType,
}: VkCallModalProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    const initVkBridge = async () => {
      try {
        await bridge.send('VKWebAppInit');
        setIsInitialized(true);
      } catch (error) {
        console.error('VK Bridge init error:', error);
        toast({
          title: 'Ошибка инициализации',
          description: 'Не удалось подключиться к VK',
          variant: 'destructive',
        });
      }
    };

    if (isOpen) {
      initVkBridge();
    }
  }, [isOpen, toast]);

  const startCall = async () => {
    if (!isInitialized) {
      toast({
        title: 'VK не инициализирован',
        description: 'Попробуйте перезагрузить страницу',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    setCallStatus('calling');

    try {
      const result = await bridge.send('VKWebAppCallAPIMethod', {
        method: 'messages.startCall',
        params: {
          user_id: recipientId,
          video: callType === 'video' ? 1 : 0,
          v: '5.131',
        },
      });

      if (result.response) {
        setCallStatus('connected');
        toast({
          title: 'Звонок начат',
          description: `${callType === 'video' ? 'Видеозвонок' : 'Аудиозвонок'} с ${recipientName}`,
        });
      }
    } catch (error: any) {
      console.error('Call error:', error);
      setCallStatus('ended');
      
      if (error.error_data?.error_code === 4) {
        toast({
          title: 'Нет доступа',
          description: 'Для совершения звонков требуется авторизация через VK',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Ошибка звонка',
          description: 'Не удалось начать звонок. Попробуйте через приложение VK',
          variant: 'destructive',
        });
      }
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } finally {
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    setCallStatus('ended');
    toast({
      title: 'Звонок завершен',
      description: 'Звонок успешно завершен',
    });
    setTimeout(() => {
      onClose();
      setCallStatus('idle');
    }, 1500);
  };

  useEffect(() => {
    if (isOpen && isInitialized && callStatus === 'idle') {
      startCall();
    }
  }, [isOpen, isInitialized]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {callType === 'video' ? 'Видеозвонок' : 'Аудиозвонок'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-8 space-y-6">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${
              callType === 'video' 
                ? 'from-blue-500 to-blue-600' 
                : 'from-green-500 to-green-600'
            } flex items-center justify-center ${
              callStatus === 'calling' ? 'animate-pulse' : ''
            }`}>
              <Icon 
                name={callType === 'video' ? 'Video' : 'Phone'} 
                size={40} 
                className="text-white" 
              />
            </div>
            {callStatus === 'calling' && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping" />
            )}
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold mb-1">{recipientName}</h3>
            <p className="text-sm text-muted-foreground">
              {callStatus === 'calling' && 'Соединение...'}
              {callStatus === 'connected' && 'Звонок активен'}
              {callStatus === 'ended' && 'Звонок завершен'}
              {callStatus === 'idle' && 'Подготовка...'}
            </p>
          </div>

          <div className="flex gap-4">
            {callStatus === 'connected' && (
              <Button
                size="lg"
                variant="destructive"
                className="rounded-full w-16 h-16"
                onClick={endCall}
              >
                <Icon name="PhoneOff" size={24} />
              </Button>
            )}
            
            {(callStatus === 'calling' || callStatus === 'idle') && (
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16"
                onClick={onClose}
                disabled={isConnecting}
              >
                <Icon name="X" size={24} />
              </Button>
            )}
          </div>

          {!recipientId && (
            <div className="text-center space-y-2 p-4 bg-yellow-50 rounded-lg">
              <Icon name="AlertCircle" size={24} className="mx-auto text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Для совершения звонков необходима интеграция с VK ID пользователя
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://vk.com/call', '_blank')}
                className="mt-2"
              >
                Открыть VK звонки
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
