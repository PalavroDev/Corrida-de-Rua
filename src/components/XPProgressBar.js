import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getNivelAtual, getProgressoNivel, getXPParaProximoNivel } from '../constants/levels';

export default function XPProgressBar({ xpTotal }) {
  const nivel = getNivelAtual(xpTotal || 0);
  const progresso = getProgressoNivel(xpTotal || 0);
  const xpRestante = getXPParaProximoNivel(xpTotal || 0);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: nivel.color }]}>{nivel.name}</Text>
        <Text style={styles.xp}>{xpTotal || 0} XP</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${progresso}%`, backgroundColor: nivel.color }]} />
      </View>
      {xpRestante !== null && (
        <Text style={styles.restante}>{xpRestante} XP para o próximo nível</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontWeight: 'bold', fontSize: 14 },
  xp: { color: '#aaa', fontSize: 13 },
  barBg: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  restante: { color: '#666', fontSize: 11, marginTop: 4, textAlign: 'right' },
});
