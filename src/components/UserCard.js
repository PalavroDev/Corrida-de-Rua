import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LevelBadge from './LevelBadge';

export default function UserCard({ usuario, onPress, posicao }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {posicao !== undefined && (
        <Text style={styles.posicao}>#{posicao + 1}</Text>
      )}
      <View style={styles.info}>
        <Text style={styles.nome}>{usuario.nome}</Text>
        <Text style={styles.username}>@{usuario.username}</Text>
        <LevelBadge xpTotal={usuario.xpTotal} size="sm" />
      </View>
      <View style={styles.stats}>
        <Text style={styles.xp}>{usuario.xpTotal || 0} XP</Text>
        <Text style={styles.km}>{(usuario.totalKm || 0).toFixed(1)} km</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 8 },
  posicao: { color: '#FFD700', fontWeight: 'bold', fontSize: 18, width: 36, textAlign: 'center' },
  info: { flex: 1, marginLeft: 8 },
  nome: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  username: { color: '#888', fontSize: 12, marginBottom: 4 },
  stats: { alignItems: 'flex-end' },
  xp: { color: '#4CAF50', fontWeight: 'bold', fontSize: 14 },
  km: { color: '#aaa', fontSize: 12 },
});
