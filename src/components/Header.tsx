import { Video, Users, DollarSign, Lock } from 'lucide-react';

interface HeaderProps {
  viewerCount: number;
  onPrivateClick: () => void;
  onTipClick: () => void;
}

export default function Header({ viewerCount, onPrivateClick, onTipClick }: HeaderProps) {
  return (
    <header className="bg-black/50 backdrop-blur-md border-b border-pink-500/20 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-2 rounded-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            LiveCam+
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 px-3 py-2 rounded-full">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <Users className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-300">{viewerCount}</span>
          </div>

          <button
            onClick={onTipClick}
            className="hidden sm:flex bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-full transition-all duration-300 items-center gap-2 font-semibold shadow-lg shadow-pink-500/30"
          >
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar Gorjeta</span>
          </button>

          <button
            onClick={onPrivateClick}
            className="hidden sm:flex bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white px-4 py-2 rounded-full transition-all duration-300 items-center gap-2 font-semibold shadow-lg shadow-purple-500/30"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Sala Privada</span>
          </button>
        </div>
      </div>
    </header>
  );
}
