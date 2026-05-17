import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Thought } from '../database/database';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export async function generatePDF(thoughts: Thought[], title: string): Promise<void> {
  // 1. Generar nombre personalizado
  const today = new Date();
  const dateStr = format(today, 'yyyyMMdd');
  const timeStr = format(today, 'HHmm');
  const pdfName = `MindStream_${dateStr}_${timeStr}.pdf`;

  // 2. Crear filas de la tabla
  const rows = thoughts.map(t => `
    <tr>
      <td>${t.fecha}</td>
      <td>${t.dia}</td>
      <td>${t.hora.substring(0, 5)}</td>
      <td>
        <span style="background: ${getCategoryBgColor(t.categoria)}; color: ${getCategoryColor(t.categoria)}; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600;">
          ${t.categoria}
        </span>
      </td>
      <td>${escapeHtml(t.texto)}</td>
    </tr>
  `).join('');

  // 3. Crear HTML profesional
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body { 
        font-family: 'Inter', -apple-system, sans-serif; 
        padding: 40px 30px; 
        color: #1F2937;
        background: #FFF;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #E5E7EB;
      }
      
      .logo {
        font-size: 32px;
        font-weight: 800;
        background: linear-gradient(135deg, #6366F1, #8B5CF6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 4px;
      }
      
      .subtitle {
        color: #6B7280;
        font-size: 14px;
        font-weight: 400;
      }
      
      .title-section {
        background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 24px;
      }
      
      .title-section h2 {
        color: #4C1D95;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 4px;
      }
      
      .title-section p {
        color: #6B7280;
        font-size: 12px;
      }
      
      .stats-row {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
      }
      
      .stat-box {
        flex: 1;
        background: #F9FAFB;
        border-radius: 10px;
        padding: 12px;
        text-align: center;
        border: 1px solid #E5E7EB;
      }
      
      .stat-number {
        font-size: 24px;
        font-weight: 800;
        color: #6366F1;
      }
      
      .stat-label {
        font-size: 10px;
        color: #6B7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-bottom: 24px;
        font-size: 11px;
      }
      
      thead {
        background: linear-gradient(135deg, #6366F1, #8B5CF6);
      }
      
      th { 
        color: white; 
        padding: 12px 10px; 
        text-align: left; 
        font-weight: 600;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      th:first-child { border-radius: 8px 0 0 0; }
      th:last-child { border-radius: 0 8px 0 0; }
      
      td { 
        padding: 10px; 
        border-bottom: 1px solid #F3F4F6;
        vertical-align: top;
      }
      
      tr:nth-child(even) { background: #FAFAFA; }
      tr:hover { background: #F5F3FF; }
      
      .text-cell {
        max-width: 250px;
        line-height: 1.5;
      }
      
      .footer {
        margin-top: 30px;
        padding-top: 16px;
        border-top: 1px solid #E5E7EB;
        text-align: center;
        color: #9CA3AF;
        font-size: 10px;
      }
      
      .footer .brand {
        font-weight: 700;
        background: linear-gradient(135deg, #6366F1, #8B5CF6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      @page {
        margin: 20px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">🧠 MindStream</div>
      <div class="subtitle">La evolución de tus pensamientos</div>
    </div>
    
    <div class="title-section">
      <h2>${title}</h2>
      <p>Generado el ${format(today, "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}</p>
    </div>
    
    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-number">${thoughts.length}</div>
        <div class="stat-label">Pensamientos</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${getUniqueCategories(thoughts)}</div>
        <div class="stat-label">Categorías</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${getUniqueDays(thoughts)}</div>
        <div class="stat-label">Días</div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>📅 Fecha</th>
          <th>📆 Día</th>
          <th>🕐 Hora</th>
          <th>🏷️ Categoría</th>
          <th>💭 Pensamiento</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    
    <div class="footer">
      <p>Generado con <span class="brand">MindStream</span> • ${format(today, "yyyy", { locale: es })}</p>
      <p style="margin-top: 4px;">Archivo: ${pdfName}</p>
    </div>
  </body>
  </html>`;

  // 4. Generar PDF
  const { uri } = await Print.printToFileAsync({ 
    html,
    base64: false
  });

  // 5. Copiar a ubicación con nombre personalizado
  const pdfDir = FileSystem.documentDirectory + 'pdfs/';
  const dirInfo = await FileSystem.getInfoAsync(pdfDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(pdfDir, { intermediates: true });
  }

  const newUri = pdfDir + pdfName;
  await FileSystem.copyAsync({ from: uri, to: newUri });

  // 6. Compartir
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(newUri, {
      mimeType: 'application/pdf',
      dialogTitle: `Guardar MindStream - ${pdfName}`,
      UTI: 'com.adobe.pdf',
    });
  }
}

// Funciones auxiliares
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getCategoryColor(categoria: string): string {
  const colors: Record<string, string> = {
    'Tristeza': '#6366F1',
    'Alegría': '#F59E0B',
    'Recuerdo': '#8B5CF6',
    'Ansiedad': '#EF4444',
    'Gratitud': '#10B981',
    'Reflexión': '#3B82F6',
    'Miedo': '#EC4899',
    'Esperanza': '#14B8A6',
  };
  return colors[categoria] || '#6B7280';
}

function getCategoryBgColor(categoria: string): string {
  const color = getCategoryColor(categoria);
  return color + '20';
}

function getUniqueCategories(thoughts: Thought[]): number {
  return new Set(thoughts.map(t => t.categoria)).size;
}

function getUniqueDays(thoughts: Thought[]): number {
  return new Set(thoughts.map(t => t.fecha)).size;
}