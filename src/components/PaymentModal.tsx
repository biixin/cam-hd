import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { getPaymentCache, savePaymentCache, clearPaymentCache, getSessionId } from '../lib/storage';

interface PaymentModalProps {
  amount: number;
  title: string;
  description: string;
  paymentType: string;
  onClose: () => void;
  onPaymentConfirmed: () => void;
}

interface PaymentResponse {
  qrcode_image?: string;
  qrcode?: string;
  qr_code_base64?: string;
  qr_code?: string;
  qrcode_id?: string;
  [key: string]: any;
}

export default function PaymentModal({
  amount,
  title,
  description,
  paymentType,
  onClose,
  onPaymentConfirmed,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generatePayment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[PaymentModal] Verificando cache para tipo:', paymentType, 'valor:', amount);

      const cachedPayment = await getPaymentCache(amount, paymentType);
      if (cachedPayment) {
        console.log('[PaymentModal] Usando pagamento em cache:', cachedPayment.qrcode_id);
        setPaymentData(cachedPayment);
        setLoading(false);
        return;
      }

      console.log('[PaymentModal] Iniciando geração de QR Code com valor:', amount);

      const response = await fetch('https://api.pushinpay.com.br/api/pix/cashIn', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 42250|dZUNZXVMH5HzfyTfZIwVUQkbB2iPQj31pymNywGm8981c9cf',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: amount * 100,
          name: 'Usuario',
          email: 'usuario@exemplo.com',
        }),
      });

      console.log('[PaymentModal] Resposta da API - Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[PaymentModal] Erro na resposta:', response.status, errorText);
        throw new Error(`Erro ao gerar pagamento: ${response.status}`);
      }

      const data = await response.json();
      console.log('[PaymentModal] Dados recebidos completos:', data);
      console.log('[PaymentModal] Campos disponíveis:', Object.keys(data));
      console.log('[PaymentModal] id:', data.id);
      console.log('[PaymentModal] qrcode_id:', data.qrcode_id);

      const transactionId = data.id || data.qrcode_id;
      if (!transactionId) {
        console.error('[PaymentModal] Nenhum ID retornado!');
        throw new Error('API não retornou ID da transação');
      }

      const sessionId = getSessionId();
      const paymentDataWithId = {
        ...data,
        session_id: sessionId,
        qrcode_id: transactionId,
        amount,
        paymentType,
        created_at: new Date().toISOString(),
      };

      await savePaymentCache(paymentDataWithId);
      setPaymentData(paymentDataWithId);
    } catch (err) {
      setError('Erro ao gerar QR Code. Tente novamente.');
      console.error('[PaymentModal] Payment error completo:', err);
    } finally {
      setLoading(false);
    }
  }, [amount, paymentType]);

  const checkPaymentStatus = useCallback(async (qrcodeId: string) => {
    if (!qrcodeId || checking) {
      console.log('[PaymentModal] Pulando verificação - qrcodeId ou checking:', qrcodeId, checking);
      return;
    }

    try {
      setChecking(true);
      console.log('[PaymentModal] INICIANDO VERIFICAÇÃO DE PAGAMENTO - ID:', qrcodeId);

      const url = `https://api.pushinpay.com.br/api/transactions/${qrcodeId}`;
      console.log('[PaymentModal] URL da requisição:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer 42250|dZUNZXVMH5HzfyTfZIwVUQkbB2iPQj31pymNywGm8981c9cf',
          'Accept': 'application/json',
        },
      });

      console.log('[PaymentModal] Status da resposta:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[PaymentModal] Dados da transação:', data);
        console.log('[PaymentModal] Status do pagamento:', data.status);

        if (data.status === 'paid') {
          console.log('[PaymentModal] PAGAMENTO CONFIRMADO!');
          onPaymentConfirmed();
        }
      } else {
        const errorData = await response.text();
        console.error('[PaymentModal] Erro na resposta:', response.status, errorData);
      }
    } catch (err) {
      console.error('[PaymentModal] Error checking payment:', err);
    } finally {
      setChecking(false);
    }
  }, [checking, onPaymentConfirmed]);

  useEffect(() => {
    generatePayment();
  }, [generatePayment]);

  useEffect(() => {
    if (paymentData?.qrcode_id) {
      console.log('[PaymentModal] Configurando intervalo de verificação para ID:', paymentData.qrcode_id);

      intervalRef.current = setInterval(() => {
        console.log('[PaymentModal] Executando verificação de pagamento a cada 3 segundos');
        checkPaymentStatus(paymentData.qrcode_id);
      }, 3000);

      return () => {
        if (intervalRef.current) {
          console.log('[PaymentModal] Limpando intervalo de verificação');
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [paymentData?.qrcode_id, checkPaymentStatus]);

  const copyToClipboard = () => {
    const pixCode = paymentData?.qr_code || paymentData?.qrcode;
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-8 border-2 border-pink-500/30 animate-fadeIn relative my-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 text-white">
          {title}
        </h2>
        <p className="text-gray-300 text-center mb-4 sm:mb-6 text-sm">
          {description}
        </p>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
            <p className="text-gray-300">Gerando QR Code...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="text-red-300 text-center">{error}</p>
            <button
              onClick={() => generatePayment()}
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {paymentData && !loading && (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-3 sm:p-4 rounded-xl text-center">
              <p className="text-xs sm:text-sm text-white/80 mb-1">Valor a pagar</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                R$ {amount.toFixed(2).replace('.', ',')}
              </p>
            </div>

            {(paymentData?.qr_code_base64 || paymentData?.qrcode_image) ? (
              <div className="bg-white p-2 sm:p-3 rounded-xl flex items-center justify-center">
                <img
                  src={(() => {
                    const imageData = paymentData?.qr_code_base64 || paymentData?.qrcode_image;
                    if (typeof imageData === 'string') {
                      return imageData.startsWith('data:') ? imageData : `data:image/png;base64,${imageData}`;
                    }
                    return imageData;
                  })()}
                  alt="QR Code PIX"
                  className="w-full max-w-[200px] sm:max-w-[240px] h-auto"
                  onLoad={() => console.log('[PaymentModal] QR Code carregado com sucesso')}
                  onError={(e) => {
                    console.error('[PaymentModal] Erro ao carregar imagem QR Code', e);
                  }}
                />
              </div>
            ) : (
              <div className="bg-gray-800 p-4 rounded-xl text-center text-gray-400 flex items-center justify-center min-h-[120px]">
                <p>QR Code não disponível</p>
              </div>
            )}

            {(paymentData?.qr_code || paymentData?.qrcode) ? (
              <div>
                <p className="text-xs sm:text-sm text-gray-300 mb-2 text-center font-semibold">
                  Ou copie o código PIX:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentData?.qr_code || paymentData?.qrcode || ''}
                    readOnly
                    className="flex-1 bg-gray-800/80 text-white px-2 sm:px-3 py-2 rounded-lg text-xs border border-gray-700 overflow-x-auto"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-3 sm:px-4 rounded-lg transition-all flex items-center gap-2 flex-shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 p-3 sm:p-4 rounded-xl text-center text-gray-400">
                <p className="text-sm">Código PIX não disponível</p>
              </div>
            )}

            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-spin flex-shrink-0" />
                <div>
                  <p className="text-yellow-300 font-semibold text-xs sm:text-sm">
                    Aguardando pagamento...
                  </p>
                  <p className="text-yellow-400/80 text-xs mt-0.5">
                    Detecção automática a cada 3 segundos
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-4 sm:mt-6">
          Pagamento processado via PushinPay
        </p>
      </div>
    </div>
  );
}
