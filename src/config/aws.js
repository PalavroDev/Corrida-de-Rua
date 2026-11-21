// Configuracao da AWS usada pelo app.
// Estes valores sao IDs publicos (nao sao senhas). Podem ser sobrescritos
// pelas variaveis de ambiente EXPO_PUBLIC_* no Amplify ou num arquivo .env.
export const AWS_CONFIG = {
  regiao: 'us-east-1',
  userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID || 'us-east-1_tyHnZMvaJ',
  clientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID || '69luh6o563njlbtkghtb9um83o',
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://rdd8quj80i.execute-api.us-east-1.amazonaws.com',
};
