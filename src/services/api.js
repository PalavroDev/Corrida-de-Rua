// Chamadas a API do Corrida de Rua (Amazon API Gateway + AWS Lambda).
// Toda chamada leva o token do Cognito; sem ele a API responde 401.
import { AWS_CONFIG } from '../config/aws';
import { obterIdToken } from './cognito';

export async function api(metodo, caminho, corpo) {
  const enviar = async (token) => fetch(`${AWS_CONFIG.apiUrl}${caminho}`, {
    method: metodo,
    headers: {
      Authorization: token || '',
      ...(corpo ? { 'Content-Type': 'application/json' } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  let resp = await enviar(await obterIdToken());
  if (resp.status === 401) {
    // token pode ter acabado de expirar: renova e tenta uma vez mais
    const novo = await obterIdToken(true);
    if (novo) resp = await enviar(novo);
  }

  const dados = await resp.json().catch(() => null);
  if (!resp.ok) {
    const erro = new Error(dados?.erro || dados?.message || `Erro ${resp.status}`);
    erro.status = resp.status;
    throw erro;
  }
  return dados;
}
