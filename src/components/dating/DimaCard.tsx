import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { DIMA_AVATAR } from '@/components/dating/dima-constants';

const DimaCard = () => {
  const navigate = useNavigate();

  const openChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('open-dima-chat'));
  };

  return (
    <div className="h-[460px] group">
      <Card className="w-full h-full rounded-3xl overflow-hidden border-2 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] group-hover:scale-105 flex flex-col transition-all duration-300">
        <div
          className="relative flex-1 overflow-hidden cursor-pointer"
          onClick={() => navigate('/dating/dima-ai')}
        >
          <img
            src={DIMA_AVATAR}
            alt="Дима"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 px-2.5 py-1 text-xs font-semibold shadow-lg flex items-center gap-1">
              <Icon name="Bot" size={12} />
              ИИ
            </Badge>
          </div>

          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Онлайн
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
            <h3 className="text-xl font-bold text-white">Дима, 35</h3>
            <p className="text-white/70 text-sm flex items-center gap-1 mt-0.5">
              <Icon name="MapPin" size={12} />
              Москва
            </p>
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 space-y-2">
          <p className="text-xs text-muted-foreground line-clamp-2">Открыт к общению со всеми на любые темы! Буду рад знакомству!</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={openChat}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl text-xs h-9"
            >
              <Icon name="MessageCircle" size={14} className="mr-1" />
              Написать
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/dating/dima-ai')}
              className="rounded-xl text-xs h-9 px-3 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >
              <Icon name="User" size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DimaCard;