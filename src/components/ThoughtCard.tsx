import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Thought, CATEGORY_COLORS } from '../database/database';
import * as Haptics from 'expo-haptics';

interface ThoughtCardProps {
  thought: Thought;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ThoughtCard({ thought, index, onEdit, onDelete }: ThoughtCardProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onDelete());
  };

  const categoryColor = CATEGORY_COLORS[thought.categoria] || '#6366F1';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
          ],
        },
      ]}
    >
      <Surface style={styles.card} elevation={2}>
        {/* Barra de color de categoría */}
        <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />

        <View style={styles.content}>
          {/* Cabecera con fecha y categoría */}
          <View style={styles.header}>
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={14} color="#9CA3AF" />
              <Text style={styles.dateText}>{thought.fecha}</Text>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#9CA3AF" style={{ marginLeft: 10 }} />
              <Text style={styles.dateText}>{thought.hora.substring(0, 5)}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {thought.categoria}
              </Text>
            </View>
          </View>

          {/* Día */}
          <Text style={styles.dayText}>{thought.dia}</Text>

          {/* Texto del pensamiento */}
          <Text style={styles.thoughtText} numberOfLines={4}>
            {thought.texto}
          </Text>

          {/* Acciones */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Haptics.selectionAsync();
                onEdit();
              }}
            >
              <MaterialCommunityIcons name="pencil" size={18} color="#6366F1" />
              <Text style={styles.actionText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteAction]}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons name="delete-outline" size={18} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  categoryBar: {
    height: 3,
    width: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayText: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'capitalize',
    marginBottom: 8,
    fontWeight: '500',
  },
  thoughtText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  deleteAction: {
    marginLeft: 'auto',
  },
});