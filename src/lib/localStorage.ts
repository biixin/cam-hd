export interface Message {
  id: string;
  content: string | null;
  type: 'text' | 'image' | 'audio' | 'video' | 'payment_buttons' | 'pix_payment';
  media_url: string | null;
  audio_duration: number | null;
  is_from_lead: boolean;
  read: boolean;
  read_status: 'sending' | 'sent' | 'delivered' | 'read';
  created_at: string;
  pix_data?: {
    qrcodeImage: string;
    qrcode: string;
  };
}

export interface FunnelStep {
  action_type: 'send_message' | 'wait_for_reply' | 'wait_for_proof' | 'show_payment_buttons' | 'show_pix_payment' | 'wait_for_payment';
  message_content?: string;
  message_type?: 'text' | 'image' | 'audio' | 'video';
  media_url?: string;
  audio_duration?: number;
  typing_delay?: number;
}

const FUNNEL_STATE_KEY = 'whatsapp_funnel_state';
const PAYMENT_DATA_KEY = 'whatsapp_payment_data';
const MESSAGES_KEY = 'whatsapp_messages';

export const FUNNEL_STEPS: FunnelStep[] = [
  {
    action_type: 'wait_for_reply'
  },
  {
    action_type: 'send_message',
    message_content: 'Oii meu amor, tudo bomm?',
    message_type: 'text',
    typing_delay: 5000
  },
  {
    action_type: 'send_message',
    message_type: 'audio',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=01-mj.mp3&version_id=null',
    audio_duration: 13,
    typing_delay: 5000
  },
  {
    action_type: 'wait_for_reply'
  },
  {
    action_type: 'send_message',
    message_type: 'audio',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=02-mj.mp3&version_id=null',
    audio_duration: 32,
    typing_delay: 5000
  },
  {
    action_type: 'wait_for_reply'
  },
  {
    action_type: 'send_message',
    message_type: 'audio',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=03-mj.mp3&version_id=null',
    audio_duration: 7,
    typing_delay: 6000
  },
  {
    action_type: 'send_message',
    message_type: 'video',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=01-mjvideo.mp4&version_id=null',
    typing_delay: 10000
  },
  {
    action_type: 'send_message',
    message_type: 'video',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=02-mjvideo.mp4&version_id=null',
    typing_delay: 12000
  },
  {
    action_type: 'send_message',
    message_type: 'audio',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=04-mj.mp3&version_id=null',
    audio_duration: 12,
    typing_delay: 8000
  },
  {
    action_type: 'send_message',
    message_type: 'audio',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=05-mj.mp3&version_id=null',
    audio_duration: 3,
    typing_delay: 6000
  },
  {
    action_type: 'wait_for_reply'
  },
  {
    action_type: 'send_message',
    message_type: 'audio',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=06-mj.mp3&version_id=null',
    audio_duration: 6,
    typing_delay: 8000
  },
  {
    action_type: 'send_message',
    message_type: 'image',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=01-mjimage.jpeg&version_id=null',
    typing_delay: 6000
  },
  {
    action_type: 'send_message',
    message_content: 'Gostou amor??',
    message_type: 'text',
    typing_delay: 7000
  },
  {
    action_type: 'wait_for_reply'
  },
  {
    action_type: 'send_message',
    message_type: 'audio',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=07-mj.mp3&version_id=null',
    audio_duration: 35,
    typing_delay: 10000
  },
  {
    action_type: 'send_message',
    message_type: 'audio',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=08-mj.mp3&version_id=null',
    audio_duration: 23,
    typing_delay: 40000
  },
  {
    action_type: 'send_message',
    message_content: 'resumindo pra vc amor, se vc me ajudar com 10, eu te mando todo meu diário secreto e vc pode me pedir vídeos no privado e se puder me ajudar com 20, a gente faz uma chamadinha bem gostosa e eu ainda te mando tudinho do meu diário',
    message_type: 'text',
    typing_delay: 10000
  },
  {
    action_type: 'send_message',
    message_type: 'audio',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=09-mj.mp3&version_id=null',
    audio_duration: 17,
    typing_delay: 8000
  },
  {
    action_type: 'send_message',
    message_type: 'audio',
    media_url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=10-mj.mp3&version_id=null',
    audio_duration: 20,
    typing_delay: 20000
  },
  {
    action_type: 'send_message',
    message_content: 'Minha chave pix é essa: 11987424182',
    message_type: 'text',
    typing_delay: 25000
  },
  {
    action_type: 'send_message',
    message_content: 'Nome da agência é essa: A D Emp Digitais',
    message_type: 'text',
    typing_delay: 1000
  },
  {
    action_type: 'send_message',
    message_content: 'Fico no aguardo do comprovante aqui meu anjoo 😘',
    message_type: 'text',
    typing_delay: 1000
  },
  {
    action_type: 'wait_for_proof'
  },
  {
    action_type: 'send_message',
    message_content: 'Muito obrigado meu gatinho, verifiquei aqui e caiu o pagamento certinho, vou te enviar aqui um link e você entra nele, que vai tá tudo lá pra vc, ai se vc tiver algum problema pode me falar aqui!',
    message_type: 'text',
    typing_delay: 1000
  },
  {
    action_type: 'send_message',
    message_content: 'https://ana-privadinho.vercel.app/',
    message_type: 'text',
    typing_delay: 500
  }
];

export interface PaymentData {
  qrcode_image: string;
  qrcode: string;
  qrcode_id: string;
  amount: number;
}

export const localStorageDB = {
  funnelState: {
    get: (): number => {
      const data = localStorage.getItem(FUNNEL_STATE_KEY);
      return data ? parseInt(data, 10) : 0;
    },

    set: (step: number): void => {
      localStorage.setItem(FUNNEL_STATE_KEY, step.toString());
    },

    reset: (): void => {
      localStorage.setItem(FUNNEL_STATE_KEY, '0');
    }
  },

  paymentData: {
    get: (): PaymentData | null => {
      const data = localStorage.getItem(PAYMENT_DATA_KEY);
      return data ? JSON.parse(data) : null;
    },

    set: (data: PaymentData): void => {
      localStorage.setItem(PAYMENT_DATA_KEY, JSON.stringify(data));
    },

    clear: (): void => {
      localStorage.removeItem(PAYMENT_DATA_KEY);
    }
  },

  messages: {
    get: (): Message[] => {
      const data = localStorage.getItem(MESSAGES_KEY);
      return data ? JSON.parse(data) : [];
    },

    set: (messages: Message[]): void => {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    },

    add: (message: Message): void => {
      const messages = localStorageDB.messages.get();
      messages.push(message);
      localStorageDB.messages.set(messages);
    },

    update: (messageId: string, updates: Partial<Message>): void => {
      const messages = localStorageDB.messages.get();
      const updatedMessages = messages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      localStorageDB.messages.set(updatedMessages);
    },

    clear: (): void => {
      localStorage.removeItem(MESSAGES_KEY);
    }
  }
};
