export const LEVELS = [
  { id: 'bronze',   name: 'Bronze',   minXP: 0,     maxXP: 999,      color: '#CD7F32', bgColor: '#3D2A1A', icon: '🥉', tier: 1 },
  { id: 'prata',    name: 'Prata',    minXP: 1000,  maxXP: 2999,     color: '#C0C0C0', bgColor: '#2A2A2A', icon: '🥈', tier: 2 },
  { id: 'ouro',     name: 'Ouro',     minXP: 3000,  maxXP: 6999,     color: '#FFD700', bgColor: '#2A2200', icon: '🥇', tier: 3 },
  { id: 'platina',  name: 'Platina',  minXP: 7000,  maxXP: 14999,    color: '#E5E4E2', bgColor: '#1A2A2A', icon: '💎', tier: 4 },
  { id: 'diamante', name: 'Diamante', minXP: 15000, maxXP: Infinity, color: '#B9F2FF', bgColor: '#001A2A', icon: '💠', tier: 5 },
];

export const XP_RULES = {
  POR_KM: 10,
  POR_MINUTO: 2,
  PRIMEIRA_CORRIDA_DIA: 30,
  META_DIARIA: 50,
  META_SEMANAL: 200,
  RECORDE_PESSOAL: 100,
  SEQUENCIA_3_DIAS: 75,
  SEQUENCIA_7_DIAS: 200,
  PRIMEIRO_CADASTRO: 100,
};

export function calcularXPCorrida(distanciaKm, duracaoMinutos, primeiraCorrida = false, recordePessoal = false) {
  const xpKm = Math.floor(distanciaKm * XP_RULES.POR_KM);
  const xpMinutos = Math.floor(duracaoMinutos * XP_RULES.POR_MINUTO);
  const xpPrimeira = primeiraCorrida ? XP_RULES.PRIMEIRA_CORRIDA_DIA : 0;
  const xpRecorde = recordePessoal ? XP_RULES.RECORDE_PESSOAL : 0;
  const total = xpKm + xpMinutos + xpPrimeira + xpRecorde;
  return { total, detalhamento: { porKm: xpKm, porMinuto: xpMinutos, primeiraCorrida: xpPrimeira, recordePessoal: xpRecorde } };
}

export function getNivelAtual(xpTotal) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xpTotal >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getProgressoNivel(xpTotal) {
  const nivel = getNivelAtual(xpTotal);
  if (nivel.maxXP === Infinity) return 100;
  const xpNoNivel = xpTotal - nivel.minXP;
  const xpNecessario = nivel.maxXP - nivel.minXP + 1;
  return Math.min(100, Math.floor((xpNoNivel / xpNecessario) * 100));
}

export function getXPParaProximoNivel(xpTotal) {
  const nivel = getNivelAtual(xpTotal);
  if (nivel.maxXP === Infinity) return null;
  return nivel.maxXP + 1 - xpTotal;
}
