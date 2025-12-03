import { useEffect, useRef } from 'react';
import { localStorageDB, FUNNEL_STEPS } from '../lib/localStorage';

interface UseFunnelProps {
  onTypingStart: () => void;
  onTypingEnd: () => void;
  onSendMessage: (content: string, type: 'text' | 'image' | 'audio' | 'video', mediaUrl?: string, audioDuration?: number) => void;
  onShowPaymentButtons: () => void;
  onShowPixPayment: (qrcodeImage: string, qrcode: string) => void;
  onStatusChange: (status: 'online' | 'digitando..' | 'gravando audio..') => void;
  isInitialized: boolean;
}

export function useFunnel({ onTypingStart, onTypingEnd, onSendMessage, onStatusChange, isInitialized }: UseFunnelProps) {
  const processingRef = useRef(false);
  const waitingForProofRef = useRef(false);
  const proofAttemptsRef = useRef(0);

  const sendTypingMessage = async (text: string) => {
    const textLength = text.length;
    const typingDelay = Math.max(textLength * 50, 800);

    await new Promise(resolve => setTimeout(resolve, 1000));
    onStatusChange('digitando..');
    onTypingStart();
    await new Promise(resolve => setTimeout(resolve, typingDelay));
    onTypingEnd();
    await new Promise(resolve => setTimeout(resolve, 50));
    onStatusChange('online');
    await new Promise(resolve => setTimeout(resolve, 50));
    onSendMessage(text, 'text');
  };

  const processFunnel = async () => {
    console.log('>>> processFunnel INICIADO <<<');
    console.log('processingRef.current:', processingRef.current);
    console.log('waitingForProofRef.current:', waitingForProofRef.current);

    if (processingRef.current || waitingForProofRef.current) {
      console.log('>>> processFunnel BLOQUEADO <<<');
      return;
    }

    processingRef.current = true;

    try {
      const currentStepIndex = localStorageDB.funnelState.get();
      console.log('Step atual:', currentStepIndex);

      if (currentStepIndex >= FUNNEL_STEPS.length) {
        console.log('>>> FUNIL FINALIZADO <<<');
        processingRef.current = false;
        return;
      }

      const currentStep = FUNNEL_STEPS[currentStepIndex];
      console.log('Ação do step:', currentStep.action_type);

      if (currentStep.action_type === 'wait_for_proof') {
        console.log('>>> AGUARDANDO COMPROVANTE <<<');
        waitingForProofRef.current = true;
        processingRef.current = false;
        return;
      }

      if (currentStep.action_type === 'wait_for_reply') {
        console.log('>>> AGUARDANDO RESPOSTA NORMAL <<<');
        processingRef.current = false;
        return;
      }

      if (currentStep.action_type === 'send_message') {
        const delay = currentStep.typing_delay || 2000;
        await new Promise(resolve => setTimeout(resolve, delay));

        if (currentStep.message_type === 'text' && currentStep.message_content) {
          const textLength = currentStep.message_content.length;
          const typingDelay = Math.max(textLength * 50, 800);

          onStatusChange('digitando..');
          onTypingStart();
          await new Promise(resolve => setTimeout(resolve, typingDelay));
          onTypingEnd();
          await new Promise(resolve => setTimeout(resolve, 50));
          onStatusChange('online');
          await new Promise(resolve => setTimeout(resolve, 50));

          onSendMessage(currentStep.message_content, 'text');
        } else if (currentStep.message_type === 'audio' && currentStep.media_url) {
          const audioDuration = currentStep.audio_duration || 5;
          const audioDelay = audioDuration * 1000;

          onStatusChange('gravando audio..');
          onTypingStart();
          await new Promise(resolve => setTimeout(resolve, audioDelay));
          onTypingEnd();
          await new Promise(resolve => setTimeout(resolve, 50));
          onStatusChange('online');
          await new Promise(resolve => setTimeout(resolve, 50));

          onSendMessage('', 'audio', currentStep.media_url, audioDuration);
        } else if (currentStep.message_type === 'image' && currentStep.media_url) {
          onStatusChange('digitando..');
          onTypingStart();
          await new Promise(resolve => setTimeout(resolve, 2000));
          onTypingEnd();
          await new Promise(resolve => setTimeout(resolve, 50));
          onStatusChange('online');
          await new Promise(resolve => setTimeout(resolve, 50));

          onSendMessage(currentStep.message_content || '', 'image', currentStep.media_url);
        } else if (currentStep.message_type === 'video' && currentStep.media_url) {
          onStatusChange('digitando..');
          onTypingStart();
          await new Promise(resolve => setTimeout(resolve, 2000));
          onTypingEnd();
          await new Promise(resolve => setTimeout(resolve, 50));
          onStatusChange('online');
          await new Promise(resolve => setTimeout(resolve, 50));

          onSendMessage(currentStep.message_content || '', 'video', currentStep.media_url);
        }

        localStorageDB.funnelState.set(currentStepIndex + 1);

        setTimeout(() => {
          processingRef.current = false;
          processFunnel();
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao processar funil:', error);
      processingRef.current = false;
    }
  };

  const containsPaymentKeywords = (text: string): boolean => {
    const keywords = ['paguei', 'pago', 'olha o pix', 'mandei'];
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  };

  const handleProofValidation = async () => {
    console.log('=== handleProofValidation CHAMADO ===');

    const messages = localStorageDB.messages.get();
    const lastMessage = messages[messages.length - 1];

    console.log('Última mensagem:', lastMessage);

    if (!lastMessage || !lastMessage.is_from_lead) {
      console.log('>>> Mensagem inválida <<<');
      return;
    }

    if (lastMessage.type === 'image' || lastMessage.type === 'video') {
      console.log('>>> MÍDIA RECEBIDA - AVANÇANDO FUNIL <<<');
      proofAttemptsRef.current = 0;
      waitingForProofRef.current = false;

      const currentStepIndex = localStorageDB.funnelState.get();
      localStorageDB.funnelState.set(currentStepIndex + 1);

      setTimeout(() => {
        processingRef.current = false;
        processFunnel();
      }, 1000);
      return;
    }

    if (lastMessage.type === 'text') {
      console.log('>>> TEXTO RECEBIDO <<<');

      if (containsPaymentKeywords(lastMessage.content || '')) {
        console.log('>>> CONTÉM PALAVRAS-CHAVE - AVANÇANDO FUNIL <<<');
        proofAttemptsRef.current = 0;
        waitingForProofRef.current = false;

        const currentStepIndex = localStorageDB.funnelState.get();
        localStorageDB.funnelState.set(currentStepIndex + 1);

        setTimeout(() => {
          processingRef.current = false;
          processFunnel();
        }, 1000);
        return;
      } else {
        console.log('>>> TEXTO SEM PALAVRAS-CHAVE - PEDINDO COMPROVANTE <<<');

        const replyMessages = [
          'Amor, preciso que vc envie o comprovante',
          'sem o comprovante não consigo meu amor, me envia o comprovante aqui pra eu liberar vida',
          'Me envia uma foto do comprovante vida!',
          'Preciso ver o comprovante pra te liberar o acesso amor',
          'Sem o comprovante não consigo fazer nada vida!'
        ];

        const messageIndex = Math.min(proofAttemptsRef.current, replyMessages.length - 1);
        const message = replyMessages[messageIndex];
        proofAttemptsRef.current++;

        await sendTypingMessage(message);
        return;
      }
    }
  };

  const onLeadReply = async () => {
    console.log('=== onLeadReply CHAMADO ===');
    const currentStepIndex = localStorageDB.funnelState.get();
    const currentStep = FUNNEL_STEPS[currentStepIndex];

    console.log('Step atual:', currentStepIndex);
    console.log('Step:', currentStep);
    console.log('waitingForProofRef.current:', waitingForProofRef.current);

    if (waitingForProofRef.current) {
      console.log('>>> PROCESSANDO VALIDAÇÃO DE COMPROVANTE <<<');
      await handleProofValidation();
      return;
    }

    if (currentStep && currentStep.action_type === 'wait_for_reply') {
      console.log('>>> RESPOSTA NORMAL RECEBIDA - AVANÇANDO <<<');
      const nextStepIndex = currentStepIndex + 1;
      localStorageDB.funnelState.set(nextStepIndex);

      setTimeout(() => {
        processingRef.current = false;
        processFunnel();
      }, 1000);
      return;
    }

    console.log('>>> MENSAGEM RECEBIDA FORA DO CONTEXTO DE ESPERA - IGNORANDO <<<');
  };

  const onPaymentAmountSelected = async (amount: number) => {
    console.log('Pagamentos desativados');
  };

  useEffect(() => {
    if (isInitialized) {
      processFunnel();
    }
  }, [isInitialized]);

  return { onLeadReply, onPaymentAmountSelected };
}
