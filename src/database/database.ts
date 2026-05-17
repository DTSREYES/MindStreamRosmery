import * as SQLite from 'expo-sqlite';

export type Category = 'Tristeza' | 'Alegría' | 'Recuerdo' | 'Ansiedad' | 'Gratitud' | 'Reflexión' | 'Miedo' | 'Esperanza';

export const CATEGORIES: Category[] = [
  'Tristeza', 'Alegría', 'Recuerdo', 'Ansiedad', 
  'Gratitud', 'Reflexión', 'Miedo', 'Esperanza'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  'Tristeza': '#6366F1',
  'Alegría': '#F59E0B',
  'Recuerdo': '#8B5CF6',
  'Ansiedad': '#EF4444',
  'Gratitud': '#10B981',
  'Reflexión': '#3B82F6',
  'Miedo': '#EC4899',
  'Esperanza': '#14B8A6',
};

export interface Thought {
  id: string;
  fecha: string;
  dia: string;
  hora: string;
  texto: string;
  categoria: Category;
  created_at: string;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  try {
    console.log('🟢 Iniciando base de datos...');
    const db = await SQLite.openDatabaseAsync('mindstream.db');
    
    // Crear tabla si no existe
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pensamientos (
        id TEXT PRIMARY KEY NOT NULL,
        fecha TEXT NOT NULL,
        dia TEXT NOT NULL,
        hora TEXT NOT NULL,
        texto TEXT NOT NULL,
        categoria TEXT NOT NULL DEFAULT 'Reflexión',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Tabla pensamientos verificada/creada');
    
    // Verificar que la tabla existe
    const tables = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='pensamientos';"
    );
    console.log('📋 Tablas encontradas:', tables);
    
    if (tables.length === 0) {
      console.error('❌ La tabla pensamientos no se creó correctamente');
      // Intentar crear de nuevo
      await db.execAsync(`
        CREATE TABLE pensamientos (
          id TEXT PRIMARY KEY NOT NULL,
          fecha TEXT NOT NULL,
          dia TEXT NOT NULL,
          hora TEXT NOT NULL,
          texto TEXT NOT NULL,
          categoria TEXT NOT NULL DEFAULT 'Reflexión',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('🔄 Reintentando creación de tabla...');
    }
    
    // Crear tabla de perfil
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS perfil (
        id INTEGER PRIMARY KEY DEFAULT 1,
        nombre TEXT DEFAULT 'Usuario',
        foto TEXT,
        pin TEXT DEFAULT '1234',
        ultimo_acceso TEXT
      );
    `);
    
    console.log('✅ Base de datos inicializada correctamente');
    dbInstance = db;
    return db;
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  
  try {
    const db = await SQLite.openDatabaseAsync('mindstream.db');
    dbInstance = db;
    return db;
  } catch (error) {
    console.error('Error obteniendo base de datos:', error);
    return await initDatabase();
  }
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    console.log('🔒 Base de datos cerrada');
  }
}