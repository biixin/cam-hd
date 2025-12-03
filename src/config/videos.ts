// Configuração de vídeos da aplicação
// Edite aqui para alterar os vídeos utilizados no site

export const VIDEO_CONFIG = {
  // Primeiro vídeo - Live principal (gratuito por 10-15 segundos)
  mainVideo: {
    url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=live-hd.mp4&version_id=null',
    freeTimeSeconds: 50,
  },

  // Segundo vídeo - Sala privada (após pagamento)
  privateRoomVideo: {
    url: 'https://console-typebot-minio.kjufc9.easypanel.host/api/v1/buckets/hot-mj/objects/download?preview=true&prefix=heldy-cam01.mp4&version_id=null',
  },
};

// Configuração de preços
export const PRICING_CONFIG = {
  freeTimePayment: 5.90,
  privateRoomPayment: 14.90,
};

// Nome da modelo
export const MODEL_NAME = 'Ana';

// Mensagens da modelo
export const MODEL_MESSAGES = [
  'Oi bebês! Como vocês estão?',
  'Adorando estar com vocês hoje',
  'Me digam o que vocês querem ver...',
  'Quem quer um show privado?',
  'Vocês são incríveis!',
  'Estou me sentindo tão sexy hoje...',
  'Adoro quando vocês me mimam',
];

// Mensagens dos usuários fake
export const FAKE_USER_MESSAGES = [
  'você é gostosa demais',
  'goza pra gente',
  'lindaaaaaa',
  'te amoo',
  'casa cmg amor',
  'meu deuus',
  'como faz pra gente ir sala privada?',
  'seus peitos são maravilhosos',
  'amorr mostra essa rabinha',
  'geme mais pra mim vida',
  'perfeita demais',
  'que mulher incrível',
  'to apaixonado',
  'show de bola',
  'maravilhosa',
  'que delicia',
  'sensacional',
  'top demais',
  'muito gata',
  'uau queshow',
];

// Nomes dos usuários fake
export const FAKE_USER_NICKNAMES = [
  'pedrokx',
  'miguellz',
  'ferreira98',
  'jorginho21',
  'carlosbs',
  'rafaelx',
  'thiagogz',
  'brunofm',
  'lucaspt',
  'rodrigosk',
  'gustavox',
  'felipe_rj',
  'marcelosp',
  'andrebh',
  'vicentebr',
  'paulinhosp',
  'ricardorj',
  'fabiogg',
  'danielrs',
  'leandromg',
];
