import { useState, useEffect, useRef } from 'react';
import { DollarSign, Lock } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import ChatBox from './components/ChatBox';
import NicknameModal from './components/NicknameModal';
import TipModal from './components/TipModal';
import PaymentModal from './components/PaymentModal';
import Header from './components/Header';
import {
  MODEL_NAME,
  PRICING_CONFIG,
  MODEL_MESSAGES,
  FAKE_USER_MESSAGES,
  FAKE_USER_NICKNAMES
} from './config/videos';
import {
  getSessionId,
  getUserSession,
  createOrUpdateSession,
  getChatMessages,
  saveChatMessage,
  clearPaymentCache,
} from './lib/storage';

function App() {
  const [sessionId] = useState(() => getSessionId());
  const [nickname, setNickname] = useState<string>('');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrivateRoomOffer, setShowPrivateRoomOffer] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(5.90);
  const [paymentTitle, setPaymentTitle] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [tipType, setTipType] = useState<'tip' | 'cum' | 'private'>('tip');
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<Array<{ id: string; user: string; text: string; color: string; isSystem?: boolean; isTip?: boolean; tipAmount?: number }>>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoProgressPrivate, setVideoProgressPrivate] = useState(0);
  const [hasStartedVideo, setHasStartedVideo] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isFreeTimeBlocked, setIsFreeTimeBlocked] = useState(false);
  const [paymentType, setPaymentType] = useState<string>('');
  const usedMessagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const loadSession = async () => {
      const session = await getUserSession(sessionId);
      if (session) {
        if (session.nickname) {
          setNickname(session.nickname);
        }
        setIsPremium(session.has_paid_free_time);
        setIsPrivateRoom(session.is_in_private_room);
        setVideoProgress(session.video_progress || 0);
        setVideoProgressPrivate(session.video_progress_private || 0);

        if (session.free_time_blocked_at && !session.has_paid_free_time) {
          console.log('[App] Usuario ja foi bloqueado anteriormente');
          setIsFreeTimeBlocked(true);
        }
      }

      const savedMessages = await getChatMessages(sessionId);
      if (savedMessages.length > 0) {
        const formattedMessages = savedMessages.map(msg => ({
          id: msg.id,
          user: msg.username,
          text: msg.text,
          color: msg.color,
          isSystem: msg.is_system,
          isTip: msg.is_tip,
          tipAmount: msg.tip_amount ? Number(msg.tip_amount) : undefined,
        }));
        setMessages(formattedMessages);
      }

      setIsLoadingSession(false);
    };

    loadSession();

    setViewerCount(Math.floor(Math.random() * 200) + 50);
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 10) - 4;
        return Math.max(30, Math.min(500, prev + change));
      });
    }, 15000);

    const modelInterval = setInterval(() => {
      const randomMessage = MODEL_MESSAGES[Math.floor(Math.random() * MODEL_MESSAGES.length)];
      addMessage('Modelo', randomMessage, '#ff1b6d', false);
    }, Math.random() * 60000 + 60000);

    const fakeUserInterval = setInterval(() => {
      const randomNickname = FAKE_USER_NICKNAMES[Math.floor(Math.random() * FAKE_USER_NICKNAMES.length)];

      // Cria uma chave única combinando nickname e mensagem
      let randomMessage;
      let messageKey;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        randomMessage = FAKE_USER_MESSAGES[Math.floor(Math.random() * FAKE_USER_MESSAGES.length)];
        messageKey = `${randomNickname}:${randomMessage}`;
        attempts++;
      } while (usedMessagesRef.current.has(messageKey) && attempts < maxAttempts);

      // Se encontrou uma mensagem única, adiciona ao set
      if (!usedMessagesRef.current.has(messageKey)) {
        usedMessagesRef.current.add(messageKey);

        const colors = ['#ff6b9d', '#c4f0ff', '#ffd93d', '#a8e6cf', '#ff9ff3', '#feca57'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        addMessage(randomNickname, randomMessage, color);
      }
    }, Math.random() * 20000 + 15000);

    const tipDelays = [20000, 80000, 200000];
    const tipAmounts = [5, 10, 20, 25];

    tipDelays.forEach((delay, index) => {
      setTimeout(() => {
        const randomNickname = FAKE_USER_NICKNAMES[Math.floor(Math.random() * FAKE_USER_NICKNAMES.length)];
        const randomAmount = tipAmounts[Math.floor(Math.random() * tipAmounts.length)];
        addMessage(
          'Sistema',
          `${randomNickname} enviou uma gorjeta de R$ ${randomAmount.toFixed(2).replace('.', ',')}!`,
          '#ff1b6d',
          true,
          true,
          randomAmount
        );
      }, delay);
    });

    return () => {
      clearInterval(viewerInterval);
      clearInterval(modelInterval);
      clearInterval(fakeUserInterval);
    };
  }, []);

  const addMessage = async (
    user: string,
    text: string,
    color: string,
    isSystem: boolean = false,
    isTip: boolean = false,
    tipAmount?: number
  ) => {
    const newMessage = {
      id: Date.now().toString() + Math.random(),
      user,
      text,
      color,
      isSystem,
      isTip,
      tipAmount
    };
    setMessages(prev => [...prev, newMessage]);

    await saveChatMessage(
      sessionId,
      user,
      text,
      color,
      isSystem,
      isTip,
      tipAmount || null
    );
  };

  const handleVideoStart = () => {
    if (!hasStartedVideo) {
      setHasStartedVideo(true);
      if (!nickname) {
        setShowNicknameModal(true);
      }
    }
  };

  const handleNicknameSubmit = async (name: string) => {
    setNickname(name);
    setShowNicknameModal(false);
    await createOrUpdateSession(sessionId, { nickname: name });
    await addMessage('Sistema', `${name} entrou na sala`, '#666', true);
  };

  const handleSendMessage = (text: string) => {
    if (nickname && text.trim()) {
      const colors = ['#ff6b9d', '#c4f0ff', '#ffd93d', '#a8e6cf', '#ff9ff3', '#feca57'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      addMessage(nickname, text, color);
    }
  };

  const handleTipAction = (type: 'tip' | 'cum' | 'private') => {
    setTipType(type);
    setShowTipModal(true);
  };

  const handleTipSubmit = (amount: string, type: 'tip' | 'cum' | 'private') => {
    const amountNum = parseFloat(amount);
    setShowTipModal(false);

    if (type === 'private') {
      setPaymentAmount(amountNum);
      setPaymentTitle('Entrar na Sala Privada');
      setPaymentDescription(`Tenha um momento exclusivo com ${MODEL_NAME}`);
      setPaymentType('private');
      setShowPaymentModal(true);
    } else if (type === 'tip') {
      setPaymentAmount(amountNum);
      setPaymentTitle('Enviar Gorjeta');
      setPaymentDescription('Mostre seu apoio para a modelo');
      setPaymentType('tip');
      setShowPaymentModal(true);
    } else if (type === 'cum') {
      setPaymentAmount(amountNum);
      setPaymentTitle('Pedido Especial');
      setPaymentDescription('Você pediu para a modelo gozar');
      setPaymentType('cum');
      setShowPaymentModal(true);
    }
  };

  const handleFreeTimeExpired = async () => {
    console.log('[App] handleFreeTimeExpired chamado');
    if (isPremium || isPrivateRoom || isFreeTimeBlocked) {
      console.log('[App] Usuario ja e premium, em sala privada ou ja foi bloqueado');
      return;
    }

    setIsFreeTimeBlocked(true);
    await createOrUpdateSession(sessionId, {
      free_time_blocked_at: new Date().toISOString()
    });

    setPaymentAmount(PRICING_CONFIG.freeTimePayment);
    setPaymentTitle('Tempo Gratuito Expirado');
    setPaymentDescription(`Para continuar assistindo a live, faça um pagamento de R$ ${PRICING_CONFIG.freeTimePayment.toFixed(2).replace('.', ',')}`);
    setPaymentType('freeTimePayment');
    setShowPaymentModal(true);
  };

  const handleReloadPayment = () => {
    setPaymentAmount(PRICING_CONFIG.freeTimePayment);
    setPaymentTitle('Tempo Gratuito Expirado');
    setPaymentDescription(`Para continuar assistindo a live, faça um pagamento de R$ ${PRICING_CONFIG.freeTimePayment.toFixed(2).replace('.', ',')}`);
    setPaymentType('freeTimePayment');
    setShowPaymentModal(true);
  };

  const handlePaymentConfirmed = async () => {
    console.log('[App] Pagamento confirmado, tipo:', paymentType);
    setShowPaymentModal(false);
    await clearPaymentCache();

    if (paymentType === 'freeTimePayment') {
      console.log('[App] Definindo usuario como premium');
      setIsPremium(true);
      setIsFreeTimeBlocked(false);
      await createOrUpdateSession(sessionId, {
        has_paid_free_time: true,
        free_time_blocked_at: null
      });
      await addMessage('Sistema', 'Pagamento confirmado! Continue aproveitando a live', '#00ff00', true);
    } else if (paymentType === 'private' || paymentType === 'privateRoom') {
      setIsPrivateRoom(true);
      setShowPrivateRoomOffer(false);
      await createOrUpdateSession(sessionId, {
        has_paid_private_room: true,
        is_in_private_room: true,
      });
      await addMessage('Sistema', `Você entrou na sala privada com ${MODEL_NAME}!`, '#ff1b6d', true);
    } else if (paymentType === 'tip') {
      await addMessage('Sistema', `Você enviou uma gorjeta de R$ ${paymentAmount.toFixed(2).replace('.', ',')}!`, '#ff1b6d', true, true, paymentAmount);
    } else if (paymentType === 'cum') {
      await addMessage('Sistema', `Você pediu para a modelo gozar! (R$ ${paymentAmount.toFixed(2).replace('.', ',')})`, '#ff1b6d', true);
    }
  };

  const handleVideoEnded = () => {
    setShowPrivateRoomOffer(true);
    addMessage('Sistema', `${MODEL_NAME} está em sala privada com outro usuário`, '#ff1b6d', true);
  };

  const handlePrivateRoomRequest = () => {
    setShowPrivateRoomOffer(false);
    setPaymentAmount(PRICING_CONFIG.privateRoomPayment);
    setPaymentTitle('Entrar na Sala Privada');
    setPaymentDescription(`Tenha um momento exclusivo com ${MODEL_NAME}`);
    setPaymentType('privateRoom');
    setShowPaymentModal(true);
  };

  const handleVideoProgress = async (progress: number, isPrivate: boolean) => {
    if (isPrivate) {
      setVideoProgressPrivate(progress);
      await createOrUpdateSession(sessionId, { video_progress_private: progress });
    } else {
      setVideoProgress(progress);
      await createOrUpdateSession(sessionId, { video_progress: progress });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <Header
        viewerCount={viewerCount}
        onPrivateClick={() => handleTipAction('private')}
        onTipClick={() => handleTipAction('tip')}
      />

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] p-2 sm:p-4 gap-4">
        <div className="w-full lg:w-[70%] flex flex-col relative gap-4">
          <VideoPlayer
            onVideoStart={handleVideoStart}
            onFreeTimeExpired={handleFreeTimeExpired}
            onVideoEnded={handleVideoEnded}
            isPremium={isPremium}
            isPrivateRoom={isPrivateRoom}
            isFreeTimeBlocked={isFreeTimeBlocked}
            onReloadPayment={handleReloadPayment}
            initialProgress={isPrivateRoom ? videoProgressPrivate : videoProgress}
            onProgressUpdate={handleVideoProgress}
            isLoadingSession={isLoadingSession}
          />

          <div className="flex gap-3">
            <button
              onClick={() => handleTipAction('tip')}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
            >
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              Gorjeta
            </button>
            <button
              onClick={() => handleTipAction('private')}
              className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
            >
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              Privado
            </button>
          </div>

          {showPrivateRoomOffer && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-30 rounded-xl">
              <div className="bg-gradient-to-br from-gray-900 to-purple-900 p-8 rounded-2xl border-2 border-pink-500/30 max-w-md mx-4 text-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {MODEL_NAME} está em Sala Privada
                </h3>
                <p className="text-gray-300 mb-6">
                  Outro usuário está tendo um momento exclusivo com a modelo
                </p>
                <button
                  onClick={handlePrivateRoomRequest}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg"
                >
                  Entrar na Sala Privada - R$ {PRICING_CONFIG.privateRoomPayment.toFixed(2).replace('.', ',')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[30%] flex flex-col">
          <ChatBox
            messages={messages}
            nickname={nickname}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>


      {showNicknameModal && (
        <NicknameModal onSubmit={handleNicknameSubmit} />
      )}

      {showTipModal && (
        <TipModal
          type={tipType}
          onClose={() => setShowTipModal(false)}
          onSubmit={handleTipSubmit}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          amount={paymentAmount}
          title={paymentTitle}
          description={paymentDescription}
          paymentType={paymentType}
          onClose={() => setShowPaymentModal(false)}
          onPaymentConfirmed={handlePaymentConfirmed}
        />
      )}
    </div>
  );
}

export default App;
