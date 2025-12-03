export interface UserSession {
  id: string;
  session_id: string;
  nickname: string | null;
  has_paid_free_time: boolean;
  has_paid_private_room: boolean;
  video_progress: number;
  video_progress_private: number;
  is_in_private_room: boolean;
  free_time_blocked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  username: string;
  text: string;
  color: string;
  is_system: boolean;
  is_tip: boolean;
  tip_amount: number | null;
  created_at: string;
}

export interface PaymentCache {
  session_id: string;
  qrcode_id: string;
  amount: number;
  paymentType: string;
  qr_code: string;
  qr_code_base64: string;
  qrcode_image: string;
  created_at: string;
  [key: string]: any;
}

const STORAGE_KEYS = {
  SESSION: 'session_id',
  USER_SESSION: 'user_session',
  CHAT_MESSAGES: 'chat_messages',
  PAYMENT_CACHE: 'payment_cache_v2',
};

export function getSessionId(): string {
  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.SESSION, sessionId);
  }
  return sessionId;
}

export async function getUserSession(sessionId: string): Promise<UserSession | null> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    if (!stored) return null;

    const session: UserSession = JSON.parse(stored);
    if (session.session_id === sessionId) {
      return session;
    }
    return null;
  } catch (err) {
    console.error('[Storage] Exception fetching session:', err);
    return null;
  }
}

export async function createOrUpdateSession(sessionId: string, updates: Partial<UserSession>): Promise<UserSession | null> {
  try {
    const existing = await getUserSession(sessionId);

    if (existing) {
      const updated: UserSession = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(updated));
      return updated;
    } else {
      const newSession: UserSession = {
        id: `id_${Date.now()}`,
        session_id: sessionId,
        nickname: null,
        has_paid_free_time: false,
        has_paid_private_room: false,
        video_progress: 0,
        video_progress_private: 0,
        is_in_private_room: false,
        free_time_blocked_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates,
      };
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(newSession));
      return newSession;
    }
  } catch (err) {
    console.error('[Storage] Exception in createOrUpdateSession:', err);
    return null;
  }
}

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    if (!stored) return [];

    const allMessages: ChatMessage[] = JSON.parse(stored);
    return allMessages
      .filter(msg => msg.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch (err) {
    console.error('[Storage] Exception fetching messages:', err);
    return [];
  }
}

export async function saveChatMessage(
  sessionId: string,
  username: string,
  text: string,
  color: string,
  isSystem: boolean = false,
  isTip: boolean = false,
  tipAmount: number | null = null
): Promise<ChatMessage | null> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const allMessages: ChatMessage[] = stored ? JSON.parse(stored) : [];

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      session_id: sessionId,
      username,
      text,
      color,
      is_system: isSystem,
      is_tip: isTip,
      tip_amount: tipAmount,
      created_at: new Date().toISOString(),
    };

    allMessages.push(newMessage);
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(allMessages));

    return newMessage;
  } catch (err) {
    console.error('[Storage] Exception saving message:', err);
    return null;
  }
}

export async function getPaymentCache(amount: number, paymentType: string): Promise<PaymentCache | null> {
  try {
    const sessionId = getSessionId();
    const stored = localStorage.getItem(STORAGE_KEYS.PAYMENT_CACHE);
    if (!stored) return null;

    const allPayments: PaymentCache[] = JSON.parse(stored);
    const payment = allPayments.find(
      p => p.session_id === sessionId &&
           p.amount === amount &&
           p.paymentType === paymentType
    );

    if (payment) {
      console.log('[Storage] Usando pagamento em cache:', payment.qrcode_id, 'tipo:', paymentType, 'valor:', amount);
      return payment;
    }
    return null;
  } catch (err) {
    console.error('[Storage] Exception fetching payment cache:', err);
    return null;
  }
}

export async function savePaymentCache(payment: PaymentCache): Promise<void> {
  try {
    const sessionId = getSessionId();
    console.log('[Storage] Salvando pagamento em cache:', payment.qrcode_id, 'tipo:', payment.paymentType, 'valor:', payment.amount);

    const stored = localStorage.getItem(STORAGE_KEYS.PAYMENT_CACHE);
    const allPayments: PaymentCache[] = stored ? JSON.parse(stored) : [];

    const existingIndex = allPayments.findIndex(
      p => p.session_id === sessionId &&
           p.amount === payment.amount &&
           p.paymentType === payment.paymentType
    );

    if (existingIndex >= 0) {
      allPayments[existingIndex] = payment;
    } else {
      allPayments.push(payment);
    }

    localStorage.setItem(STORAGE_KEYS.PAYMENT_CACHE, JSON.stringify(allPayments));
  } catch (err) {
    console.error('[Storage] Exception saving payment cache:', err);
  }
}

export async function clearPaymentCache(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEYS.PAYMENT_CACHE);
  } catch (err) {
    console.error('[Storage] Exception clearing payment cache:', err);
  }
}
