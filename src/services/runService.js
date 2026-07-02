import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { calcularXPCorrida, XP_RULES } from '../constants/levels';

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcularDistanciaRota(coordenadas) {
  let total = 0;
  for (let i = 1; i < coordenadas.length; i++) {
    total += haversineKm(
      coordenadas[i - 1].latitude, coordenadas[i - 1].longitude,
      coordenadas[i].latitude, coordenadas[i].longitude
    );
  }
  return total;
}

export async function salvarCorrida(uid, dados) {
  const { distanciaKm, duracaoSegundos, coordenadas, ritmoMedio } = dados;
  const duracaoMinutos = duracaoSegundos / 60;

  // Verifica se é a primeira corrida do dia
  const hoje = new Date().toDateString();
  const userDoc = await getDoc(doc(db, 'users', uid));
  const userData = userDoc.data();
  const ultimaCorrida = userData?.ultimaCorrida?.toDate?.();
  const primeiraCorrida = !ultimaCorrida || ultimaCorrida.toDateString() !== hoje;

  // Verifica recorde pessoal
  const recordeAtual = userData?.maiorDistancia || 0;
  const recordePessoal = distanciaKm > recordeAtual;

  const { total: xpGanho, detalhamento } = calcularXPCorrida(distanciaKm, duracaoMinutos, primeiraCorrida, recordePessoal);

  // Salva a corrida
  const corridaRef = await addDoc(collection(db, 'corridas'), {
    uid,
    distanciaKm,
    duracaoSegundos,
    ritmoMedio,
    coordenadas,
    xpGanho,
    detalhamentoXP: detalhamento,
    criadaEm: serverTimestamp(),
  });

  // Atualiza dados do usuário
  const updates = {
    xpTotal: increment(xpGanho),
    totalKm: increment(distanciaKm),
    totalCorridas: increment(1),
    ultimaCorrida: serverTimestamp(),
  };

  if (recordePessoal) updates.maiorDistancia = distanciaKm;

  // Atualiza sequência
  const sequenciaAtual = userData?.sequenciaAtual || 0;
  const maiorSequencia = userData?.maiorSequencia || 0;
  if (primeiraCorrida) {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const corridaOntem = ultimaCorrida && ultimaCorrida.toDateString() === ontem.toDateString();
    const novaSequencia = corridaOntem ? sequenciaAtual + 1 : 1;
    updates.sequenciaAtual = novaSequencia;
    updates.maiorSequencia = Math.max(novaSequencia, maiorSequencia);

    // XP de sequência
    if (novaSequencia === 3) updates.xpTotal = increment(XP_RULES.SEQUENCIA_3_DIAS);
    if (novaSequencia === 7) updates.xpTotal = increment(XP_RULES.SEQUENCIA_7_DIAS);
  }

  await updateDoc(doc(db, 'users', uid), updates);

  return { corridaId: corridaRef.id, xpGanho, detalhamento, recordePessoal };
}
