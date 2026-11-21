import React, { createContext, useContext, useEffect, useState } from 'react';
import * as cognito from '../services/cognito';
import { api } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { uid, email } vindo do token do Cognito
  const [userData, setUserData] = useState(null); // perfil guardado no DynamoDB
  const [loading, setLoading] = useState(true);

  // Ao abrir o app, recupera a sessao salva (se houver)
  useEffect(() => {
    (async () => {
      try {
        const token = await cognito.obterIdToken();
        if (token) await iniciarSessao(token);
      } catch (e) {
        console.error('Erro ao restaurar sessão:', e);
        await cognito.limparSessao();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function iniciarSessao(idToken) {
    const claims = cognito.lerToken(idToken);
    const perfil = await api('GET', '/usuarios/me'); // cria o perfil no primeiro acesso
    setUserData(perfil);
    setUser({ uid: claims.sub, email: claims.email });
  }

  // Passo 1 do cadastro: cria a conta no Cognito e envia o codigo por e-mail
  async function cadastrar(email, senha, nome, username) {
    await cognito.cadastrar(email, senha, nome, username);
  }

  // Passo 2 do cadastro: confirma o codigo e ja entra no app
  async function confirmarCadastro(email, codigo, senha) {
    await cognito.confirmarCadastro(email, codigo);
    if (senha) await login(email, senha);
  }

  async function reenviarCodigo(email) {
    await cognito.reenviarCodigo(email);
  }

  async function login(email, senha) {
    const sessao = await cognito.entrar(email, senha);
    await iniciarSessao(sessao.idToken);
  }

  async function logout() {
    await cognito.sair();
    setUser(null);
    setUserData(null);
  }

  async function recarregarUsuario() {
    if (!user) return;
    try {
      setUserData(await api('GET', '/usuarios/me'));
    } catch (e) {
      console.error('Erro ao carregar dados do usuário:', e);
    }
  }

  return (
    <AuthContext.Provider value={{
      user, userData, loading, cadastrar, confirmarCadastro, reenviarCodigo, login, logout, recarregarUsuario,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
