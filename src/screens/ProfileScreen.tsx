import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Avatar,
  TextInput,
  Button,
  Text,
  Surface,
  IconButton,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useMindStream } from '../context/MindStreamContext';

export default function ProfileScreen({ navigation }: any) {
  const { userProfile, thoughts, setUserProfile } = useMindStream();
  const [nombre, setNombre] = useState(userProfile.nombre);
  const [foto, setFoto] = useState<string | null>(userProfile.foto);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFoto(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSave = async () => {
    await setUserProfile({
      nombre: nombre || 'Usuario',
      foto: foto,
      pin: userProfile.pin,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('✅ Perfil actualizado', 'Tus cambios han sido guardados.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <IconButton icon="arrow-left" iconColor="#FFF" size={28} onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <View style={{ width: 48 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Surface style={styles.avatarSection} elevation={4}>
          <View style={styles.avatarWrapper}>
            {foto ? (
              <Avatar.Image size={100} source={{ uri: foto }} />
            ) : (
              <Avatar.Text
                size={100}
                label={(nombre || 'U').charAt(0).toUpperCase()}
                style={{ backgroundColor: '#6366F1' }}
                labelStyle={{ fontSize: 40, color: '#FFF' }}
              />
            )}
            <IconButton
              icon="camera"
              size={24}
              iconColor="#FFF"
              style={styles.cameraButton}
              onPress={handlePickImage}
            />
          </View>
          <Text style={styles.userName}>{nombre || 'Usuario'}</Text>
          <Text style={styles.statsText}>{thoughts.length} pensamientos</Text>
        </Surface>

        <Surface style={styles.formSection} elevation={2}>
          <TextInput
            mode="outlined"
            label="Nombre"
            value={nombre}
            onChangeText={setNombre}
            left={<TextInput.Icon icon="account" color="#6366F1" />}
            style={styles.input}
            outlineColor="#E5E7EB"
            activeOutlineColor="#6366F1"
          />
        </Surface>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          labelStyle={styles.saveButtonLabel}
        >
          💾 Guardar cambios
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: { paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  content: { flex: 1, paddingHorizontal: 20 },
  avatarSection: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center',
    marginTop: -30, elevation: 8,
  },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  cameraButton: {
    position: 'absolute', bottom: -5, right: -5,
    backgroundColor: '#6366F1', borderRadius: 20,
  },
  userName: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginTop: 8 },
  statsText: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  formSection: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginTop: 20 },
  input: { backgroundColor: '#FFF', borderRadius: 12 },
  saveButton: { backgroundColor: '#6366F1', borderRadius: 16, marginTop: 24, marginBottom: 30 },
  saveButtonContent: { height: 52 },
  saveButtonLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});