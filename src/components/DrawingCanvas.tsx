import React, { useRef, useEffect, useState, useCallback } from 'react';

interface DrawingCanvasProps {
  imageSrc: string | null;
  onDrawingChange?: (maskDataUrl: string | null) => void;
  disabled?: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ imageSrc, onDrawingChange, disabled = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null); // Usado para carregar a imagem e obter dimensões naturais
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const draw = useCallback((x: number, y: number) => {
    if (!canvasContext) return;
    canvasContext.lineTo(x, y);
    canvasContext.stroke();
  }, [canvasContext]);

  const getCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect(); // Tamanho e posição do canvas na tela
    const scaleX = canvas.width / rect.width;    // Fator de escala X (resolução real / resolução exibida)
    const scaleY = canvas.height / rect.height;  // Fator de escala Y

    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Ajusta as coordenadas do cliente para as coordenadas do canvas (resolução real)
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled || !canvasContext || !imageLoaded) return;
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    canvasContext.beginPath();
    canvasContext.moveTo(x, y);
  }, [canvasContext, disabled, imageLoaded, getCoordinates]);

  const stopDrawing = useCallback(() => {
    if (!canvasContext) return;
    setIsDrawing(false);
    canvasContext.closePath();
    if (onDrawingChange) {
      onDrawingChange(canvasRef.current?.toDataURL('image/png') || null); // Retorna a máscara em PNG
    }
  }, [canvasContext, onDrawingChange]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled || !canvasContext || !imageLoaded) return;
    const { x, y } = getCoordinates(e);
    draw(x, y);
  }, [isDrawing, disabled, canvasContext, imageLoaded, getCoordinates, draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (canvas && image && imageSrc) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setCanvasContext(ctx);
        
        image.onload = () => {
          // Define a resolução interna do canvas para as dimensões naturais da imagem
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa desenhos anteriores
          
          ctx.strokeStyle = '#FF0000'; // Cor vermelha para o desenho
          ctx.lineWidth = Math.max(20, image.naturalWidth / 50); // Largura da linha responsiva
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          setImageLoaded(true);
        };
        image.src = imageSrc; // Dispara o carregamento da imagem
      }
    } else if (!imageSrc) {
      // Se a imagem for removida, limpa o canvas e reseta o estado
      if (canvas && canvasContext) {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      }
      setImageLoaded(false);
      if (onDrawingChange) {
        onDrawingChange(null);
      }
    }
  }, [imageSrc, canvasContext, onDrawingChange]);

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
          {/* Imagem real, mas oculta, para obter naturalWidth/naturalHeight */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Base para desenho"
            style={{ display: 'none' }} 
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
              touchAction: 'none', // Previne rolagem em dispositivos de toque
              backgroundImage: `url(${imageSrc})`, // Exibe a imagem como background CSS
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          />
          {!disabled && imageLoaded && (
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