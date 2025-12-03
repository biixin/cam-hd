import { useState } from 'react';

interface PaymentButtonsProps {
  onSelectAmount: (amount: number) => void;
}

export default function PaymentButtons({ onSelectAmount }: PaymentButtonsProps) {
  const [selectedButton, setSelectedButton] = useState<number | null>(null);

  const buttons = [
    { label: 'R$ 10,00', value: 1000 },
    { label: 'R$ 20,00', value: 2000 },
    { label: 'R$ 50,00', value: 5000 }
  ];

  const handleClick = (value: number) => {
    setSelectedButton(value);
    onSelectAmount(value);
  };

  return (
    <div className="flex justify-start mb-2 px-4">
      <div className="bg-white rounded-lg shadow-sm p-2 mr-auto max-w-[85%]">
        <div className="flex gap-2">
          {buttons.map((button) => (
            <button
              key={button.value}
              onClick={() => handleClick(button.value)}
              disabled={selectedButton !== null && selectedButton !== button.value}
              className={`flex-1 font-semibold py-2 px-3 rounded-lg text-xs transition-all duration-150 transform ${
                selectedButton === button.value
                  ? 'bg-[#FF8C00] hover:bg-[#FF8C00] text-white scale-95'
                  : selectedButton === null
                  ? 'bg-[#25D366] hover:bg-[#20BA5A] active:scale-95 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
