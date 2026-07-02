import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBOit_u_yhGPLDti4PxArD8K51bd7i8EeU",
  authDomain: "app-hibrido-c3935.firebaseapp.com",
  projectId: "app-hibrido-c3935",
  storageBucket: "app-hibrido-c3935.firebasestorage.app",
  messagingSenderId: "783782078120",
  appId: "1:783782078120:web:60ba6ee9aabb666964c49d",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export default app;
