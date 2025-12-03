import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, DollarSign } from 'lucide-react';

interface Message {
  id: string;
  user: string;
  text: string;
  color: string;
  isSystem?: boolean;
  isTip?: boolean;
  tipAmount?: number;
}

interface ChatBoxProps {
  messages: Message[];
  nickname: string;
  onSendMessage: (text: string) => void;
}

export default function ChatBox({ messages, nickname, onSendMessage }: ChatBoxProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && nickname) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/80 backdrop-blur-md rounded-xl border border-pink-500/20 shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-3 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        <h3 className="font-bold text-lg">Chat ao Vivo</h3>
        <span className="ml-auto text-sm bg-black/30 px-3 py-1 rounded-full">
          {messages.filter(m => !m.isSystem).length} mensagens
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-gray-800 min-h-[200px] lg:min-h-0">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.isTip ? (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-lg p-3 my-2 animate-fadeIn">
                <div className="flex items-center gap-2 justify-center">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-300 font-bold text-sm">{msg.text}</p>
                </div>
              </div>
            ) : (
              <div
                className={`${
                  msg.isSystem
                    ? 'text-center text-xs text-gray-400 italic'
                    : 'flex flex-col gap-1'
                }`}
              >
                {!msg.isSystem && (
                  <>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold text-sm"
                        style={{ color: msg.color }}
                      >
                        {msg.user}
                      </span>
                      {msg.user === 'Modelo' && (
                        <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                          ⭐
                        </span>
                      )}
                    </div>
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg px-3 py-2 max-w-[90%] break-words">
                      <p className="text-sm text-gray-200">{msg.text}</p>
                    </div>
                  </>
                )}
                {msg.isSystem && <p>{msg.text}</p>}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-gray-800/60 backdrop-blur-sm border-t border-pink-500/20">
        {!nickname ? (
          <div className="text-center text-sm text-gray-400 py-2">
            Assista o vídeo para começar a conversar
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-gray-900/80 text-white px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 border border-gray-700 placeholder-gray-500"
              maxLength={200}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-600 disabled:to-gray-700 text-white p-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
