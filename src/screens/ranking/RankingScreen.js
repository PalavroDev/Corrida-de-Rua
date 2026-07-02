import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import UserCard from '../../components/UserCard';
import { useNavigation } from '@react-navigation/native';

export default function RankingScreen() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('xpTotal', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snap) => {
      const dados = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRanking(dados);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

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
