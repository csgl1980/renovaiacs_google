import React, { useRef, useEffect, useState, useCallback } from 'react';

interface DrawingCanvasProps {
  imageSrc: string | null;
  onDrawingChange?: (maskDataUrl: string | null) => void;
  disabled?: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ imageSrc, onDrawingChange, disabled = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);

  const draw = useCallback((x: number, y: number) => {
    if (!canvasContext) return;
    canvasContext.lineTo(x, y);
    canvasContext.stroke();
  }, [canvasContext]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled || !canvasContext) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    canvasContext.beginPath();
    canvasContext.moveTo(x, y);
  }, [canvasContext, disabled]);

  const stopDrawing = useCallback(() => {
    if (!canvasContext) return;
    setIsDrawing(false);
    canvasContext.closePath();
    if (onDrawingChange) {
      onDrawingChange(canvasRef.current?.toDataURL() || null);
    }
  }, [canvasContext, onDrawingChange]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled || !canvasContext) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    draw(x, y);
  }, [isDrawing, disabled, canvasContext, draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (canvas && image && imageSrc) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setCanvasContext(ctx);
        
        // Ensure canvas matches image dimensions
        image.onload = () => {
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
          
          ctx.strokeStyle = '#FF0000'; // Red color for drawing
          ctx.lineWidth = 20; // Thicker line for mask
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
        };
        image.src = imageSrc; // Trigger image load
      }
    }
  }, [imageSrc]);

  const clearDrawing = useCallback(() => {
    if (canvasContext && canvasRef.current) {
      canvasContext.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (onDrawingChange) {
        onDrawingChange(null);
      }
    }
  }, [canvasContext, onDrawingChange]);

  return (
    <div className="relative w-full aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
      {imageSrc ? (
        <>
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Base para desenho"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ visibility: 'hidden' }} // Hidden, but used for dimensions
          />
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full object-contain ${disabled ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={onMouseMove}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            onTouchMove={onMouseMove}
            style={{
              touchAction: 'none', // Prevent scrolling on touch devices
              backgroundImage: `url(${imageSrc})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          />
          {!disabled && (
            <button
              onClick={clearDrawing}
              className="absolute bottom-4 right-4 bg-white text-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors text-sm"
              aria-label="Limpar desenho"
            >
              Limpar Desenho
            </button>
          )}
        </>
      ) : (
        <span className="text-gray-500">Envie uma imagem para começar a desenhar.</span>
      )}
    </div>
  );
};

export default DrawingCanvas;