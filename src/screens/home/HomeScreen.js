import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import XPProgressBar from '../../components/XPProgressBar';
import LevelBadge from '../../components/LevelBadge';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';

const CORRIDAS_TESTE = [
  { distanciaKm: 5.2,  duracaoSegundos: 1680, ritmoMedio: 5.4, xpGanho: 122, diasAtras: 1 },
  { distanciaKm: 3.1,  duracaoSegundos: 1020, ritmoMedio: 5.5, xpGanho: 73,  diasAtras: 3 },
  { distanciaKm: 8.0,  duracaoSegundos: 2700, ritmoMedio: 5.6, xpGanho: 205, diasAtras: 5 },
  { distanciaKm: 10.5, duracaoSegundos: 3540, ritmoMedio: 5.6, xpGanho: 282, diasAtras: 8 },
  { distanciaKm: 4.7,  duracaoSegundos: 1560, ritmoMedio: 5.5, xpGanho: 109, diasAtras: 10 },
  { distanciaKm: 6.3,  duracaoSegundos: 2100, ritmoMedio: 5.6, xpGanho: 151, diasAtras: 12 },
  { distanciaKm: 12.0, duracaoSegundos: 4200, ritmoMedio: 5.8, xpGanho: 324, diasAtras: 15 },
];

export default function HomeScreen({ navigation }) {
  const { userData, user, recarregarUsuario, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [seedLoading, setSeedLoading] = useState(false);

  async function inserirDadosTeste() {
    if (!user) return;
    setSeedLoading(true);
    try {
      let xpTotal = 0, kmTotal = 0;
      for (const c of CORRIDAS_TESTE) {
        const data = new Date();
        data.setDate(data.getDate() - c.diasAtras);
        await addDoc(collection(db, 'corridas'), {
          uid: user.uid,
          distanciaKm: c.distanciaKm,
          duracaoSegundos: c.duracaoSegundos,
          ritmoMedio: c.ritmoMedio,
          coordenadas: [],
          xpGanho: c.xpGanho,
          criadaEm: data,
        });
        xpTotal += c.xpGanho;
        kmTotal += c.distanciaKm;
      }
      await updateDoc(doc(db, 'users', user.uid), {
        xpTotal: increment(xpTotal),
        totalKm: increment(kmTotal),
        totalCorridas: increment(CORRIDAS_TESTE.length),
        sequenciaAtual: 3,
        maiorSequencia: 7,
        maiorDistancia: 12.0,
      });
      await recarregarUsuario();
      Alert.alert('✅ Dados inseridos!', `${CORRIDAS_TESTE.length} corridas adicionadas\n+${xpTotal} XP\n+${kmTotal.toFixed(1)} km`);
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setSeedLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.saudacao}>Olá, {userData?.nome?.split(' ')[0] || 'Corredor'}! 👋</Text>
          <Text style={styles.sub}>Pronto para correr hoje?</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.sair}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <LevelBadge xpTotal={userData?.xpTotal} />
        <View style={{ height: 16 }} />
        <XPProgressBar xpTotal={userData?.xpTotal} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{(userData?.totalKm || 0).toFixed(1)}</Text>
          <Text style={styles.statLabel}>km totais</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{userData?.totalCorridas || 0}</Text>
          <Text style={styles.statLabel}>corridas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{userData?.sequenciaAtual || 0}</Text>
          <Text style={styles.statLabel}>sequência 🔥</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.btnCorrer} onPress={() => navigation.navigate('RunTracking')}>
        <Text style={styles.btnCorrerText}>🏃 Iniciar Corrida</Text>
      </TouchableOpacity>

      {/* BOTÃO DE TESTE — remover após apresentação */}
      <TouchableOpacity style={styles.btnTeste} onPress={inserirDadosTeste} disabled={seedLoading}>
        <Text style={styles.btnTesteText}>{seedLoading ? 'Inserindo...' : '🧪 Inserir dados de teste'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  saudacao: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  sub: { color: '#888', fontSize: 14, marginTop: 2 },
  sair: { color: '#ff4444', fontSize: 14 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, alignItems: 'center' },
  statVal: { color: '#4CAF50', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 11, marginTop: 2 },
  btnCorrer: { backgroundColor: '#4CAF50', borderRadius: 16, padding: 20, alignItems: 'center' },
  btnCorrerText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  btnTeste: { marginTop: 12, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#444', borderStyle: 'dashed' },
  btnTesteText: { color: '#666', fontSize: 14 },
});
