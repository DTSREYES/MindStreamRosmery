import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category, CATEGORY_COLORS } from '../database/database';

interface DashboardProps {
  todayCount: number;
  totalCount: number;
  categoryStats: { categoria: Category; count: number }[];
}

export default function Dashboard({ todayCount, totalCount, categoryStats }: DashboardProps) {
  const avgPerDay = totalCount > 0 ? Math.round(totalCount / Math.max(1, 7)) : 0;
  const maxCategory = categoryStats.length > 0 
    ? categoryStats.reduce((a, b) => a.count > b.count ? a : b)
    : null;

  return (
    <View style={styles.container}>
      {/* KPI Principal: Hoy */}
      <Surface style={styles.mainKpi} elevation={4}>
        <Text style={styles.mainKpiLabel}>Hoy</Text>
        <Text style={styles.mainKpiValue}>{todayCount}</Text>
        <Text style={styles.mainKpiUnit}>pensamientos</Text>
      </Surface>

      {/* KPIs secundarios */}
      <View style={styles.secondaryRow}>
        <Surface style={styles.secondaryKpi} elevation={3}>
          <MaterialCommunityIcons name="database" size={18} color="#8B5CF6" />
          <Text style={styles.secondaryValue}>{totalCount}</Text>
          <Text style={styles.secondaryLabel}>Total</Text>
        </Surface>

        <Surface style={styles.secondaryKpi} elevation={3}>
          <MaterialCommunityIcons name="speedometer" size={18} color="#14B8A6" />
          <Text style={styles.secondaryValue}>{avgPerDay}</Text>
          <Text style={styles.secondaryLabel}>Ritmo/día</Text>
        </Surface>

        {maxCategory && (
          <Surface style={styles.secondaryKpi} elevation={3}>
            <View style={[styles.miniDot, { backgroundColor: CATEGORY_COLORS[maxCategory.categoria] }]} />
            <Text style={styles.secondaryValue}>{maxCategory.count}</Text>
            <Text style={styles.secondaryLabel}>{maxCategory.categoria}</Text>
          </Surface>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  mainKpi: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mainKpiLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mainKpiValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFF',
    fontVariant: ['tabular-nums'],
  },
  mainKpiUnit: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: -4,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryKpi: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  secondaryLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  miniDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
});