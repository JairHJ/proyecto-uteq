// screens/RegisterScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!nombre || !correo || !contrasena) {
      return Alert.alert('Error', 'Por favor completa todos los campos');
    }
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, contrasena })
      });
      if (resp.status === 201) {
        const data = await resp.json();
        Alert.alert('Éxito', data.message);
        navigation.replace('Login');
      } else {
        const err = await resp.json();
        throw new Error(err.message);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (value, setValue, placeholder, icon, keyboard, secure, name) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{placeholder}</Text>
      <View style={[
        styles.inputWrapper,
        focused === name && styles.inputFocused
      ]}>
        <Ionicons name={icon} size={20} color={focused===name?'#4c51bf':'#9ca3af'} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={setValue}
          keyboardType={keyboard}
          secureTextEntry={secure && !showPassword}
          autoCapitalize={keyboard==='email-address'?'none':'words'}
          onFocus={()=>setFocused(name)}
          onBlur={()=>setFocused(null)}
        />
        {secure && (
          <TouchableOpacity onPress={()=>setShowPassword(!showPassword)} style={styles.eye}>
            <Ionicons name={showPassword?'eye-off':'eye'} size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container}
      behavior={Platform.OS==='ios'?'padding':'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4c51bf" />
      <View style={styles.background}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.content,{
            opacity: fadeAnim,
            transform: [{translateY: slideAnim},{scale: scaleAnim}]
          }]}>
            <Text style={styles.title}>¡Únete a nosotros!</Text>

            {renderInput(nombre, setNombre, 'Nombre completo', 'person-outline', 'default', false, 'nombre')}
            {renderInput(correo, setCorreo, 'Correo electrónico', 'mail-outline', 'email-address', false, 'correo')}
            {renderInput(contrasena, setContrasena, 'Contraseña', 'lock-closed-outline', 'default', true, 'contrasena')}

            <View style={styles.requirements}>
              <Ionicons
                name={contrasena.length>=6?'checkmark-circle':'ellipse-outline'}
                size={16}
                color={contrasena.length>=6?'#10b981':'#9ca3af'}
              />
              <Text style={[
                styles.reqText,
                contrasena.length>=6 && { color: '#10b981' }
              ]}>Al menos 6 caracteres</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && {opacity:0.7}]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff"/>
                : <Text style={styles.btnText}>Crear Cuenta</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>navigation.replace('Login')}>
              <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1},
  background:{flex:1,backgroundColor:'#4c51bf',padding:20,justifyContent:'center'},
  scrollContent:{flexGrow:1,justifyContent:'center'},
  content:{},
  title:{fontSize:28,color:'#fff',textAlign:'center',marginBottom:20},
  inputContainer:{marginBottom:16},
  inputLabel:{color:'#fff',marginBottom:6},
  inputWrapper:{
    flexDirection:'row',alignItems:'center',
    backgroundColor:'#fff',borderRadius:8,padding:12
  },
  inputFocused:{borderColor:'#4c51bf',borderWidth:2},
  input:{flex:1},
  eye:{position:'absolute',right:12},
  requirements:{flexDirection:'row',alignItems:'center',marginBottom:20},
  reqText:{marginLeft:8,color:'#9ca3af'},
  button:{backgroundColor:'#10b981',padding:16,borderRadius:8,alignItems:'center',marginBottom:20},
  btnText:{color:'#fff',fontWeight:'600'},
  link:{color:'#fff',textAlign:'center'},
});
