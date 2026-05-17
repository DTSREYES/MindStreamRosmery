import { Thought, Category, CATEGORIES } from '../database/database';

export function searchThoughts(thoughts: Thought[], query: string): Thought[] {
  if (!query.trim()) return thoughts;
  
  const q = query.toLowerCase().trim();
  
  return thoughts.filter(thought => {
    // Buscar por texto
    if (thought.texto.toLowerCase().includes(q)) return true;
    
    // Buscar por fecha (formato: YYYY-MM-DD, YYYY-MM, DD-MM, etc.)
    if (thought.fecha.includes(q) || 
        thought.fecha.replace(/-/g, '').includes(q.replace(/-/g, ''))) return true;
    
    // Buscar por día
    if (thought.dia.toLowerCase().includes(q)) return true;
    
    // Buscar por hora
    if (thought.hora.includes(q)) return true;
    
    // Buscar por categoría
    if (thought.categoria.toLowerCase().includes(q)) return true;
    
    return false;
  });
}