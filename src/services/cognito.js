// Comunicacao com o Amazon Cognito (cadastro, confirmacao, login e sessao).
// Usa a API HTTPS publica do Cognito com fetch, sem bibliotecas extras,
// entao funciona igual no Expo Go (celular) e no navegador (versao web).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AWS_CONFIG } from '../config/aws';

const ENDPOINT = `https://cognito-idp.${AWS_CONFIG.regiao}.amazonaws.com/`;
const CHAVE_SESSAO = 'corrida_de_rua_sessao';

async function chamar(acao, corpo) {
  const resp = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${acao}`,
    },
    body: JSON.stringify(corpo),
  });
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const erro = new Error(dados.message || 'Erro no Cognito');
    erro.code = (dados.__type || '').split('#').pop();
    throw erro;
  }
  return dados;
}

// ---------- Leitura do token (JWT) ----------
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64UrlDecode(texto) {
  const s = texto.replace(/-/g, '+').replace(/_/g, '/');
  let bits = 0, valor = 0;
  const bytes = [];
  for (const c of s) {
    const i = B64.indexOf(c);
    if (i < 0) continue;
    valor = (valor << 6) | i;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((valor >> bits) & 0xff);
    }
  }
  // decodifica UTF-8 (nomes com acento)
  let pct = '';
  for (const b of bytes) pct += '%' + b.toString(16).padStart(2, '0');
  return decodeURIComponent(pct);
}

export function lerToken(idToken) {
  return JSON.parse(base64UrlDecode(idToken.split('.')[1]));
}

// ---------- Sessao salva no aparelho ----------
async function salvarSessao(resultado, refreshAnterior) {
  const sessao = {
    idToken: resultado.IdToken,
    accessToken: resultado.AccessToken,
    refreshToken: resultado.RefreshToken || refreshAnterior,
    expiraEm: Date.now() + (resultado.ExpiresIn || 3600) * 1000,
  };
  await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  return sessao;
}

export async function carregarSessao() {
  const texto = await AsyncStorage.getItem(CHAVE_SESSAO);
  return texto ? JSON.parse(texto) : null;
}

export async function limparSessao() {
  await AsyncStorage.removeItem(CHAVE_SESSAO);
}

// ---------- Acoes ----------
export async function cadastrar(email, senha, nome, username) {
  return chamar('SignUp', {
    ClientId: AWS_CONFIG.clientId,
    Username: email.trim().toLowerCase(),
    Password: senha,
    UserAttributes: [
      { Name: 'email', Value: email.trim().toLowerCase() },
      { Name: 'name', Value: nome.trim() },
      { Name: 'preferred_username', Value: username.trim().toLowerCase() },
    ],
  });
}

export async function confirmarCadastro(email, codigo) {
  return chamar('ConfirmSignUp', {
    ClientId: AWS_CONFIG.clientId,
    Username: email.trim().toLowerCase(),
    ConfirmationCode: codigo.trim(),
  });
}

export async function reenviarCodigo(email) {
  return chamar('ResendConfirmationCode', {
    ClientId: AWS_CONFIG.clientId,
    Username: email.trim().toLowerCase(),
  });
}

export async function entrar(email, senha) {
  const r = await chamar('InitiateAuth', {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: AWS_CONFIG.clientId,
    AuthParameters: { USERNAME: email.trim().toLowerCase(), PASSWORD: senha },
  });
  if (!r.AuthenticationResult) throw new Error('Login nao concluido');
  return salvarSessao(r.AuthenticationResult);
}

async function renovar(sessao) {
  const r = await chamar('InitiateAuth', {
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: AWS_CONFIG.clientId,
    AuthParameters: { REFRESH_TOKEN: sessao.refreshToken },
  });
  return salvarSessao(r.AuthenticationResult, sessao.refreshToken);
}

// Devolve um token valido, renovando se estiver perto de expirar.
export async function obterIdToken(forcarRenovacao = false) {
  let sessao = await carregarSessao();
  if (!sessao) return null;
  if (forcarRenovacao || Date.now() > sessao.expiraEm - 60 * 1000) {
    try {
      sessao = await renovar(sessao);
    } catch (e) {
      await limparSessao();
      return null;
    }
  }
  return sessao.idToken;
}

export async function sair() {
  const sessao = await carregarSessao();
  await limparSessao();
  if (sessao?.accessToken) {
    // encerra a sessao tambem no Cognito; se falhar, o logout local ja vale
    chamar('GlobalSignOut', { AccessToken: sessao.accessToken }).catch(() => {});
  }
}

// Mensagens de erro em portugues
export function mensagemErro(e) {
  const mapa = {
    UsernameExistsException: 'Este e-mail já está cadastrado.',
    InvalidPasswordException: 'A senha precisa ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo.',
    InvalidParameterException: 'Dados inválidos. Confira o e-mail e a senha.',
    CodeMismatchException: 'Código de confirmação incorreto.',
    ExpiredCodeException: 'Código expirado. Peça um novo código.',
    NotAuthorizedException: 'E-mail ou senha incorretos.',
    UserNotFoundException: 'E-mail ou senha incorretos.',
    UserNotConfirmedException: 'Confirme seu e-mail antes de entrar.',
    LimitExceededException: 'Muitas tentativas. Aguarde alguns minutos.',
    TooManyRequestsException: 'Muitas tentativas. Aguarde alguns minutos.',
  };
  if (e?.message === 'Network request failed' || e?.message === 'Failed to fetch') return 'Sem conexão com a internet.';
  return mapa[e?.code] || e?.message || 'Erro desconhecido.';
}
