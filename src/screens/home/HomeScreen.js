import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import XPProgressBar from '../../components/XPProgressBar';
import LevelBadge from '../../components/LevelBadge';
import { inserirCorridasTeste } from '../../services/runService';

export default function HomeScreen({ navigation }) {
  const { userData, user, recarregarUsuario, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [seedLoading, setSeedLoading] = useState(false);

  async function inserirDadosTeste() {
    if (!user) return;
    setSeedLoading(true);
    try {
      const r = await inserirCorridasTeste();
      await recarregarUsuario();
      Alert.alert('✅ Dados inseridos!', `${r.corridas} corridas adicionadas\n+${r.xpGanho} XP`);
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
