import { useState } from 'react';
import { User } from 'lucide-react';

interface NicknameModalProps {
  onSubmit: (nickname: string) => void;
}

export default function NicknameModal({ onSubmit }: NicknameModalProps) {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onSubmit(nickname.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-pink-500/30 animate-fadeIn">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 rounded-full">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
          Bem-vindo ao Show!
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Escolha seu nome para participar do chat
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Digite seu nickname..."
            className="w-full bg-gray-800/80 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 border border-gray-700 placeholder-gray-500"
            maxLength={20}
            autoFocus
          />

          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:cursor-not-allowed shadow-lg"
          >
            Confirmar e Entrar
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Seu nickname será visível para todos no chat
        </p>
      </div>
    </div>
  );
}
