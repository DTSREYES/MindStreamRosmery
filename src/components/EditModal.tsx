import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Portal, Modal, TextInput, Button, Text, Chip, Surface } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Thought, Category, CATEGORIES, CATEGORY_COLORS } from '../database/database';

interface EditModalProps {
  visible: boolean;
  thought: Thought | null;
  onClose: () => void;
  onSave: (id: string, newText: string, newCategory?: Category) => void;
}

export default function EditModal({ visible, thought, onClose, onSave }: EditModalProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Category>('Reflexión');

  useEffect(() => {
    if (thought) {
      setText(thought.texto);
      setCategory(thought.categoria);
    }
  }, [thought]);

  const handleSave = () => {
    if (thought && text.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSave(thought.id, text.trim(), category !== thought.categoria ? category : undefined);
    }
  };

  if (!thought) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <Text style={styles.title}>Editar pensamiento</Text>

          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              📅 {thought.fecha} - 🕐 {thought.hora}
            </Text>
            <Text style={styles.metaText}>
              📝 {thought.dia}
            </Text>
          </View>

          <TextInput
            mode="outlined"
            multiline
            numberOfLines={6}
            value={text}
            onChangeText={setText}
            style={styles.textInput}
            outlineColor="#E5E7EB"
            activeOutlineColor="#6366F1"
            placeholder="Edita tu pensamiento..."
          />

          <Text style={styles.categoryLabel}>Categoría:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  selected={category === cat}
                  onPress={() => {
                    setCategory(cat);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.categoryChip,
                    category === cat && {
                      backgroundColor: CATEGORY_COLORS[cat] + '20',
                    },
                  ]}
                  selectedColor={CATEGORY_COLORS[cat]}
                  textStyle={[
                    styles.categoryChipText,
                    category === cat && { color: CATEGORY_COLORS[cat] },
                  ]}
                >
                  {cat}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <Button
              onPress={onClose}
              textColor="#6B7280"
              style={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              disabled={!text.trim()}
              style={styles.saveButton}
              labelStyle={styles.saveButtonLabel}
            >
              Guardar cambios
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    elevation: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  metaInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  textInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
  },
  saveButtonLabel: {
    color: '#FFF',
    fontWeight: '600',
  },
});