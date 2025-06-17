#!/usr/bin/env node

/**
 * Script automático para preparar la base de datos
 * Ejecuta la limpieza y configuración de foreign keys
 */

const { supabaseAdmin } = await import('../src/config/supabase.js');
const fs = await import('fs');
const path = await import('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const runSqlScript = async (scriptName) => {
  try {
    const scriptPath = path.join(process.cwd(), 'database', scriptName);
    const sqlContent = fs.readFileSync(scriptPath, 'utf8');
    
    log(`\n📝 Ejecutando: ${scriptName}`, 'yellow');
    
    const { data, error } = await supabaseAdmin.rpc('run_sql_script', {
      sql_script: sqlContent
    });
    
    if (error) {
      log(`❌ Error en ${scriptName}: ${error.message}`, 'red');
      return false;
    } else {
      log(`✅ ${scriptName} ejecutado correctamente`, 'green');
      return true;
    }
  } catch (error) {
    log(`❌ Error leyendo ${scriptName}: ${error.message}`, 'red');
    return false;
  }
};

const checkOrphanedData = async () => {
  log('\n🔍 Verificando datos huérfanos...', 'cyan');
  
  try {
    // Verificar direcciones_envio
    const { data: orphanedAddresses, error: addressError } = await supabaseAdmin
      .from('direcciones_envio')
      .select('id, usuario_id')
      .not('usuario_id', 'in', `(${(await supabaseAdmin.from('usuarios').select('id')).data?.map(u => `"${u.id}"`).join(',') || '""'})`);
    
    if (addressError) {
      log(`⚠️  Error verificando direcciones: ${addressError.message}`, 'yellow');
    } else {
      log(`📍 Direcciones huérfanas encontradas: ${orphanedAddresses?.length || 0}`, 'cyan');
    }
    
    // Verificar reviews
    const { data: orphanedReviews, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('id, usuario_id')
      .not('usuario_id', 'in', `(${(await supabaseAdmin.from('usuarios').select('id')).data?.map(u => `"${u.id}"`).join(',') || '""'})`);
    
    if (reviewError) {
      log(`⚠️  Error verificando reviews: ${reviewError.message}`, 'yellow');
    } else {
      log(`⭐ Reviews huérfanas encontradas: ${orphanedReviews?.length || 0}`, 'cyan');
    }
    
    // Verificar favoritos
    const { data: orphanedFavorites, error: favoriteError } = await supabaseAdmin
      .from('favoritos')
      .select('id, usuario_id')
      .not('usuario_id', 'in', `(${(await supabaseAdmin.from('usuarios').select('id')).data?.map(u => `"${u.id}"`).join(',') || '""'})`);
    
    if (favoriteError) {
      log(`⚠️  Error verificando favoritos: ${favoriteError.message}`, 'yellow');
    } else {
      log(`❤️  Favoritos huérfanos encontrados: ${orphanedFavorites?.length || 0}`, 'cyan');
    }
    
    const totalOrphaned = (orphanedAddresses?.length || 0) + (orphanedReviews?.length || 0) + (orphanedFavorites?.length || 0);
    
    if (totalOrphaned > 0) {
      log(`⚠️  Total de registros huérfanos: ${totalOrphaned}`, 'yellow');
      return false;
    } else {
      log('✅ No se encontraron datos huérfanos', 'green');
      return true;
    }
    
  } catch (error) {
    log(`❌ Error verificando datos huérfanos: ${error.message}`, 'red');
    return false;
  }
};

const cleanOrphanedData = async () => {
  log('\n🧹 Limpiando datos huérfanos...', 'cyan');
  
  try {
    // Limpiar direcciones_envio
    const { error: addressError } = await supabaseAdmin
      .from('direcciones_envio')
      .delete()
      .or('usuario_id.is.null,usuario_id.eq.00000000-0000-0000-0000-000000000000');
    
    if (addressError) {
      log(`⚠️  Error limpiando direcciones: ${addressError.message}`, 'yellow');
    } else {
      log('✅ Direcciones huérfanas limpiadas', 'green');
    }
    
    // Limpiar reviews
    const { error: reviewError } = await supabaseAdmin
      .from('reviews')
      .delete()
      .or('usuario_id.is.null,usuario_id.eq.00000000-0000-0000-0000-000000000000');
    
    if (reviewError) {
      log(`⚠️  Error limpiando reviews: ${reviewError.message}`, 'yellow');
    } else {
      log('✅ Reviews huérfanas limpiadas', 'green');
    }
    
    // Limpiar favoritos
    const { error: favoriteError } = await supabaseAdmin
      .from('favoritos')
      .delete()
      .or('usuario_id.is.null,usuario_id.eq.00000000-0000-0000-0000-000000000000');
    
    if (favoriteError) {
      log(`⚠️  Error limpiando favoritos: ${favoriteError.message}`, 'yellow');
    } else {
      log('✅ Favoritos huérfanos limpiados', 'green');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error limpiando datos huérfanos: ${error.message}`, 'red');
    return false;
  }
};

const main = async () => {
  log('🔧 CONFIGURADOR AUTOMÁTICO DE BASE DE DATOS', 'bold');
  log('===========================================', 'blue');
  
  // Paso 1: Verificar datos huérfanos
  const noOrphans = await checkOrphanedData();
  
  if (!noOrphans) {
    log('\n⚠️  Se encontraron datos huérfanos. Procediendo a limpiarlos...', 'yellow');
    const cleaned = await cleanOrphanedData();
    
    if (!cleaned) {
      log('\n❌ No se pudieron limpiar todos los datos huérfanos', 'red');
      log('📝 Ejecuta manualmente en Supabase: database/cleanup_orphaned_data.sql', 'cyan');
      return;
    }
    
    // Verificar de nuevo después de limpiar
    await checkOrphanedData();
  }
  
  log('\n🔗 Los datos están limpios. Ahora ejecuta manualmente en Supabase:', 'cyan');
  log('📝 1. database/cleanup_orphaned_data.sql (verificación)', 'cyan');
  log('📝 2. database/fix_foreign_keys.sql (foreign keys)', 'cyan');
  
  log('\n✅ Preparación de base de datos completada', 'green');
  log('🚀 Una vez ejecutados los scripts SQL, ejecuta: npm run test:complete', 'cyan');
};

main().catch(console.error);
