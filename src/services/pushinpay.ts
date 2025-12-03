const PUSHINPAY_API_URL = 'https://api.pushinpay.com.br/api';
const PUSHINPAY_TOKEN = '42250|dZUNZXVMH5HzfyTfZIwVUQkbB2iPQj31pymNywGm8981c9cf';

interface CreatePixPaymentRequest {
  value: number;
  name: string;
  email: string;
}

interface CreatePixPaymentResponse {
  qrcode_image: string;
  qrcode: string;
  qrcode_id: string;
}

interface CheckPaymentStatusResponse {
  qrcode_status: string;
}

export async function createPixPayment(amount: number): Promise<CreatePixPaymentResponse> {
  const randomId = Math.random().toString(36).substring(7);

  const payload: CreatePixPaymentRequest = {
    value: amount,
    name: `Cliente ${randomId}`,
    email: `cliente${randomId}@example.com`
  };

  const response = await fetch(`${PUSHINPAY_API_URL}/pix/cashIn`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Erro ao criar pagamento PIX');
  }

  const data = await response.json();
  console.log('Resposta PushinPay:', data);

  return {
    qrcode_image: data.qr_code_base64,
    qrcode: data.qr_code,
    qrcode_id: data.id
  };
}

export async function checkPaymentStatus(qrcodeId: string): Promise<CheckPaymentStatusResponse> {
  console.log('=== INICIANDO VERIFICAÇÃO DE PAGAMENTO ===');
  console.log('URL:', `${PUSHINPAY_API_URL}/transactions/${qrcodeId}`);
  console.log('QR Code ID:', qrcodeId);

  const response = await fetch(`${PUSHINPAY_API_URL}/transactions/${qrcodeId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
      'Accept': 'application/json'
    }
  });

  console.log('Status da resposta:', response.status);
  console.log('Status OK:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro na resposta:', errorText);
    throw new Error('Erro ao verificar status do pagamento');
  }

  const data = await response.json();
  console.log('=== RESPOSTA COMPLETA DA API ===');
  console.log(JSON.stringify(data, null, 2));
  console.log('Status do pagamento:', data.qrcode_status || data.status || 'status não encontrado');
  console.log('=== FIM DA VERIFICAÇÃO ===');

  return data;
}
