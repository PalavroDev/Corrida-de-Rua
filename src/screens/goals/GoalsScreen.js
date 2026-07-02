import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { METAS_PADRAO } from '../../constants/goals';

function calcularProgresso(meta, userData) {
  switch (meta.tipo) {
    case 'km_total':    return Math.min(userData?.totalKm || 0, meta.meta);
    case 'corridas':    return Math.min(userData?.totalCorridas || 0, meta.meta);
    case 'sequencia':   return Math.min(userData?.maiorSequencia || 0, meta.meta);
    default:            return 0;
  }
}

export default function GoalsScreen() {
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { paddingTop: insets.top + 16 }]}>🎯 Metas & Conquistas</Text>
      <FlatList
        data={METAS_PADRAO}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const progresso = calcularProgresso(item, userData);
          const pct = Math.min(100, Math.floor((progresso / item.meta) * 100));
          const concluida = pct >= 100;
          return (
            <View style={[styles.card, concluida && styles.cardDone]}>
              <View style={styles.row}>
                <Text style={styles.icone}>{item.icone}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tituloMeta}>{item.titulo}</Text>
                  <Text style={styles.descricao}>{item.descricao}</Text>
                </View>
                <Text style={styles.xpTag}>+{item.xpRecompensa} XP</Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${pct}%` }, concluida && styles.barDone]} />
              </View>
              <Text style={styles.progTexto}>{concluida ? '✅ Concluída!' : `${progresso.toFixed?.(progresso % 1 ? 1 : 0) || progresso} / ${item.meta} (${pct}%)`}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  titulo: { color: '#fff', fontSize: 22, fontWeight: 'bold', paddingHorizontal: 20, paddingBottom: 8 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, marginBottom: 10 },
  cardDone: { borderWidth: 1, borderColor: '#4CAF50' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  icone: { fontSize: 24, marginRight: 10 },
  tituloMeta: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  descricao: { color: '#888', fontSize: 12, marginTop: 2 },
  xpTag: { color: '#4CAF50', fontWeight: 'bold', fontSize: 13 },
  barBg: { height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: '100%', backgroundColor: '#2196F3', borderRadius: 3 },
  barDone: { backgroundColor: '#4CAF50' },
  progTexto: { color: '#888', fontSize: 11 },
});
