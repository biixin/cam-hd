import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Mic, MicOff, Video, Phone } from 'lucide-react';
import { chatConfig } from '../config';

interface CallModalProps {
  onClose: () => void;
}

export default function CallModal({ onClose }: CallModalProps) {
  const [callTime, setCallTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=som-test.mp3&version_id=null');
    audio.loop = true;
    audio.play().catch(err => console.error('Erro ao tocar áudio:', err));
    audioRef.current = audio;

    const interval = setInterval(() => {
      setCallTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed w-screen h-screen flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url("${chatConfig.attendantImage}")`,
        backgroundSize: 'contain',
        backgroundPosition: 'center'
      }}
    >
      <div className="px-4 py-3 flex justify-between items-center" style={{ height: '60px' }}>
        <button
          onClick={onClose}
          style={{ backgroundColor: '#1F2937' }}
          className="w-10 h-10 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
        >
          <svg style={{ width: '25px', height: '25px' }} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="none">
            <polyline points="244 400 100 256 244 112" style={{ stroke: '#ffffff', strokeLinecap: 'square', strokeMiterlimit: 10, strokeWidth: '48px' }} />
            <line x1="120" y1="256" x2="412" y2="256" style={{ stroke: '#ffffff', strokeLinecap: 'square', strokeMiterlimit: 10, strokeWidth: '48px' }} />
          </svg>
        </button>

        <div className="text-white text-center">
          <div className="font-semibold text-lg">{chatConfig.attendantName}</div>
          <div className="text-sm text-gray-300">Ligando...</div>
        </div>

        <button style={{ backgroundColor: '#1F2937' }} className="w-10 h-10 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors">
          <img
            src="https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=adicionar-amig-png.png&version_id=null"
            alt="Add friend"
            width="23"
            height="23"
          />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div className="relative z-10">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-2xl border-4 border-white/20">
            <span className="text-7xl font-bold text-white">D</span>
          </div>
          <div className="text-white text-center mt-6">
            <div className="text-lg font-medium">Ligando...</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }} className="bg-black/50 backdrop-blur-sm mx-4 bg-[#111B20] rounded-[10px] p-[10px]">
        <div className="flex justify-center gap-3 sm:gap-6 px-2">
          <button
            onClick={() => setShowKeypad(!showKeypad)}
            className="w-14 h-14 sm:w-16 sm:h-16 min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center flex-shrink-0 transition-all shadow-lg"
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="white" xmlns="http://www.w3.org/2000/svg"> <g> <rect width="24" height="24" fill="none" opacity="0" /> <path d="M12,1.5A1.5,1.5,0,1,1,13.5,3,1.5,1.5,0,0,1,12,1.5Zm-6,0A1.5,1.5,0,1,1,7.5,3,1.5,1.5,0,0,1,6,1.5Zm-6,0A1.5,1.5,0,1,1,1.5,3,1.5,1.5,0,0,1,0,1.5Z" transform="translate(4.5 11)" fill="white" /> </g> </svg>
          </button>

          <button className="w-14 h-14 sm:w-16 sm:h-16 min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] rounded-full bg-gray-700/50 flex items-center justify-center flex-shrink-0 transition-all shadow-lg opacity-50 cursor-not-allowed">
            <Video size={28} className="text-white" />
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-14 h-14 sm:w-16 sm:h-16 min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-lg ${
              isSpeakerOn
                ? 'bg-gray-700/50 hover:bg-gray-600/50'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            {isSpeakerOn ? (
              <img
                src="https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=sound-branco.png&version_id=null"
                alt="Speaker on"
                width="28"
                height="28"
              />
            ) : (
              <img
                src="http://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=sound-preto.png&version_id=null"
                alt="Speaker off"
                width="28"
                height="28"
              />
            )}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 sm:w-16 sm:h-16 min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-lg ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700/50 hover:bg-gray-600/50'
            }`}
          >
            {isMuted ? (
              <MicOff size={28} className="text-white" />
            ) : (
              <Mic size={28} className="text-white" />
            )}
          </button>

          <button
            onClick={onClose}
            className="w-14 h-14 sm:w-16 sm:h-16 min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center flex-shrink-0 transition-all shadow-lg"
          >
            <Phone size={28} className="text-white" />
          </button>
        </div>

      </div>
    </div>
  );
}
