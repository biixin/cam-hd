import { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { chatConfig } from '../config';

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text') => void;
  onSendAudio: (audioBlob: Blob, duration: number) => void;
  onSendImage: (imageUrl: string) => void;
  hasHistory: boolean;
}

export default function MessageInput({ onSendMessage, onSendImage, hasHistory }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [hasAutoSent, setHasAutoSent] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasHistory) {
      setHasAutoSent(false);
      setMessage('');
    }
  }, [hasHistory]);

  useEffect(() => {
    if (!hasHistory && !hasAutoSent) {
      setMessage('Oii meu amor, quero conhecer seus conteudo');
      const timer = setTimeout(() => {
        onSendMessage('Oii meu amor, quero conhecer seus conteudo', 'text');
        setMessage('');
        setHasAutoSent(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [hasHistory, hasAutoSent, onSendMessage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = message;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + emojiData.emoji + after;
      setMessage(newText);

      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = start + emojiData.emoji.length;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
          textareaRef.current.focus();
        }
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, 'text');
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSendImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="px-2 py-2 w-full"
      style={{
        backgroundImage: `url("${chatConfig.chatBackground}")`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))'
      }}
    >
      <div className="flex items-end gap-2 max-w-full">
        <div className="flex-1 bg-white rounded-full px-3 py-2 flex items-center gap-1 shadow-sm relative min-w-0">
          <div className="relative flex-shrink-0" ref={emojiPickerRef}>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg viewBox="0 0 24 24" height="22" width="22" preserveAspectRatio="xMidYMid meet" fill="none"><path d="M8.49893 10.2521C9.32736 10.2521 9.99893 9.5805 9.99893 8.75208C9.99893 7.92365 9.32736 7.25208 8.49893 7.25208C7.6705 7.25208 6.99893 7.92365 6.99893 8.75208C6.99893 9.5805 7.6705 10.2521 8.49893 10.2521Z" fill="currentColor"></path><path d="M17.0011 8.75208C17.0011 9.5805 16.3295 10.2521 15.5011 10.2521C14.6726 10.2521 14.0011 9.5805 14.0011 8.75208C14.0011 7.92365 14.6726 7.25208 15.5011 7.25208C16.3295 7.25208 17.0011 7.92365 17.0011 8.75208Z" fill="currentColor"></path><path fillRule="evenodd" clipRule="evenodd" d="M16.8221 19.9799C15.5379 21.2537 13.8087 21.9781 12 22H9.27273C5.25611 22 2 18.7439 2 14.7273V9.27273C2 5.25611 5.25611 2 9.27273 2H14.7273C18.7439 2 22 5.25611 22 9.27273V11.8141C22 13.7532 21.2256 15.612 19.8489 16.9776L16.8221 19.9799ZM14.7273 4H9.27273C6.36068 4 4 6.36068 4 9.27273V14.7273C4 17.6393 6.36068 20 9.27273 20H11.3331C11.722 19.8971 12.0081 19.5417 12.0058 19.1204L11.9935 16.8564C11.9933 16.8201 11.9935 16.784 11.9941 16.7479C11.0454 16.7473 10.159 16.514 9.33502 16.0479C8.51002 15.5812 7.84752 14.9479 7.34752 14.1479C7.24752 13.9479 7.25585 13.7479 7.37252 13.5479C7.48919 13.3479 7.66419 13.2479 7.89752 13.2479L13.5939 13.2479C14.4494 12.481 15.5811 12.016 16.8216 12.0208L19.0806 12.0296C19.5817 12.0315 19.9889 11.6259 19.9889 11.1248V9.07648H19.9964C19.8932 6.25535 17.5736 4 14.7273 4ZM14.0057 19.1095C14.0066 19.2605 13.9959 19.4089 13.9744 19.5537C14.5044 19.3124 14.9926 18.9776 15.4136 18.5599L18.4405 15.5576C18.8989 15.1029 19.2653 14.5726 19.5274 13.996C19.3793 14.0187 19.2275 14.0301 19.0729 14.0295L16.8138 14.0208C15.252 14.0147 13.985 15.2837 13.9935 16.8455L14.0057 19.1095Z" fill="currentColor"></path></svg>
            </button>
            {showEmojiPicker && (
              <div className="fixed left-2 right-2 bottom-16 z-50 flex justify-center sm:absolute sm:bottom-full sm:left-0 sm:right-auto sm:mb-2">
                <div className="w-full max-w-[350px] shadow-xl rounded-lg overflow-hidden">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    width="100%"
                    height="400px"
                    searchPlaceHolder="Buscar emoji..."
                    previewConfig={{
                      showPreview: false
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mensagem"
            rows={1}
            className="flex-1 bg-transparent outline-none text-[15px] px-2 resize-none max-h-[80px] overflow-y-auto leading-[20px] py-2 min-w-0"
            style={{
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-gray-700 p-1 flex-shrink-0"
          >
            <svg viewBox="0 0 32 32" height="22" width="22" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M23.113 7.748h-0.002c-0 0-0.001 0-0.001 0-0.413 0-0.748 0.335-0.749 0.748v0l-0.029 14.197c0.004 0.084 0.006 0.183 0.006 0.282 0 1.812-0.755 3.448-1.967 4.611l-0.002 0.002c-1.134 1.011-2.639 1.629-4.287 1.629-0.030 0-0.059-0-0.088-0.001l0.004 0h-0.015c-0.028 0-0.061 0.001-0.094 0.001-1.64 0-3.136-0.611-4.275-1.618l0.007 0.006c-1.225-1.165-1.988-2.808-1.988-4.629 0-0.090 0.002-0.18 0.006-0.269l-0 0.013v-15.516c-0.003-0.056-0.004-0.122-0.004-0.188 0-2.341 1.898-4.239 4.239-4.239 0.066 0 0.131 0.002 0.196 0.004l-0.009-0c0.056-0.003 0.122-0.004 0.188-0.004 2.341 0 4.238 1.897 4.238 4.238 0 0.065-0.002 0.131-0.004 0.195l0-0.009-0.057 14.276c0.002 0.045 0.003 0.097 0.003 0.15 0 0.85-0.311 1.628-0.826 2.225l0.004-0.004c-0.411 0.439-0.994 0.712-1.641 0.713h-0.020c-0.654-0.006-1.241-0.29-1.648-0.74l-0.002-0.002c-0.489-0.586-0.785-1.347-0.785-2.178 0-0.076 0.002-0.151 0.007-0.225l-0.001 0.010v-10.344c0-0.414-0.336-0.75-0.75-0.75s-0.75 0.336-0.75 0.75v0 10.338c-0.018 0.146-0.029 0.315-0.029 0.486 0 2.221 1.741 4.035 3.932 4.152l0.010 0 0.034 0.002c0.001 0 0.003 0 0.005 0 1.073 0 2.040-0.452 2.721-1.176l0.002-0.002c0.766-0.858 1.235-1.996 1.235-3.244 0-0.053-0.001-0.107-0.003-0.16l0 0.008 0.057-14.283c0-7.775-11.844-7.775-11.844 0v15.518c-0.004 0.097-0.007 0.21-0.007 0.324 0 4.237 3.435 7.672 7.672 7.672 0.063 0 0.127-0.001 0.19-0.002l-0.009 0h0.017c0.024 0 0.053 0 0.082 0 2.038 0 3.898-0.767 5.305-2.029l-0.008 0.007c1.514-1.432 2.457-3.456 2.457-5.699 0-0.106-0.002-0.212-0.006-0.318l0 0.015 0.029-14.193c0-0.001 0-0.001 0-0.002 0-0.414-0.335-0.749-0.748-0.75h-0z"></path></svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <button
          onClick={handleSend}
          className="w-11 h-11 min-w-[44px] min-h-[44px] max-w-[44px] max-h-[44px] rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-lg bg-[#1A9455] hover:bg-[#17854f] text-white"
        >
          <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" fill="none"><title>wds-ic-send-filled</title><path d="M5.4 19.425C5.06667 19.5583 4.75 19.5291 4.45 19.3375C4.15 19.1458 4 18.8666 4 18.5V14L12 12L4 9.99997V5.49997C4 5.1333 4.15 4.85414 4.45 4.66247C4.75 4.4708 5.06667 4.44164 5.4 4.57497L20.8 11.075C21.2167 11.2583 21.425 11.5666 21.425 12C21.425 12.4333 21.2167 12.7416 20.8 12.925L5.4 19.425Z" fill="currentColor"></path></svg>
        </button>
      </div>
    </div>
  );
}
