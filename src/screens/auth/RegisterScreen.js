import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { mensagemErro } from '../../services/cognito';

export default function RegisterScreen({ navigation, route }) {
  const emailPendente = route?.params?.emailPendente;
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(emailPendente || '');
  const [senha, setSenha] = useState('');
  const [codigo, setCodigo] = useState('');
  const [etapa, setEtapa] = useState(emailPendente ? 'codigo' : 'dados'); // dados | codigo
  const [loading, setLoading] = useState(false);
  const { cadastrar, confirmarCadastro, reenviarCodigo } = useAuth();

  const senhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  async function handleCadastro() {
    if (!nome || !username || !email || !senha) { Alert.alert('Erro', 'Preencha todos os campos'); return; }
    if (!senhaForte.test(senha)) {
      Alert.alert('Senha fraca', 'Use no mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo.');
      return;
    }
    setLoading(true);
    try {
      await cadastrar(email, senha, nome, username);
      setEtapa('codigo');
      Alert.alert('Confira seu e-mail', `Enviamos um código de confirmação para ${email}.`);
    } catch (e) {
      Alert.alert('Erro ao criar conta', mensagemErro(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmar() {
    if (!codigo) { Alert.alert('Erro', 'Digite o código recebido por e-mail'); return; }
    setLoading(true);
    try {
      await confirmarCadastro(email, codigo, senha); // com senha: confirma e ja entra no app
      if (!senha) {
        Alert.alert('E-mail confirmado!', 'Agora faça login com sua senha.');
        navigation.navigate('Login');
      }
    } catch (e) {
      Alert.alert('Erro', mensagemErro(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviar() {
    try {
      await reenviarCodigo(email);
      Alert.alert('Código reenviado', `Confira a caixa de entrada de ${email}.`);
    } catch (e) {
      Alert.alert('Erro', mensagemErro(e));
    }
  }

  if (etapa === 'codigo') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>📧 Confirme seu e-mail</Text>
          <Text style={styles.subtitulo}>Digite o código de 6 dígitos enviado para {email}</Text>
          <TextInput style={styles.input} placeholder="Código" placeholderTextColor="#666" value={codigo} onChangeText={setCodigo} keyboardType="number-pad" maxLength={6} />
          <TouchableOpacity style={styles.btn} onPress={handleConfirmar} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Confirmando...' : 'Confirmar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReenviar}>
            <Text style={styles.link}>Não recebeu? <Text style={styles.linkBold}>Reenviar código</Text></Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Voltar para o login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>🏃 Criar Conta</Text>
        <Text style={styles.subtitulo}>Comece sua jornada hoje!</Text>
        <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor="#666" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Username (ex: joao123)" placeholderTextColor="#666" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#666" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#666" value={senha} onChangeText={setSenha} secureTextEntry />
        <Text style={styles.dica}>Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo (ex: Corrida@2026)</Text>
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
  dica: { color: '#888', fontSize: 12, marginTop: -4, marginBottom: 12 },
});
