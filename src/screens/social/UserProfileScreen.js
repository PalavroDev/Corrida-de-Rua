import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { buscarUsuarioPorId, seguirUsuario, deixarDeSeguir } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import LevelBadge from '../../components/LevelBadge';
import XPProgressBar from '../../components/XPProgressBar';

export default function UserProfileScreen({ route }) {
  const { userId } = route.params;
  const { user, userData, recarregarUsuario } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isSeguindo = userData?.seguindo?.includes(userId);
  const isMe = user?.uid === userId;

  useEffect(() => {
    buscarUsuarioPorId(userId).then(p => { setPerfil(p); setLoading(false); });
  }, [userId]);

  async function toggleSeguir() {
    setActionLoading(true);
    if (isSeguindo) {
      await deixarDeSeguir(user.uid, userId);
    } else {
      await seguirUsuario(user.uid, userId);
    }
    await recarregarUsuario();
    const atualizado = await buscarUsuarioPorId(userId);
    setPerfil(atualizado);
    setActionLoading(false);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color="#4CAF50" size="large" /></View>;
  if (!perfil) return <View style={styles.center}><Text style={styles.erro}>Usuário não encontrado</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.nome}>{perfil.nome}</Text>
      <Text style={styles.username}>@{perfil.username}</Text>
      <LevelBadge xpTotal={perfil.xpTotal} />
      <View style={{ height: 16 }} />
      <XPProgressBar xpTotal={perfil.xpTotal} />
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statVal}>{(perfil.totalKm || 0).toFixed(1)}</Text><Text style={styles.statLabel}>km</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>{perfil.totalCorridas || 0}</Text><Text style={styles.statLabel}>corridas</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>{perfil.seguidores?.length || 0}</Text><Text style={styles.statLabel}>seguidores</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>{perfil.seguindo?.length || 0}</Text><Text style={styles.statLabel}>seguindo</Text></View>
      </View>
      {!isMe && (
        <TouchableOpacity style={[styles.btn, isSeguindo ? styles.btnUnfollow : styles.btnFollow]} onPress={toggleSeguir} disabled={actionLoading}>
          <Text style={styles.btnText}>{actionLoading ? '...' : isSeguindo ? 'Deixar de Seguir' : 'Seguir'}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 24 },
  center: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  nome: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  username: { color: '#888', fontSize: 15, marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginVertical: 20 },
  stat: { alignItems: 'center' },
  statVal: { color: '#4CAF50', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 11, marginTop: 2 },
  btn: { borderRadius: 12, padding: 14, alignItems: 'center' },
  btnFollow: { backgroundColor: '#4CAF50' },
  btnUnfollow: { backgroundColor: '#333', borderWidth: 1, borderColor: '#555' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  erro: { color: '#888' },
});
