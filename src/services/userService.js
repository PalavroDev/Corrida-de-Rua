// Operacoes de usuarios, agora pela API na AWS (antes: Firestore).
import { api } from './api';

export async function buscarUsuarioPorId(uid) {
  try {
    return await api('GET', `/usuarios/${encodeURIComponent(uid)}`);
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

// O uid de quem segue vem do token, por isso o primeiro parametro nao e enviado.
export async function seguirUsuario(_meuUid, alvoUid) {
  await api('POST', `/usuarios/${encodeURIComponent(alvoUid)}/seguir`);
}

export async function deixarDeSeguir(_meuUid, alvoUid) {
  await api('DELETE', `/usuarios/${encodeURIComponent(alvoUid)}/seguir`);
}

export async function buscarRanking(limite = 20) {
  return api('GET', `/ranking?limite=${limite}`);
}

export async function buscarUsuariosPorNome(termo) {
  return api('GET', `/usuarios?busca=${encodeURIComponent(termo)}`);
}

export async function editarPerfil(nome, username) {
  return api('PUT', '/usuarios/me', { nome, username });
}
