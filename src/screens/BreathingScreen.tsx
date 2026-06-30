import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, IconButton, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type Phase = 'inhala' | 'manten' | 'exhala' | 'descansa';

const PHASES: { key: Phase; duration: number; text: string; icon: string; color: string }[] = [
  { key: 'inhala', duration: 4000, text: 'Inhala', icon: 'weather-windy', color: '#6366F1' },
  { key: 'manten', duration: 7000, text: 'Mantén', icon: 'pause-circle', color: '#8B5CF6' },
  { key: 'exhala', duration: 8000, text: 'Exhala', icon: 'weather-windy', color: '#A855F7' },
  { key: 'descansa', duration: 1000, text: 'Descansa', icon: 'meditation', color: '#C084FC' },
];

export default function BreathingScreen({ navigation }: any) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [cycles, setCycles] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isActive) {
      const phase = PHASES[currentPhase];

      // Animación de respiración
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: phase.key === 'inhala' ? 1.4 : phase.key === 'exhala' ? 0.8 : 1,
          duration: phase.duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: phase.key === 'manten' ? 0.8 : 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      Haptics.impactAsync(
        phase.key === 'inhala'
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium
      );

      timeout = setTimeout(() => {
        if (currentPhase < PHASES.length - 1) {
          setCurrentPhase(prev => prev + 1);
        } else {
          setCurrentPhase(0);
          setCycles(prev => prev + 1);
        }
      }, phase.duration);
    }

    return () => clearTimeout(timeout);
  }, [isActive, currentPhase]);

  const toggleBreathing = () => {
    if (!isActive) {
      setCycles(0);
      setCurrentPhase(0);
    }
    setIsActive(!isActive);
  };

  const currentPhaseData = PHASES[currentPhase];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#A855F7']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor="#FFF"
            size={28}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Respiración 4-7-8</Text>
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.content}>
          {/* Círculo animado */}
          <View style={styles.circleContainer}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                  borderColor: currentPhaseData.color,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={currentPhaseData.icon as any}
                size={60}
                color="#FFF"
              />
              <Text style={styles.phaseText}>
                {isActive ? currentPhaseData.text : 'Iniciar'}
              </Text>
              <Text style={styles.phaseDuration}>
                {isActive ? `${currentPhaseData.duration / 1000}s` : '4-7-8'}
              </Text>
            </Animated.View>
          </View>

          {/* Controles */}
          <Surface style={styles.controlsCard} elevation={4}>
            <Text style={styles.techniqueTitle}>Técnica 4-7-8</Text>
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>segundos inhalando</Text>
              </View>
              <View style={styles.stepDivider} />
              <View style={styles.step}>
                <Text style={styles.stepNumber}>7</Text>
                <Text style={styles.stepText}>segundos manteniendo</Text>
              </View>
              <View style={styles.stepDivider} />
              <View style={styles.step}>
                <Text style={styles.stepNumber}>8</Text>
                <Text style={styles.stepText}>segundos exhalando</Text>
              </View>
            </View>

            {isActive && (
              <Text style={styles.cyclesText}>
                Ciclos completados: {cycles}
              </Text>
            )}

            <IconButton
              icon={isActive ? 'stop' : 'play'}
              size={40}
              iconColor="#FFF"
              containerColor={isActive ? '#EF4444' : '#6366F1'}
              style={styles.playButton}
              onPress={toggleBreathing}
            />
          </Surface>

          <Text style={styles.benefit}>
            Reduce la ansiedad, mejora la concentración {'\n'}
            y ayuda a conciliar el sueño
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  breathingCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  phaseText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  phaseDuration: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  controlsCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    elevation: 8,
  },
  techniqueTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#6366F1',
  },
  stepText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  stepDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  cyclesText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 8,
  },
  playButton: {
    alignSelf: 'center',
    elevation: 4,
  },
  benefit: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 30,
    lineHeight: 20,
  },
});