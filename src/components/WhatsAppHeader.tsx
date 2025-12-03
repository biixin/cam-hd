import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { chatConfig } from '../config';

interface WhatsAppHeaderProps {
  onPhoneClick?: () => void;
  onVideoClick?: () => void;
  status?: 'online' | 'digitando..' | 'gravando audio..';
}

export default function WhatsAppHeader({ onPhoneClick, onVideoClick, status = 'online' }: WhatsAppHeaderProps) {
  return (
    <div
      className="bg-white text-gray-800 px-3 py-2 flex items-center justify-between shadow-sm w-full"
      style={{
        height: '60px',
        minHeight: '60px',
        maxHeight: '60px'
      }}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button className="hover:bg-gray-100 p-2 rounded-full flex-shrink-0">
          <ArrowLeft size={22} />
        </button>
        <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          <img
            src={chatConfig.attendantAvatar}
            alt={chatConfig.attendantName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-[15px] truncate">{chatConfig.attendantName}</div>
          <div className="text-xs text-gray-600">{status}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onVideoClick}
          className="hover:bg-gray-100 p-2 rounded-full text-gray-700"
        >
          <Video size={20} />
        </button>
        <button
          onClick={onPhoneClick}
          className="hover:bg-gray-100 p-2 rounded-full text-gray-700"
        >
          <Phone size={20} />
        </button>
        <button className="hover:bg-gray-100 p-2 rounded-full text-gray-700">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}
