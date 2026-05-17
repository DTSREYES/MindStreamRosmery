import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, IconButton, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMindStream } from '../context/MindStreamContext';
import { CATEGORIES, CATEGORY_COLORS, Category } from '../database/database';
import { format, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const { width } = Dimensions.get('window');

export default function StatsScreen({ navigation }: any) {
  const { thoughts, todayThoughts } = useMindStream();
  const [selectedPeriod, setSelectedPeriod] = useState<'hoy' | 'semana' | 'mes' | 'total'>('hoy');

  const stats = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { locale: es });
    const weekDays = eachDayOfInterval({ start: weekStart, end: today });

    const categoryStats = CATEGORIES.map(cat => ({
      categoria: cat,
      count: thoughts.filter(t => t.categoria === cat).length,
      percent: thoughts.length > 0 
        ? Math.round((thoughts.filter(t => t.categoria === cat).length / thoughts.length) * 100) 
        : 0,
    })).sort((a, b) => b.count - a.count);

    const weekEvolution = weekDays.map(day => ({
      day: format(day, 'EEE', { locale: es }),
      count: thoughts.filter(t => t.fecha === format(day, 'yyyy-MM-dd')).length,
    }));

    return {
      categoryStats,
      weekEvolution,
      maxCategory: categoryStats[0],
      total: thoughts.length,
      today: todayThoughts.length,
      average: thoughts.length > 0 
        ? Math.round(thoughts.length / Math.max(1, new Set(thoughts.map(t => t.fecha)).size))
        : 0,
    };
  }, [thoughts]);

  const maxWeekCount = Math.max(...stats.weekEvolution.map(d => d.count), 1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor="#FFF"
            size={28}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Estadísticas</Text>
          <View style={{ width: 48 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* KPIs */}
        <View style={styles.kpiRow}>
          <Surface style={styles.kpiCard} elevation={4}>
            <MaterialCommunityIcons name="calendar-today" size={24} color="#6366F1" />
            <Text style={styles.kpiValue}>{stats.today}</Text>
            <Text style={styles.kpiLabel}>Hoy</Text>
          </Surface>

          <Surface style={styles.kpiCard} elevation={4}>
            <MaterialCommunityIcons name="brain" size={24} color="#8B5CF6" />
            <Text style={styles.kpiValue}>{stats.total}</Text>
            <Text style={styles.kpiLabel}>Total</Text>
          </Surface>

          <Surface style={styles.kpiCard} elevation={4}>
            <MaterialCommunityIcons name="trending-up" size={24} color="#14B8A6" />
            <Text style={styles.kpiValue}>{stats.average}</Text>
            <Text style={styles.kpiLabel}>Prom./día</Text>
          </Surface>
        </View>

        {/* Evolución semanal */}
        <Surface style={styles.chartCard} elevation={2}>
          <Text style={styles.chartTitle}>📊 Evolución semanal</Text>
          <View style={styles.barChart}>
            {stats.weekEvolution.map((day, index) => (
              <View key={index} style={styles.barContainer}>
                <Text style={styles.barValue}>
                  {day.count > 0 ? day.count : ''}
                </Text>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(day.count / maxWeekCount) * 100}%`,
                        backgroundColor: day.count > stats.average ? '#6366F1' : '#C7D2FE',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{day.day}</Text>
              </View>
            ))}
          </View>
        </Surface>

        {/* Distribución por categoría */}
        <Surface style={styles.chartCard} elevation={2}>
          <Text style={styles.chartTitle}>🎨 Distribución emocional</Text>
          {stats.categoryStats.map((cat, index) => (
            <View key={cat.categoria} style={styles.categoryRow}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[cat.categoria] }]} />
                <Text style={styles.categoryName}>{cat.categoria}</Text>
                <Text style={styles.categoryCount}>{cat.count}</Text>
                <Text style={styles.categoryPercent}>{cat.percent}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${cat.percent}%`,
                      backgroundColor: CATEGORY_COLORS[cat.categoria],
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </Surface>

        {/* Pensamiento más común */}
        {stats.maxCategory && stats.maxCategory.count > 0 && (
          <Surface style={styles.insightCard} elevation={2}>
            <Text style={styles.insightTitle}>💡 Insight</Text>
            <Text style={styles.insightText}>
              Tu categoría más frecuente es{' '}
              <Text style={{ fontWeight: '700', color: CATEGORY_COLORS[stats.maxCategory.categoria] }}>
                {stats.maxCategory.categoria}
              </Text>{' '}
              con {stats.maxCategory.count} pensamientos ({stats.maxCategory.percent}% del total)
            </Text>
          </Surface>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  content: { flex: 1, padding: 20 },
  kpiRow: { flexDirection: 'row', gap: 12, marginTop: -20, marginBottom: 20 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  kpiValue: { fontSize: 28, fontWeight: '800', color: '#1F2937', marginTop: 8 },
  kpiLabel: { fontSize: 12, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 10, color: '#6366F1', fontWeight: '600', marginBottom: 4 },
  barBackground: {
    width: 24,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: { width: '100%', borderRadius: 12 },
  barLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 6, fontWeight: '500' },
  categoryRow: { marginBottom: 14 },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  categoryName: { fontSize: 13, fontWeight: '600', color: '#374151', flex: 1 },
  categoryCount: { fontSize: 13, fontWeight: '700', color: '#1F2937', marginRight: 8 },
  categoryPercent: { fontSize: 12, color: '#9CA3AF', minWidth: 30 },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  insightCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 2,
  },
  insightTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  insightText: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
});