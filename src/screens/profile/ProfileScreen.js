import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import LevelBadge from '../../components/LevelBadge';
import XPProgressBar from '../../components/XPProgressBar';
import { db } from '../../config/firebase';

export default function ProfileScreen() {
  const { userData, user, recarregarUsuario, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoUsername, setNovoUsername] = useState('');
  const [salvando, setSalvando] = useState(false);

  function abrirEdicao() {
    setNovoNome(userData?.nome || '');
    setNovoUsername(userData?.username || '');
    setModalVisible(true);
  }

  async function salvarEdicao() {
    if (!novoNome.trim() || !novoUsername.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    const usernameLower = novoUsername.toLowerCase().trim();
    setSalvando(true);
    try {
      // Verificar se username já existe (se mudou)
      if (usernameLower !== userData?.username) {
        const q = query(collection(db, 'users'), where('username', '==', usernameLower));
        const snap = await getDocs(q);
        if (!snap.empty) {
          Alert.alert('Erro', 'Este username já está em uso');
          setSalvando(false);
          return;
        }
      }
      await updateDoc(doc(db, 'users', user.uid), {
        nome: novoNome.trim(),
        username: usernameLower,
      });
      await recarregarUsuario();
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      {/* Cabeçalho: nome + seguidores/seguindo */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetra}>
              {(userData?.nome || '?')[0].toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.nome}>{userData?.nome}</Text>
            <Text style={styles.username}>@{userData?.username}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnEditar} onPress={abrirEdicao}>
          <Text style={styles.btnEditarText}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>

      {/* Seguidores / Seguindo / Corridas */}
      <View style={styles.socialRow}>
        <View style={styles.socialItem}>
          <Text style={styles.socialVal}>{userData?.seguidores?.length || 0}</Text>
          <Text style={styles.socialLabel}>Seguidores</Text>
        </View>
        <View style={styles.socialDivider} />
        <View style={styles.socialItem}>
          <Text style={styles.socialVal}>{userData?.seguindo?.length || 0}</Text>
          <Text style={styles.socialLabel}>Seguindo</Text>
        </View>
        <View style={styles.socialDivider} />
        <View style={styles.socialItem}>
          <Text style={styles.socialVal}>{userData?.totalCorridas || 0}</Text>
          <Text style={styles.socialLabel}>Corridas</Text>
        </View>
      </View>

      {/* Nível e XP */}
      <View style={styles.card}>
        <LevelBadge xpTotal={userData?.xpTotal} />
        <View style={{ height: 14 }} />
        <XPProgressBar xpTotal={userData?.xpTotal} />
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {[
          { label: 'Total de km',      val: `${(userData?.totalKm || 0).toFixed(1)} km` },
          { label: 'XP Total',         val: `${userData?.xpTotal || 0} XP` },
          { label: 'Maior sequência',  val: `${userData?.maiorSequencia || 0} dias` },
          { label: 'Maior distância',  val: `${(userData?.maiorDistancia || 0).toFixed(1)} km` },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statVal}>{s.val}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.btnSair} onPress={logout}>
        <Text style={styles.btnSairText}>Sair da Conta</Text>
      </TouchableOpacity>

      {/* Modal de edição */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Editar Perfil</Text>
            <Text style={styles.modalLabel}>Nome</Text>
            <TextInput
              style={styles.modalInput}
              value={novoNome}
              onChangeText={setNovoNome}
              placeholder="Seu nome"
              placeholderTextColor="#555"
            />
            <Text style={styles.modalLabel}>Username</Text>
            <TextInput
              style={styles.modalInput}
              value={novoUsername}
              onChangeText={setNovoUsername}
              placeholder="seu_username"
              placeholderTextColor="#555"
              autoCapitalize="none"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={salvarEdicao} disabled={salvando}>
                <Text style={styles.modalBtnSalvarText}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2a2a2a', borderWidth: 2, borderColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  avatarLetra: { color: '#4CAF50', fontSize: 24, fontWeight: 'bold' },
  nome: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  username: { color: '#888', fontSize: 13, marginTop: 2 },
  btnEditar: { backgroundColor: '#1a1a1a', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#333' },
  btnEditarText: { color: '#aaa', fontSize: 13 },

  socialRow: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, marginBottom: 16, justifyContent: 'space-around', alignItems: 'center' },
  socialItem: { alignItems: 'center', flex: 1 },
  socialVal: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  socialLabel: { color: '#888', fontSize: 11, marginTop: 2 },
  socialDivider: { width: 1, height: 32, backgroundColor: '#333' },

  card: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, marginBottom: 16 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { width: '47%', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14 },
  statVal: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 2 },

  btnSair: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  btnSairText: { color: '#ff4444', fontWeight: 'bold', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitulo: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  modalLabel: { color: '#888', fontSize: 13, marginBottom: 6 },
  modalInput: { backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtnCancelar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#1a1a1a', alignItems: 'center' },
  modalBtnCancelarText: { color: '#888', fontWeight: 'bold' },
  modalBtnSalvar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#4CAF50', alignItems: 'center' },
  modalBtnSalvarText: { color: '#fff', fontWeight: 'bold' },
});
