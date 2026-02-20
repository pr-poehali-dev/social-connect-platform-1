import { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface TopAd {
  id: number;
  name: string;
  age: number;
  message: string;
  image: string;
}

interface TopAdsCarouselProps {
  ads: TopAd[];
}

const TopAdsCarousel = ({ ads = [] }: TopAdsCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    const scrollSpeed = 1;
    let animationFrameId: number;

    const autoScroll = () => {
      if (scrollContainer && !isPaused) {
        scrollContainer.scrollLeft += scrollSpeed;
        
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPaused]);

  return (
    <div className="mb-12">
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 scroll-smooth custom-scrollbar"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <Card className="flex-shrink-0 w-40 rounded-3xl border-2 border-dashed border-primary hover:border-solid transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[140px]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-2 transition-transform hover:scale-110">
              <Icon name="Plus" size={24} className="text-white" />
            </div>
            <p className="text-xs font-semibold text-center">Разместить объявление</p>
          </CardContent>
        </Card>

        {ads.map((ad) => (
          <Card key={ad.id} className="flex-shrink-0 w-40 rounded-3xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer hover:scale-110 hover:-translate-y-2 hover:border-orange-500">
            <div className="relative h-40 overflow-hidden group">
              <img
                src={ad.image}
                alt={ad.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-2 py-0.5 text-xs shadow-lg">
                <Icon name="Zap" size={10} className="mr-1" />
                ТОП
              </Badge>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <CardContent className="p-3">
              <h3 className="font-bold text-sm mb-0.5">{ad.name}, {ad.age}</h3>
              <p className="text-xs text-muted-foreground line-clamp-3 leading-tight">
                {ad.message}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TopAdsCarousel;