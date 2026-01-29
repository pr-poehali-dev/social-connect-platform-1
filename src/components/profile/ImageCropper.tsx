import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface ImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const ImageCropper = ({ imageFile, onCropComplete, onCancel }: ImageCropperProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageSrc(e.target?.result as string);
        const minSize = Math.min(img.width, img.height);
        setImageSize({ width: img.width, height: img.height });
        setCrop({
          x: (img.width - minSize) / 2,
          y: (img.height - minSize) / 2,
          size: minSize
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, imageSize.width - crop.size));
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, imageSize.height - crop.size));
    setCrop({ ...crop, x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const outputSize = Math.min(crop.size, 2048);
    canvas.width = outputSize;
    canvas.height = outputSize;

    const img = imageRef.current;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      img,
      crop.x, crop.y, crop.size, crop.size,
      0, 0, outputSize, outputSize
    );

    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, 'image/jpeg', 0.95);
  };

  const scale = containerRef.current 
    ? Math.min(500 / imageSize.width, 500 / imageSize.height, 1)
    : 1;

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Обрезать фото 1:1</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div 
            ref={containerRef}
            className="relative overflow-hidden bg-muted rounded-lg mx-auto"
            style={{ 
              width: imageSize.width * scale,
              height: imageSize.height * scale,
              maxWidth: 500,
              maxHeight: 500
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {imageSrc && (
              <>
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  className="block w-full h-full object-contain"
                  style={{ opacity: 0.5 }}
                />
                <div
                  className="absolute border-4 border-primary cursor-move"
                  style={{
                    left: crop.x * scale,
                    top: crop.y * scale,
                    width: crop.size * scale,
                    height: crop.size * scale,
                    backgroundImage: `url(${imageSrc})`,
                    backgroundSize: `${imageSize.width * scale}px ${imageSize.height * scale}px`,
                    backgroundPosition: `-${crop.x * scale}px -${crop.y * scale}px`
                  }}
                  onMouseDown={handleMouseDown}
                />
              </>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <Icon name="Move" size={16} className="inline mr-2" />
            Перетащите рамку, чтобы выбрать область (до 2048×2048 px)
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button onClick={handleCrop}>
            <Icon name="Check" size={18} className="mr-2" />
            Обрезать и сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;