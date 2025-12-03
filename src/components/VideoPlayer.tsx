import { useRef, useState, useEffect } from 'react';
import { Maximize2, AlertCircle, RefreshCw } from 'lucide-react';
import { VIDEO_CONFIG, MODEL_NAME } from '../config/videos';

interface VideoPlayerProps {
  onVideoStart: () => void;
  onFreeTimeExpired: () => void;
  onVideoEnded: () => void;
  isPremium: boolean;
  isPrivateRoom: boolean;
  isFreeTimeBlocked: boolean;
  onReloadPayment?: () => void;
  initialProgress?: number;
  onProgressUpdate?: (progress: number, isPrivate: boolean) => void;
  isLoadingSession?: boolean;
}

export default function VideoPlayer({
  onVideoStart,
  onFreeTimeExpired,
  onVideoEnded,
  isPremium,
  isPrivateRoom,
  isFreeTimeBlocked,
  onReloadPayment,
  initialProgress = 0,
  onProgressUpdate,
  isLoadingSession = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPrivateBanner, setShowPrivateBanner] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasSetInitialProgress, setHasSetInitialProgress] = useState(false);
  const [showBlockScreen, setShowBlockScreen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedProgressRef = useRef<number>(0);

  useEffect(() => {
    if (isFreeTimeBlocked && !isPremium) {
      console.log('[VideoPlayer] Usuario ja foi bloqueado, mostrando tela de bloqueio');
      setShowBlockScreen(true);
      if (videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }

    if (!isPremium && !isPrivateRoom && !isLoadingSession && !isFreeTimeBlocked) {
      console.log('[VideoPlayer] Iniciando timer de tempo gratuito:', VIDEO_CONFIG.mainVideo.freeTimeSeconds, 'segundos');

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        handleExpireTimer();
      }, VIDEO_CONFIG.mainVideo.freeTimeSeconds * 1000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  }, [isPremium, isPrivateRoom, isLoadingSession, isFreeTimeBlocked]);

  useEffect(() => {
    if (isPremium && showBlockScreen) {
      console.log('[VideoPlayer] Usuario virou premium, desbloqueando video');
      setShowBlockScreen(false);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPremium, showBlockScreen]);

  useEffect(() => {
    if (isPrivateRoom) {
      setShowPrivateBanner(true);
      setHasSetInitialProgress(false);
    }
  }, [isPrivateRoom]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleBeforeUnload = () => {
      if (videoRef.current && onProgressUpdate) {
        const currentTime = videoRef.current.currentTime;
        onProgressUpdate(currentTime, isPrivateRoom);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (progressUpdateTimerRef.current) {
        clearTimeout(progressUpdateTimerRef.current);
      }
    };
  }, [isPrivateRoom, onProgressUpdate]);

  const handlePlay = () => {
    onVideoStart();
    if (showBlockScreen && !isPremium && !isPrivateRoom) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      if (initialProgress > 0 && !hasSetInitialProgress) {
        console.log('[VideoPlayer] Restaurando progresso para:', initialProgress, 'segundos');
        videoRef.current.currentTime = initialProgress;
        setHasSetInitialProgress(true);
      }
      videoRef.current.play().catch(() => {
        console.log('Autoplay bloqueado pelo navegador');
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && onProgressUpdate) {
      const currentTime = videoRef.current.currentTime;

      if (progressUpdateTimerRef.current) {
        clearTimeout(progressUpdateTimerRef.current);
      }

      progressUpdateTimerRef.current = setTimeout(() => {
        if (Math.abs(currentTime - lastSavedProgressRef.current) >= 1) {
          lastSavedProgressRef.current = currentTime;
          onProgressUpdate(currentTime, isPrivateRoom);
        }
      }, 500);
    }
  };

  const handleVideoEnded = () => {
    if (!isPrivateRoom && isPremium) {
      onVideoEnded();
    }
  };

  const handlePause = () => {
    if (videoRef.current && onProgressUpdate) {
      const currentTime = videoRef.current.currentTime;
      onProgressUpdate(currentTime, isPrivateRoom);
    }
  };

  const handleExpireTimer = () => {
    console.log('[VideoPlayer] Timer disparado - tempo gratuito expirado!');
    setShowBlockScreen(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onFreeTimeExpired();
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const videoUrl = isPrivateRoom
    ? VIDEO_CONFIG.privateRoomVideo.url
    : VIDEO_CONFIG.mainVideo.url;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl border border-pink-500/20">
      {showPrivateBanner && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-purple-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          SALA PRIVADA
        </div>
      )}

      {!isPrivateRoom && (
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 bg-red-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full font-bold flex items-center gap-1 sm:gap-2 shadow-lg animate-pulse text-xs sm:text-base">
          <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-white"></span>
          </span>
          AO VIVO
        </div>
      )}

      <div className="hidden lg:block absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold">
        <p className="text-sm text-pink-400">Modelo Online</p>
        <p className="text-xs text-gray-400">Bem-vindo ao show</p>
      </div>

      <button
        onClick={toggleFullscreen}
        className="lg:hidden absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/90 transition-colors"
        aria-label="Tela cheia"
      >
        <Maximize2 className="w-5 h-5" />
      </button>

      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleVideoEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        preload="auto"
        controlsList="nodownload"
        crossOrigin="anonymous"
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23000'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='%23ff1b6d' text-anchor='middle' dominant-baseline='middle'%3ECarregando...%3C/text%3E%3C/svg%3E"
        key={videoUrl}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {showBlockScreen && !isPremium && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-30 rounded-xl p-4">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-3xl font-bold text-white mb-2">
              Tempo Gratuito Encerrado
            </h3>
            <p className="text-gray-300 mb-4 sm:mb-8 text-sm sm:text-lg">
              Você assistiu {VIDEO_CONFIG.mainVideo.freeTimeSeconds} segundos grátis. Faça um pagamento para continuar assistindo.
            </p>
            <button
              onClick={onReloadPayment}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              Recarregar
            </button>
          </div>
        </div>
      )}

      <div className="hidden lg:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
        <h2 className="text-2xl font-bold text-white mb-1">
          {isPrivateRoom ? `Sala Privada com ${MODEL_NAME}` : 'Show Exclusivo'}
        </h2>
        <p className="text-pink-300">
          {isPrivateRoom
            ? 'Aproveite seu momento exclusivo'
            : 'Aproveite o momento com a modelo'}
        </p>
      </div>
    </div>
  );
}
