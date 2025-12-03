import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';

interface PixPaymentProps {
  qrcodeImage: string;
  qrcode: string;
}

export default function PixPayment({ qrcodeImage, qrcode }: PixPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const qrcodeImageSrc = useMemo(() => {
    console.log('QR Code Image:', qrcodeImage);
    console.log('QR Code:', qrcode);

    if (!qrcodeImage) return '';

    if (qrcodeImage.startsWith('data:')) {
      return qrcodeImage;
    }

    if (qrcodeImage.startsWith('iVBORw0KGgo') || qrcodeImage.startsWith('/9j/')) {
      return `data:image/png;base64,${qrcodeImage}`;
    }

    return qrcodeImage;
  }, [qrcodeImage]);

  const handleCopy = async () => {
    if (qrcode) {
      try {
        await navigator.clipboard.writeText(qrcode);
        setCopied(true);
        setShowNotification(true);
        setTimeout(() => setCopied(false), 2000);
        setTimeout(() => setShowNotification(false), 2000);
      } catch (error) {
        console.error('Erro ao copiar:', error);
      }
    }
  };

  const handleCodeClick = async () => {
    if (qrcode) {
      try {
        await navigator.clipboard.writeText(qrcode);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
      } catch (error) {
        console.error('Erro ao copiar:', error);
      }
    }
  };

  const formatTime = () => {
    const date = new Date();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col gap-2">
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-out">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <Check size={18} />
            <span className="text-sm font-semibold">Texto foi copiado!</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px) translateX(-50%); }
          10% { opacity: 1; transform: translateY(0) translateX(-50%); }
          90% { opacity: 1; transform: translateY(0) translateX(-50%); }
          100% { opacity: 0; transform: translateY(-10px) translateX(-50%); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 2s ease-in-out;
        }
      `}</style>

      <div className="flex justify-start mb-2 px-4">
        <div className="bg-white rounded-lg shadow-sm p-3 mr-auto max-w-[85%] relative">
          {qrcodeImageSrc && (
            <img
              src={qrcodeImageSrc}
              alt="QR Code"
              className="w-48 h-48 mx-auto"
              onError={(e) => {
                console.error('Erro ao carregar imagem QR Code:', e);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="absolute bottom-1 right-2">
            <span className="text-[11px] text-gray-500">
              {formatTime()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-start mb-2 px-4">
        <div className="bg-white rounded-lg shadow-sm p-3 mr-auto max-w-[85%] relative">
          <div className="flex items-center gap-2">
            <code
              onClick={handleCodeClick}
              className="text-xs break-all flex-1 font-mono cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              title="Clique para copiar"
            >
              {qrcode}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Copiar código"
            >
              {copied ? (
                <Check size={18} className="text-green-600" />
              ) : (
                <Copy size={18} className="text-gray-600" />
              )}
            </button>
          </div>
          <div className="absolute bottom-1 right-2">
            <span className="text-[11px] text-gray-500">
              {formatTime()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
