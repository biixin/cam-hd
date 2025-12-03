import { useState } from 'react';
import { DollarSign, X, Lock, Droplet } from 'lucide-react';

interface TipModalProps {
  type: 'tip' | 'cum' | 'private';
  onClose: () => void;
  onSubmit: (amount: string, type: 'tip' | 'cum' | 'private') => void;
}

export default function TipModal({ type, onClose, onSubmit }: TipModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const config = {
    tip: {
      title: 'Enviar Gorjeta',
      icon: <DollarSign className="w-8 h-8 text-white" />,
      description: 'Mostre seu apoio enviando uma gorjeta para a modelo',
      amounts: [5, 10, 25, 50, 100, 500],
      gradient: 'from-pink-500 to-rose-500',
      descriptionExtra: ''
    },
    cum: {
      title: 'Pedir Para Gozar',
      icon: <Droplet className="w-8 h-8 text-white" />,
      description: 'Faça um pedido especial para a modelo',
      amounts: [50, 100, 200, 500, 1000],
      gradient: 'from-purple-500 to-pink-500',
      descriptionExtra: ''
    },
    private: {
      title: 'Solicitar Sala Privada',
      icon: <Lock className="w-8 h-8 text-white" />,
      description: 'Tenha um momento exclusivo com a modelo',
      amounts: [14.90, 29.90, 45, 60],
      gradient: 'from-rose-500 to-purple-600',
      descriptionExtra: 'A cada R$ 15 acrescenta 10 minutos de tempo privado com a modelo'
    }
  };

  const current = config[type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = selectedAmount?.toString() || amount;
    if (finalAmount && parseFloat(finalAmount) > 0) {
      onSubmit(finalAmount, type);
    }
  };

  const handleAmountClick = (value: number) => {
    setSelectedAmount(value);
    setAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-pink-500/30 animate-fadeIn relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center mb-6">
          <div className={`bg-gradient-to-r ${current.gradient} p-4 rounded-full`}>
            {current.icon}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-white">
          {current.title}
        </h2>
        <p className="text-gray-300 text-center mb-2 text-sm">
          {current.description}
        </p>
        {current.descriptionExtra && (
          <p className="text-pink-300 text-center mb-4 text-xs font-semibold">
            {current.descriptionExtra}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Valores sugeridos:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {current.amounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAmountClick(amt)}
                  className={`py-3 px-4 rounded-lg font-bold transition-all duration-300 ${
                    selectedAmount === amt
                      ? `bg-gradient-to-r ${current.gradient} text-white shadow-lg scale-105`
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  R$ {amt.toFixed(2).replace('.', ',')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Ou digite o valor:
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                R$
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="0,00"
                min="1"
                step="0.01"
                className="w-full bg-gray-800/80 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 border border-gray-700 placeholder-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!amount && !selectedAmount}
            className={`w-full bg-gradient-to-r ${current.gradient} hover:opacity-90 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:cursor-not-allowed shadow-lg`}
          >
            Confirmar {selectedAmount || amount ? `R$ ${(selectedAmount || parseFloat(amount)).toFixed(2).replace('.', ',')}` : ''}
          </button>
        </form>
      </div>
    </div>
  );
}
