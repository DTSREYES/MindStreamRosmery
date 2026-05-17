import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Animated,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Searchbar, Portal, Modal, TextInput, Button, Chip, Avatar, Badge, Surface } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMindStream } from '../context/MindStreamContext';
import { Category, CATEGORIES, CATEGORY_COLORS } from '../database/database';
import { generatePDF } from '../utils/pdfGenerator';
import RecordButton from '../components/RecordButton';
import ThoughtCard from '../components/ThoughtCard';
import EditModal from '../components/EditModal';
import Dashboard from '../components/Dashboard';
import AffirmationCard from '../components/AffirmationCard';

export default function HomeScreen({ navigation }: any) {
  const {
    thoughts,
    todayThoughts,
    affirmation,
    userProfile,
    addThought,
    updateThought,
    deleteThought,
    searchThoughts: filterThoughts,
    getCategoryStats,
  } = useMindStream();

  const [searchQuery, setSearchQuery] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState('');
  const [manualCategory, setManualCategory] = useState<Category>('Reflexión');
  const [editingThought, setEditingThought] = useState<any>(null);
  const [showAffirmation, setShowAffirmation] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;

  const filteredThoughts = searchQuery ? filterThoughts(searchQuery) : thoughts;

  const handleSaveManual = async () => {
    if (manualText.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      try {
        await addThought(manualText.trim(), manualCategory);
        setManualText('');
        setManualCategory('Reflexión');
        setShowManualInput(false);
      } catch (error) {
        Alert.alert('Error', 'No se pudo guardar. Reinicia la app.');
      }
    }
  };

  const handleExportPDF = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const thoughtsToExport = searchQuery ? filteredThoughts : todayThoughts;
    await generatePDF(
      thoughtsToExport,
      searchQuery ? 'Resultados de búsqueda' : `Pensamientos del ${format(new Date(), "dd 'de' MMMM, yyyy", { locale: es })}`
    );
  };

  const handleDelete = async (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteThought(id);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#A855F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>MindStream</Text>
              <Text style={styles.subtitle}>La evolución de tus pensamientos</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Surface style={styles.avatarContainer} elevation={3}>
                {userProfile.foto ? (
                  <Avatar.Image size={42} source={{ uri: userProfile.foto }} />
                ) : (
                  <Avatar.Text
                    size={42}
                    label={userProfile.nombre.charAt(0).toUpperCase()}
                    style={{ backgroundColor: '#A855F7' }}
                    labelStyle={{ color: '#FFF' }}
                  />
                )}
                <Badge size={12} style={styles.onlineBadge} />
              </Surface>
            </TouchableOpacity>
          </View>

          <Dashboard
            todayCount={todayThoughts.length}
            totalCount={thoughts.length}
            categoryStats={getCategoryStats()}
          />
        </LinearGradient>
      </Animated.View>

      {/* Afirmación */}
      {showAffirmation && (
        <AffirmationCard
          text={affirmation}
          onClose={() => setShowAffirmation(false)}
        />
      )}

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por texto, fecha, día, hora o categoría..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#6366F1"
          placeholderTextColor="#9CA3AF"
          elevation={2}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={filteredThoughts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ThoughtCard
            thought={item}
            index={index}
            onEdit={() => setEditingThought(item)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="thought-bubble-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Sin resultados' : 'No hay pensamientos aún'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Intenta con otra palabra o fecha'
                : 'Presiona el botón + para empezar'}
            </Text>
          </View>
        }
      />

      {/* Botones de acción */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => navigation.navigate('Stats')}
        >
          <MaterialCommunityIcons name="chart-bar" size={22} color="#6366F1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => navigation.navigate('Breathing')}
        >
          <MaterialCommunityIcons name="meditation" size={22} color="#8B5CF6" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickButton, styles.exportButton]}
          onPress={handleExportPDF}
        >
          <MaterialCommunityIcons name="file-pdf-box" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* FAB para agregar pensamiento */}
      <RecordButton
        onTranscriptionComplete={async (text: string, category: Category) => {
          if (text && text.trim()) {
            try {
              console.log('🎯 HomeScreen guardando con categoría:', category);
              await addThought(text.trim(), category);
              console.log('✅ Guardado exitoso');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('❌ Error al guardar:', error);
              Alert.alert('Error', 'No se pudo guardar. Borra los datos de Expo Go en Ajustes.');
            }
          }
        }}
      />

      {/* FAB para entrada manual */}
      <TouchableOpacity
        style={styles.manualFab}
        onPress={() => setShowManualInput(true)}
      >
        <MaterialCommunityIcons name="pencil" size={22} color="#6366F1" />
      </TouchableOpacity>

      {/* Modal entrada manual */}
      <Portal>
        <Modal
          visible={showManualInput}
          onDismiss={() => setShowManualInput(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escribir pensamiento</Text>

            <TextInput
              mode="outlined"
              multiline
              numberOfLines={5}
              value={manualText}
              onChangeText={setManualText}
              placeholder="Escribe lo que estás pensando..."
              style={styles.manualInput}
              outlineColor="#E5E7EB"
              activeOutlineColor="#6366F1"
            />

            <Text style={styles.categoryLabel}>Categoría:</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  selected={manualCategory === cat}
                  onPress={() => {
                    setManualCategory(cat);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.categoryChip,
                    manualCategory === cat && {
                      backgroundColor: CATEGORY_COLORS[cat] + '20',
                    },
                  ]}
                  selectedColor={CATEGORY_COLORS[cat]}
                  textStyle={[
                    styles.categoryChipText,
                    manualCategory === cat && { color: CATEGORY_COLORS[cat] },
                  ]}
                >
                  {cat}
                </Chip>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Button onPress={() => setShowManualInput(false)} textColor="#6B7280">
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveManual}
                disabled={!manualText.trim()}
                style={styles.saveButton}
                labelStyle={{ color: '#FFF' }}
              >
                Guardar
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* Modal de edición */}
      <EditModal
        visible={!!editingThought}
        thought={editingThought}
        onClose={() => setEditingThought(null)}
        onSave={async (id, newText, newCategory) => {
          await updateThought(id, newText, newCategory);
          setEditingThought(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  avatarContainer: { borderRadius: 25, overflow: 'visible' },
  onlineBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#10B981', borderColor: '#FFF', borderWidth: 2,
  },
  searchContainer: { paddingHorizontal: 20, marginTop: -10, zIndex: 10 },
  searchBar: {
    borderRadius: 16, backgroundColor: '#FFFFFF', elevation: 4,
  },
  searchInput: { fontSize: 14 },
  listContent: { padding: 20, paddingTop: 15, paddingBottom: 120 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 20 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
  quickActions: { position: 'absolute', right: 16, bottom: 100, gap: 8 },
  quickButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
    elevation: 4,
  },
  exportButton: { backgroundColor: '#FEF2F2' },
  manualFab: {
    position: 'absolute', left: 20, bottom: 100,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
    elevation: 4,
  },
  modalContainer: { margin: 20 },
  modalContent: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  manualInput: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16 },
  categoryLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  categoryChip: { borderRadius: 20 },
  categoryChipText: { fontSize: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  saveButton: { backgroundColor: '#6366F1', borderRadius: 12 },
});