import { doc, updateDoc, getDoc, collection, query, where, getDocs, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function buscarUsuarioPorUsername(username) {
  const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function buscarUsuarioPorId(uid) {
  const docSnap = await getDoc(doc(db, 'users', uid));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function seguirUsuario(meuUid, alvoUid) {
  await updateDoc(doc(db, 'users', meuUid), { seguindo: arrayUnion(alvoUid) });
  await updateDoc(doc(db, 'users', alvoUid), { seguidores: arrayUnion(meuUid) });
}

export async function deixarDeSeguir(meuUid, alvoUid) {
  await updateDoc(doc(db, 'users', meuUid), { seguindo: arrayRemove(alvoUid) });
  await updateDoc(doc(db, 'users', alvoUid), { seguidores: arrayRemove(meuUid) });
}

export async function adicionarXP(uid, xp) {
  await updateDoc(doc(db, 'users', uid), {
    xpTotal: increment(xp),
  });
}

export async function buscarRanking(limite = 20) {
  const q = query(collection(db, 'users'));
  const snap = await getDocs(q);
  const usuarios = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return usuarios.sort((a, b) => (b.xpTotal || 0) - (a.xpTotal || 0)).slice(0, limite);
}

export async function buscarUsuariosPorNome(termo) {
  const snap = await getDocs(collection(db, 'users'));
  const termoLower = termo.toLowerCase();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => u.nome?.toLowerCase().includes(termoLower) || u.username?.toLowerCase().includes(termoLower));
}
