import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buscarRanking } from '../../services/userService';
import UserCard from '../../components/UserCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function RankingScreen() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [atualizando, setAtualizando] = useState(false);

  async function carregar() {
    try {
      setRanking(await buscarRanking(20));
    } catch (e) {
      console.error('Erro ao carregar ranking:', e);
    } finally {
      setLoading(false);
      setAtualizando(false);
    }
  }

  // Recarrega sempre que a tela do ranking for aberta
  useFocusEffect(useCallback(() => { carregar(); }, []));

  if (loading) return <View style={styles.center}><ActivityIndicator color="#4CAF50" size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { paddingTop: insets.top + 16 }]}>🏆 Ranking Global</Text>
      <FlatList
        data={ranking}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <UserCard
            usuario={item}
            posicao={index}
            onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }} tintColor="#4CAF50" />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum corredor ainda</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  titulo: { color: '#fff', fontSize: 22, fontWeight: 'bold', paddingHorizontal: 20, paddingBottom: 8 },
  center: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#555', textAlign: 'center', marginTop: 40 },
});
