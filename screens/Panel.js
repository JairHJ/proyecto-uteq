// screens/Panel.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { API_URL } from '../config';

const uteqCoords = { latitude: 20.655788, longitude: -100.405107 };
const { width, height } = Dimensions.get('window');

export default function Panel() {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accidentes, setAccidentes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [nivel, setNivel] = useState('rojo');
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    // Leer usuario_id
    AsyncStorage.getItem('usuario_id').then(id => {
      if (id) setUsuarioId(parseInt(id, 10));
    });
    // Pedir ubicación
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No hay acceso a ubicación');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLoading(false);
    })();
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const resp = await fetch(`${API_URL}/reportes`);
      const data = await resp.json();
      setAccidentes(data);
    } catch (e) {
      console.error(e);
    }
  };

  const reportar = async () => {
    if (!descripcion.trim()) {
      return Alert.alert('Error', 'Describe el accidente');
    }
    if (!usuarioId) {
      return Alert.alert('Error', 'Usuario no identificado');
    }
    try {
      const resp = await fetch(`${API_URL}/reportes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion,
          latitud: userLocation.latitude,
          longitud: userLocation.longitude,
          nivel,
          usuario_id: usuarioId
        })
      });
      const res = await resp.json();
      if (!resp.ok) {
        return Alert.alert('Error', res.message);
      }
      Alert.alert('Éxito', 'Reporte enviado');
      setModalVisible(false);
      setDescripcion('');
      cargar();
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude ?? uteqCoords.latitude,
          longitude: userLocation?.longitude ?? uteqCoords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
        showsUserLocation
      >
        <Marker coordinate={uteqCoords} title="UTEQ" />
        {accidentes.map(a => (
          <Marker
            key={a.id}
            coordinate={{
              latitude: parseFloat(a.latitud),
              longitude: parseFloat(a.longitud)
            }}
            title={`[${a.nivel.toUpperCase()}] ${a.descripcion}`}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>🚨</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Reportar Accidente</Text>
            <View style={styles.levels}>
              {['verde', 'naranja', 'rojo'].map(lv => (
                <TouchableOpacity
                  key={lv}
                  onPress={() => setNivel(lv)}
                  style={[
                    styles.levelBtn,
                    {
                      backgroundColor:
                        lv === 'rojo' ? '#dc2626' : lv === 'naranja' ? '#f59e0b' : '#10b981',
                      opacity: nivel === lv ? 1 : 0.6
                    }
                  ]}
                >
                  <Text style={styles.levelText}>{lv.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Describe..."
              placeholderTextColor="#9ca3af"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={reportar}>
                <Text style={{ color: '#fff' }}>Reportar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e40af'
  },
  map: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#ef4444',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fabText: { fontSize: 28, color: '#fff' },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  levels: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  levelBtn: {
    padding: 10,
    borderRadius: 8
  },
  levelText: { color: '#fff', fontWeight: 'bold' },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top'
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { marginRight: 12 },
  saveBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  }
});
