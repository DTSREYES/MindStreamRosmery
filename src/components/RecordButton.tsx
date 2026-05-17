import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
  TextInput as RNTextInput,
  Keyboard,
  NativeModules,
  Platform,
} from 'react-native';
import { Text, Portal, Modal, Surface, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Category, CATEGORIES, CATEGORY_COLORS } from '../database/database';

interface RecordButtonProps {
  onTranscriptionComplete: (text: string, category: Category) => void;
}

export default function RecordButton({ onTranscriptionComplete }: RecordButtonProps) {
  const [showInputModal, setShowInputModal] = useState(false);
  const [manualText, setManualText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Reflexión');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleMainPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setManualText('');
    setSelectedCategory('Reflexión');
    setShowInputModal(true);
    // Abrir teclado con opción de voz
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  };

  const handleSave = () => {
    if (manualText.trim().length === 0) {
      Alert.alert('Campo vacío', 'Escribe o dicta tu pensamiento antes de guardar.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onTranscriptionComplete(manualText.trim(), selectedCategory);
    setShowInputModal(false);
    setManualText('');
    Keyboard.dismiss();
  };

  const handleCancel = () => {
    setShowInputModal(false);
    setManualText('');
    Keyboard.dismiss();
  };

  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={handleMainPress} style={styles.fabContainer}>
        <Animated.View style={[styles.fabOuter, { transform: [{ scale: pulseAnim }] }]} />
        <View style={styles.fabInner}>
          <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
        </View>
      </TouchableOpacity>

      <View style={styles.helpText}>
        <Text style={styles.helpTitle}>Toca para añadir pensamiento</Text>
      </View>

      <Portal>
        <Modal visible={showInputModal} onDismiss={handleCancel} contentContainerStyle={styles.modalContainer}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✨ Nuevo pensamiento</Text>
              <IconButton icon="close" size={24} iconColor="#9CA3AF" onPress={handleCancel} />
            </View>

            <Text style={styles.instruction}>
              🎤 Para dictar: toca el campo de abajo, luego presiona el micrófono en tu teclado y habla.
            </Text>

            <RNTextInput
              ref={inputRef}
              style={styles.textInput}
              multiline
              numberOfLines={5}
              placeholder="Escribe aquí o usa el micrófono de tu teclado..."
              placeholderTextColor="#9CA3AF"
              value={manualText}
              onChangeText={setManualText}
              textAlignVertical="top"
              autoFocus
              keyboardType="default"
              returnKeyType="default"
            />

            <Text style={styles.categoryLabel}>¿Cómo te sientes?</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      borderColor: CATEGORY_COLORS[cat],
                      backgroundColor: selectedCategory === cat ? CATEGORY_COLORS[cat] + '30' : 'transparent',
                      borderWidth: selectedCategory === cat ? 2.5 : 1.5,
                    },
                  ]}
                  onPress={() => { setSelectedCategory(cat); Haptics.selectionAsync(); }}
                >
                  <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[cat] }]} />
                  <Text style={[styles.categoryText, {
                    color: CATEGORY_COLORS[cat],
                    fontWeight: selectedCategory === cat ? '700' : '500',
                  }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <Button mode="outlined" onPress={handleCancel} style={styles.cancelBtn} textColor="#6B7280">
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveBtn}
                buttonColor="#6366F1"
                textColor="#FFF"
                disabled={!manualText.trim()}
              >
                💾 Guardar
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: { position: 'absolute', bottom: 30, alignSelf: 'center', width: 80, height: 80, zIndex: 100 },
  fabOuter: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#6366F1', opacity: 0.3 },
  fabInner: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  helpText: { position: 'absolute', bottom: 20, alignSelf: 'center', alignItems: 'center', zIndex: 100 },
  helpTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  modalContainer: { margin: 16 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, elevation: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  instruction: {
    fontSize: 13, color: '#6366F1', backgroundColor: '#EEF2FF',
    padding: 12, borderRadius: 12, marginBottom: 12, textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, fontSize: 16,
    color: '#1F2937', minHeight: 120, borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 14,
  },
  categoryLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  categoryText: { fontSize: 12, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  cancelBtn: { borderRadius: 12, borderColor: '#E5E7EB', flex: 1 },
  saveBtn: { borderRadius: 12, flex: 2 },
});