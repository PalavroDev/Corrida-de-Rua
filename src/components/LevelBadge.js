import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getNivelAtual } from '../constants/levels';

export default function LevelBadge({ xpTotal, size = 'md' }) {
  const nivel = getNivelAtual(xpTotal || 0);
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: nivel.bgColor, borderColor: nivel.color }, isSmall && styles.badgeSm]}>
      <Text style={[styles.icon, isSmall && styles.iconSm]}>{nivel.icon}</Text>
      <Text style={[styles.nome, { color: nivel.color }, isSmall && styles.nomeSm]}>{nivel.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' },
  badgeSm: { paddingHorizontal: 6, paddingVertical: 2 },
  icon: { fontSize: 16, marginRight: 4 },
  iconSm: { fontSize: 12 },
  nome: { fontSize: 14, fontWeight: 'bold' },
  nomeSm: { fontSize: 11 },
});
