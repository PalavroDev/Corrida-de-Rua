import { api } from './api';

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

// Salva a corrida na AWS. O calculo de XP, sequencia e recorde e feito na Lambda,
// o trajeto GPS vai para o S3 e os numeros para o DynamoDB.
export async function salvarCorrida(_uid, dados) {
  const { distanciaKm, duracaoSegundos, coordenadas, ritmoMedio } = dados;
  return api('POST', '/corridas', { distanciaKm, duracaoSegundos, ritmoMedio, coordenadas });
}

export async function listarMinhasCorridas() {
  return api('GET', '/corridas');
}

// Insere 7 corridas de exemplo (botao de dados de teste da tela inicial)
export async function inserirCorridasTeste() {
  return api('POST', '/corridas/teste');
}
