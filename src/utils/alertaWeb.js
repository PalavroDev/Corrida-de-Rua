// No navegador, o Alert.alert do React Native nao mostra nada.
// Este arquivo faz os alertas aparecerem na versao web usando window.alert/confirm.
import { Alert, Platform } from 'react-native';

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  Alert.alert = (titulo, mensagem, botoes) => {
    const texto = [titulo, mensagem].filter(Boolean).join('\n\n');
    if (!botoes || botoes.length <= 1) {
      window.alert(texto);
      botoes?.[0]?.onPress?.();
      return;
    }
    const confirmar = botoes.find(b => b.style !== 'cancel');
    const cancelar = botoes.find(b => b.style === 'cancel');
    if (window.confirm(texto)) confirmar?.onPress?.();
    else cancelar?.onPress?.();
  };
}
