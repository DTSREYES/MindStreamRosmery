import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface AffirmationCardProps {
  text: string;
  onClose: () => void;
}

export default function AffirmationCard({ text, onClose }: AffirmationCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Surface style={styles.card} elevation={3}>
        <LinearGradient
          colors={['rgba(99,102,241,0.1)', 'rgba(139,92,246,0.05)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="star-four-points" size={20} color="#6366F1" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Afirmación del día</Text>
              <Text style={styles.text}>"{text}"</Text>
            </View>
            <IconButton
              icon="close"
              size={18}
              iconColor="#9CA3AF"
              onPress={handleClose}
              style={styles.closeButton}
            />
          </View>
        </LinearGradient>
      </Surface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99,102,241,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 2,
  },
  closeButton: {
    margin: -8,
  },
});