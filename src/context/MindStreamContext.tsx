import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Thought, Category, initDatabase, getDatabase } from '../database/database';
import { searchThoughts } from '../utils/searchEngine';
import { getRandomAffirmation } from '../utils/affirmations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as Crypto from 'expo-crypto';

interface MindStreamContextType {
  thoughts: Thought[];
  todayThoughts: Thought[];
  isLoading: boolean;
  affirmation: string;
  userProfile: { nombre: string; foto: string | null; pin: string };
  isAuthenticated: boolean;
  setUserProfile: (profile: { nombre: string; foto: string | null; pin: string }) => Promise<void>;
  authenticate: (pin: string) => Promise<boolean>;
  loadThoughts: () => Promise<void>;
  addThought: (text: string, categoria: Category) => Promise<void>;
  updateThought: (id: string, newText: string, newCategory?: Category) => Promise<void>;
  deleteThought: (id: string) => Promise<void>;
  searchThoughts: (query: string) => Thought[];
  getCategoryStats: () => { categoria: Category; count: number }[];
}

const MindStreamContext = createContext<MindStreamContextType>({} as MindStreamContextType);

export const MindStreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);
  const [affirmation] = useState(getRandomAffirmation());
  const [userProfile, setUserProfileState] = useState({ 
    nombre: 'Rosmery', 
    foto: null as string | null, 
    pin: '1234' 
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayThoughts = thoughts.filter(t => t.fecha === today);

  // Inicializar base de datos
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('🔵 Configurando base de datos...');
        await initDatabase();
        setDbReady(true);
        console.log('✅ Base de datos lista');
      } catch (error) {
        console.error('❌ Error fatal en base de datos:', error);
        setIsLoading(false);
      }
    };
    setupDatabase();
  }, []);

  const loadThoughts = useCallback(async () => {
    if (!dbReady) {
      console.log('⏳ Esperando base de datos...');
      return;
    }
    
    try {
      console.log('📖 Cargando pensamientos...');
      const db = await getDatabase();
      
      // Verificar que la tabla existe
      const tableCheck = await db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='pensamientos';"
      );
      
      if (tableCheck.length === 0) {
        console.error('❌ Tabla pensamientos no existe, reinicializando...');
        await initDatabase();
      }
      
      const result = await db.getAllAsync<Thought>(
        'SELECT * FROM pensamientos ORDER BY created_at DESC'
      );
      
      console.log(`✅ ${result.length} pensamientos cargados`);
      setThoughts(result);
    } catch (error) {
      console.error('❌ Error cargando pensamientos:', error);
      setThoughts([]);
    } finally {
      setIsLoading(false);
    }
  }, [dbReady]);

  // Cargar pensamientos cuando la BD esté lista
  useEffect(() => {
    if (dbReady) {
      loadThoughts();
    }
  }, [dbReady, loadThoughts]);

  const addThought = async (text: string, categoria: Category) => {
    if (!dbReady) {
      console.error('❌ Base de datos no está lista');
      throw new Error('Base de datos no inicializada');
    }
    
    try {
      console.log('💾 Guardando pensamiento...');
      const db = await getDatabase();
      const id = Crypto.randomUUID();
      const thought: Thought = {
        id,
        fecha: format(new Date(), 'yyyy-MM-dd'),
        dia: format(new Date(), 'EEEE', { locale: es }),
        hora: format(new Date(), 'HH:mm:ss'),
        texto: text,
        categoria,  // ← Esta es la categoría que recibe
        created_at: new Date().toISOString(),
      };
      
      // ESTE ES EL LOG QUE DEBES ACTUALIZAR:
      console.log('📝 Insertando:', { 
        id: thought.id, 
        fecha: thought.fecha, 
        texto: thought.texto.substring(0, 30),
        categoria: thought.categoria   // ← AGREGAR ESTO
      });
      
      await db.runAsync(
        'INSERT INTO pensamientos (id, fecha, dia, hora, texto, categoria) VALUES (?, ?, ?, ?, ?, ?)',
        [thought.id, thought.fecha, thought.dia, thought.hora, thought.texto, thought.categoria]
      );
      
      console.log('✅ Pensamiento guardado exitosamente');
      setThoughts(prev => [thought, ...prev]);
      
    } catch (error) {
      console.error('❌ Error al guardar pensamiento:', error);
      throw error;
    }
  };

  const updateThought = async (id: string, newText: string, newCategory?: Category) => {
    try {
      const db = await getDatabase();
      if (newCategory) {
        await db.runAsync(
          'UPDATE pensamientos SET texto = ?, categoria = ? WHERE id = ?', 
          [newText, newCategory, id]
        );
      } else {
        await db.runAsync(
          'UPDATE pensamientos SET texto = ? WHERE id = ?', 
          [newText, id]
        );
      }
      setThoughts(prev => prev.map(t => 
        t.id === id ? { ...t, texto: newText, ...(newCategory && { categoria: newCategory }) } : t
      ));
    } catch (error) {
      console.error('Error actualizando pensamiento:', error);
    }
  };

  const deleteThought = async (id: string) => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM pensamientos WHERE id = ?', [id]);
      setThoughts(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error eliminando pensamiento:', error);
    }
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    thoughts.forEach(t => {
      stats[t.categoria] = (stats[t.categoria] || 0) + 1;
    });
    return Object.entries(stats).map(([categoria, count]) => ({ 
      categoria: categoria as Category, 
      count 
    }));
  };

  const setUserProfile = async (profile: { nombre: string; foto: string | null; pin: string }) => {
    setUserProfileState(profile);
    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT OR REPLACE INTO perfil (id, nombre, foto, pin) VALUES (1, ?, ?, ?)',
        [profile.nombre, profile.foto || '', profile.pin]
      );
    } catch (error) {
      console.log('Guardado local (sin BD):', profile.nombre);
    }
  };

  const authenticate = async (pin: string) => {
    if (pin === userProfile.pin) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  return (
    <MindStreamContext.Provider value={{
      thoughts,
      todayThoughts,
      isLoading,
      affirmation,
      userProfile,
      isAuthenticated,
      setUserProfile,
      authenticate,
      loadThoughts,
      addThought,
      updateThought,
      deleteThought,
      searchThoughts: (query: string) => searchThoughts(thoughts, query),
      getCategoryStats,
    }}>
      {children}
    </MindStreamContext.Provider>
  );
};

export const useMindStream = () => useContext(MindStreamContext);