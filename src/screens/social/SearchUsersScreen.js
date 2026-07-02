import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buscarUsuariosPorNome } from '../../services/userService';
import UserCard from '../../components/UserCard';
import { useNavigation } from '@react-navigation/native';

export default function SearchUsersScreen() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  async function buscar() {
    if (!termo.trim()) return;
    setLoading(true);
    setBuscou(true);
    const res = await buscarUsuariosPorNome(termo.trim());
    setResultados(res);
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { paddingTop: insets.top + 16 }]}>🔍 Buscar Corredores</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Nome ou @username"
          placeholderTextColor="#666"
          value={termo}
          onChangeText={setTermo}
          onSubmitEditing={buscar}
          returnKeyType="search"
        />
      </View>
      {loading && <ActivityIndicator color="#4CAF50" style={{ marginTop: 20 }} />}
      {buscou && !loading && (
        <FlatList
          data={resultados}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <UserCard usuario={item} onPress={() => navigation.navigate('UserProfile', { userId: item.id })} />
          )}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum usuário encontrado</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  titulo: { color: '#fff', fontSize: 22, fontWeight: 'bold', paddingHorizontal: 20, paddingBottom: 12 },
  row: { paddingHorizontal: 16 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 10, padding: 12, fontSize: 16 },
  empty: { color: '#555', textAlign: 'center', marginTop: 40 },
});
