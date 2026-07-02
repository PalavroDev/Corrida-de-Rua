import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { calcularDistanciaRota, salvarCorrida } from '../../services/runService';

const { height } = Dimensions.get('window');

export default function RunTrackingScreen({ navigation }) {
  const { user, recarregarUsuario } = useAuth();
  const insets = useSafeAreaInsets();

  const [status, setStatus] = useState('idle'); // idle | running | paused | finished
  const [coordenadas, setCoordenadas] = useState([]);
  const [posicaoAtual, setPosicaoAtual] = useState(null);
  const [distanciaKm, setDistanciaKm] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState(null); // dados do resumo final

  const watchRef = useRef(null);
  const timerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Pega posição inicial para centralizar o mapa antes de iniciar
    (async () => {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setPosicaoAtual({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
    })();

    return () => {
      watchRef.current?.remove();
      clearInterval(timerRef.current);
    };
  }, []);

  // Centraliza o mapa na posição atual conforme o usuário se move
  useEffect(() => {
    if (posicaoAtual && mapRef.current && status === 'running') {
      mapRef.current.animateToRegion({
        ...posicaoAtual,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      }, 500);
    }
  }, [posicaoAtual]);

  async function iniciarCorrida() {
    const { status: perm } = await Location.requestForegroundPermissionsAsync();
    if (perm !== 'granted') { Alert.alert('Permissão negada', 'Precisamos de acesso à localização'); return; }

    setCoordenadas([]);
    setDistanciaKm(0);
    setSegundos(0);
    setResultado(null);
    setStatus('running');

    timerRef.current = setInterval(() => setSegundos(s => s + 1), 1000);

    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
      (loc) => {
        const novoPonto = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setPosicaoAtual(novoPonto);
        setCoordenadas(prev => {
          const novas = [...prev, novoPonto];
          setDistanciaKm(calcularDistanciaRota(novas));
          return novas;
        });
      }
    );
  }

  function pausarCorrida() {
    watchRef.current?.remove();
    clearInterval(timerRef.current);
    setStatus('paused');
  }

  async function retomar() {
    setStatus('running');
    timerRef.current = setInterval(() => setSegundos(s => s + 1), 1000);
    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
      (loc) => {
        const novoPonto = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setPosicaoAtual(novoPonto);
        setCoordenadas(prev => {
          const novas = [...prev, novoPonto];
          setDistanciaKm(calcularDistanciaRota(novas));
          return novas;
        });
      }
    );
  }

  async function finalizarCorrida() {
    watchRef.current?.remove();
    clearInterval(timerRef.current);

    if (distanciaKm < 0.05) {
      Alert.alert('Corrida muito curta', 'Registre ao menos 50m');
      setStatus('idle');
      return;
    }

    setStatus('finished');
    setSalvando(true);

    try {
      const ritmoMedio = segundos > 0 ? (segundos / 60) / distanciaKm : 0;
      const res = await salvarCorrida(user.uid, { distanciaKm, duracaoSegundos: segundos, coordenadas, ritmoMedio });
      await recarregarUsuario();
      setResultado(res);

      // Ajusta o mapa para mostrar toda a rota
      if (coordenadas.length > 1 && mapRef.current) {
        mapRef.current.fitToCoordinates(coordenadas, {
          edgePadding: { top: 60, right: 40, bottom: 40, left: 40 },
          animated: true,
        });
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar a corrida');
      setStatus('idle');
    } finally {
      setSalvando(false);
    }
  }

  const formatarTempo = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const seg = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
  };

  const ritmo = segundos > 0 && distanciaKm > 0 ? (segundos / 60) / distanciaKm : 0;
  const ritmoStr = ritmo > 0
    ? `${Math.floor(ritmo)}:${String(Math.round((ritmo % 1) * 60)).padStart(2, '0')}`
    : '--:--';

  const mapaRegionInicial = posicaoAtual
    ? { ...posicaoAtual, latitudeDelta: 0.005, longitudeDelta: 0.005 }
    : { latitude: -23.55052, longitude: -46.633308, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <View style={styles.container}>
      {/* MAPA */}
      <MapView
        ref={mapRef}
        style={styles.mapa}
        initialRegion={mapaRegionInicial}
        showsUserLocation={true}
        followsUserLocation={status === 'running'}
        showsMyLocationButton={false}
        mapType="standard"
      >
        {/* Trajeto */}
        {coordenadas.length > 1 && (
          <Polyline
            coordinates={coordenadas}
            strokeColor={status === 'finished' ? '#FF6B35' : '#4CAF50'}
            strokeWidth={4}
          />
        )}

        {/* Marcador de início */}
        {coordenadas.length > 0 && (
          <Marker coordinate={coordenadas[0]} title="Início" pinColor="green" />
        )}

        {/* Marcador de fim (só quando terminou) */}
        {status === 'finished' && coordenadas.length > 1 && (
          <Marker coordinate={coordenadas[coordenadas.length - 1]} title="Fim" pinColor="red" />
        )}
      </MapView>

      {/* PAINEL INFERIOR */}
      <View style={[styles.painel, { paddingBottom: insets.bottom + 16 }]}>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{distanciaKm.toFixed(2)}</Text>
            <Text style={styles.statLabel}>km</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{formatarTempo(segundos)}</Text>
            <Text style={styles.statLabel}>tempo</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{ritmoStr}</Text>
            <Text style={styles.statLabel}>min/km</Text>
          </View>
        </View>

        {/* Resumo pós-corrida */}
        {status === 'finished' && resultado && (
          <View style={styles.resumo}>
            <Text style={styles.resumoTitulo}>🎉 Corrida concluída!</Text>
            <Text style={styles.resumoXP}>+{resultado.xpGanho} XP</Text>
            {resultado.recordePessoal && (
              <Text style={styles.resumoRecorde}>🏆 Novo recorde pessoal!</Text>
            )}
          </View>
        )}

        {salvando && <Text style={styles.salvando}>Salvando corrida...</Text>}

        {/* Botões */}
        <View style={styles.btns}>
          {status === 'idle' && (
            <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={iniciarCorrida}>
              <Text style={styles.btnText}>▶  Iniciar Corrida</Text>
            </TouchableOpacity>
          )}
          {status === 'running' && (
            <View style={styles.btnsRow}>
              <TouchableOpacity style={[styles.btn, styles.btnYellow, { flex: 1 }]} onPress={pausarCorrida}>
                <Text style={styles.btnText}>⏸  Pausar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnRed, { flex: 1 }]} onPress={finalizarCorrida}>
                <Text style={styles.btnText}>⏹  Finalizar</Text>
              </TouchableOpacity>
            </View>
          )}
          {status === 'paused' && (
            <View style={styles.btnsRow}>
              <TouchableOpacity style={[styles.btn, styles.btnGreen, { flex: 1 }]} onPress={retomar}>
                <Text style={styles.btnText}>▶  Retomar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnRed, { flex: 1 }]} onPress={finalizarCorrida}>
                <Text style={styles.btnText}>⏹  Finalizar</Text>
              </TouchableOpacity>
            </View>
          )}
          {status === 'finished' && !salvando && (
            <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={() => navigation.goBack()}>
              <Text style={styles.btnText}>← Voltar ao Início</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  mapa: { flex: 1 },

  painel: {
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  stat: { alignItems: 'center', flex: 1 },
  statVal: { color: '#4CAF50', fontSize: 26, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: '#2a2a2a' },

  resumo: {
    backgroundColor: '#1a2a1a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF5044',
  },
  resumoTitulo: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  resumoXP: { color: '#4CAF50', fontSize: 22, fontWeight: 'bold' },
  resumoRecorde: { color: '#FFD700', fontSize: 14, marginTop: 4 },

  salvando: { color: '#888', textAlign: 'center', marginBottom: 12 },

  btns: { gap: 10 },
  btnsRow: { flexDirection: 'row', gap: 10 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  btnGreen: { backgroundColor: '#4CAF50' },
  btnYellow: { backgroundColor: '#FFC107' },
  btnRed: { backgroundColor: '#f44336' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
