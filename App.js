// App.js
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './screens/home';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import Panel from './screens/Panel';

const Stack = createNativeStackNavigator();

// Configuración de notificaciones en primer plano (iOS)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    (async () => {
      // Solo en dispositivo físico
      if (!Constants.isDevice) {
        console.warn('⚠️ Notificaciones push requieren un dispositivo físico');
        return;
      }

      // Pedir permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('❌ Permiso de notificaciones denegado');
        return;
      }

      // Obtener token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const pushToken = tokenData.data;
      await AsyncStorage.setItem('pushToken', pushToken);

      // (Opcional) Puedes escuchar notificaciones entrantes aquí:
      // Notifications.addNotificationReceivedListener(notification => { ... });
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Iniciar Sesión' }}
        />
        <Stack.Screen
          name="Registro"
          component={RegisterScreen}
          options={{ title: 'Crear Cuenta' }}
        />
        <Stack.Screen
          name="Panel"
          component={Panel}
          options={{ title: 'Mapa de Alertas' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
