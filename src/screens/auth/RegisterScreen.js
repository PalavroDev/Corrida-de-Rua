import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { cadastrar } = useAuth();

  async function handleCadastro() {
    if (!nome || !username || !email || !senha) { Alert.alert('Erro', 'Preencha todos os campos'); return; }
    if (senha.length < 6) { Alert.alert('Erro', 'Senha deve ter no mínimo 6 caracteres'); return; }
    setLoading(true);
    try {
      await cadastrar(email, senha, nome, username);
    } catch (e) {
      console.error('Erro cadastro:', e.code, e.message);
      const msg = e.code === 'auth/email-already-in-use'
        ? 'Este email já está em uso'
        : e.code === 'auth/invalid-email'
        ? 'Email inválido'
        : e.code === 'auth/weak-password'
        ? 'Senha muito fraca'
        : e.code === 'auth/network-request-failed'
        ? 'Sem conexão com a internet'
        : e.code === 'auth/operation-not-allowed'
        ? 'Login com email não está habilitado no Firebase Console'
        : `${e.code || 'Erro desconhecido'}: ${e.message}`;
      Alert.alert('Erro ao criar conta', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>🏃 Criar Conta</Text>
        <Text style={styles.subtitulo}>Comece sua jornada hoje!</Text>
        <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor="#666" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Username (ex: joao123)" placeholderTextColor="#666" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#666" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha (mín. 6 caracteres)" placeholderTextColor="#666" value={senha} onChangeText={setSenha} secureTextEntry />
        <TouchableOpacity style={styles.btn} onPress={handleCadastro} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Criando conta...' : 'Criar Conta'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Já tem conta? <Text style={styles.linkBold}>Faça login</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { justifyContent: 'center', padding: 24, flexGrow: 1 },
  titulo: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitulo: { color: '#888', fontSize: 15, textAlign: 'center', marginBottom: 28 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16 },
  btn: { backgroundColor: '#4CAF50', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#888', textAlign: 'center', marginTop: 20 },
  linkBold: { color: '#4CAF50', fontWeight: 'bold' },
});
