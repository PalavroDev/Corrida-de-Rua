import React, { createContext, useContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { XP_RULES } from '../constants/levels';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await carregarDadosUsuario(firebaseUser.uid);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function carregarDadosUsuario(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setUserData(docSnap.data());
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }

  async function cadastrar(email, senha, nome, username) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const { uid } = userCredential.user;
    const novoUsuario = {
      uid, nome, username: username.toLowerCase(), email,
      xpTotal: XP_RULES.PRIMEIRO_CADASTRO,
      corridas: [], totalKm: 0, totalCorridas: 0,
      sequenciaAtual: 0, maiorSequencia: 0,
      seguidores: [], seguindo: [], conquistas: [],
      criadoEm: serverTimestamp(), fotoURL: null,
    };
    await setDoc(doc(db, 'users', uid), novoUsuario);
    setUserData(novoUsuario);
    return userCredential;
  }

  async function login(email, senha) {
    return signInWithEmailAndPassword(auth, email, senha);
  }

  async function logout() {
    await signOut(auth);
  }

  async function recarregarUsuario() {
    if (user) await carregarDadosUsuario(user.uid);
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, cadastrar, login, logout, recarregarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
