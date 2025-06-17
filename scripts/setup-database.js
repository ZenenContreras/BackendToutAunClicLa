#!/usr/bin/env node

/**
 * Script para ejecutar el esquema completo de la base de datos en Supabase
 * 
 * Uso:
 * npm run setup-db
 * o
 * node scripts/setup-database.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabaseAdmin } from '../src/config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeSQL(sqlContent) {
  try {
    console.log('Ejecutando SQL en Supabase...');
    
    // Para Supabase, necesitamos ejecutar las consultas mediante la API REST
    // En producción, esto se haría mejor a través de la interfaz web de Supabase
    // o usando el CLI de Supabase
    
    console.log('⚠️  IMPORTANTE: Este script debe ejecutarse manualmente en Supabase.');
    console.log('📋 Copia el siguiente SQL y ejecútalo en el editor SQL de Supabase:\n');
    console.log('----------------------------------------');
    console.log(sqlContent);
    console.log('----------------------------------------\n');
    
    console.log('📝 Pasos para ejecutar:');
    console.log('1. Ve a tu dashboard de Supabase');
    console.log('2. Abre el editor SQL');
    console.log('3. Copia y pega el SQL mostrado arriba');
    console.log('4. Ejecuta la consulta');
    console.log('5. Verifica que todas las tablas se hayan creado correctamente:');
    console.log('   - usuarios (con campos en español)');
    console.log('   - productos');
    console.log('   - categorias');
    console.log('   - reviews');
    console.log('   - cart_items');
    console.log('   - orders');
    console.log('   - order_items');
    console.log('   - addresses');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function setupDatabase() {
  try {
    console.log('🚀 Configurando base de datos...');
    
    // Leer el archivo SQL del esquema completo
    const sqlFilePath = path.join(__dirname, '..', 'database', 'schema_completo_es.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Archivo SQL no encontrado: ${sqlFilePath}`);
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    const success = await executeSQL(sqlContent);
    
    if (success) {
      console.log('✅ Script completado. Por favor ejecuta el SQL manualmente en Supabase.');
      console.log('🔧 Esto configurará toda la base de datos con nombres de campos en español.');
    } else {
      console.log('❌ Error al procesar el script.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };
