#!/usr/bin/env node

/**
 * Script para limpiar específicamente los datos huérfanos restantes
 */

import { supabaseAdmin } from '../src/config/supabase.js';

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

const main = async () => {
  log('🧹 LIMPIEZA ESPECÍFICA DE DATOS HUÉRFANOS', 'bold');
  log('========================================', 'blue');
  
  try {
    // Obtener todos los IDs de usuarios válidos
    const { data: validUsers, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id');
    
    if (userError) {
      log(`❌ Error obteniendo usuarios: ${userError.message}`, 'red');
      return;
    }
    
    const validUserIds = validUsers.map(u => u.id);
    log(`👥 ${validUserIds.length} usuarios válidos encontrados`, 'cyan');
    
    // Limpiar favoritos huérfanos específicamente
    const { data: orphanedFavorites, error: favoriteQueryError } = await supabaseAdmin
      .from('favoritos')
      .select('id, usuario_id')
      .not('usuario_id', 'in', `(${validUserIds.map(id => `"${id}"`).join(',')})`);
    
    if (favoriteQueryError) {
      log(`❌ Error consultando favoritos: ${favoriteQueryError.message}`, 'red');
      return;
    }
    
    log(`❤️  ${orphanedFavorites?.length || 0} favoritos huérfanos encontrados`, 'yellow');
    
    if (orphanedFavorites && orphanedFavorites.length > 0) {
      log('📋 Favoritos huérfanos:', 'cyan');
      orphanedFavorites.forEach(fav => {
        log(`   - ID: ${fav.id}, usuario_id: ${fav.usuario_id}`, 'cyan');
      });
      
      // Eliminar favoritos huérfanos
      const orphanedIds = orphanedFavorites.map(f => f.id);
      const { error: deleteError } = await supabaseAdmin
        .from('favoritos')
        .delete()
        .in('id', orphanedIds);
      
      if (deleteError) {
        log(`❌ Error eliminando favoritos: ${deleteError.message}`, 'red');
      } else {
        log(`✅ ${orphanedIds.length} favoritos huérfanos eliminados`, 'green');
      }
    }
    
    // Verificar direcciones huérfanas
    const { data: orphanedAddresses, error: addressQueryError } = await supabaseAdmin
      .from('direcciones_envio')
      .select('id, usuario_id')
      .not('usuario_id', 'in', `(${validUserIds.map(id => `"${id}"`).join(',')})`);
    
    if (addressQueryError) {
      log(`❌ Error consultando direcciones: ${addressQueryError.message}`, 'red');
    } else {
      log(`🏠 ${orphanedAddresses?.length || 0} direcciones huérfanas encontradas`, 'yellow');
      
      if (orphanedAddresses && orphanedAddresses.length > 0) {
        const addressIds = orphanedAddresses.map(a => a.id);
        const { error: deleteAddressError } = await supabaseAdmin
          .from('direcciones_envio')
          .delete()
          .in('id', addressIds);
        
        if (deleteAddressError) {
          log(`❌ Error eliminando direcciones: ${deleteAddressError.message}`, 'red');
        } else {
          log(`✅ ${addressIds.length} direcciones huérfanas eliminadas`, 'green');
        }
      }
    }
    
    // Verificar reviews huérfanas
    const { data: orphanedReviews, error: reviewQueryError } = await supabaseAdmin
      .from('reviews')
      .select('id, usuario_id')
      .not('usuario_id', 'in', `(${validUserIds.map(id => `"${id}"`).join(',')})`);
    
    if (reviewQueryError) {
      log(`❌ Error consultando reviews: ${reviewQueryError.message}`, 'red');
    } else {
      log(`⭐ ${orphanedReviews?.length || 0} reviews huérfanas encontradas`, 'yellow');
      
      if (orphanedReviews && orphanedReviews.length > 0) {
        const reviewIds = orphanedReviews.map(r => r.id);
        const { error: deleteReviewError } = await supabaseAdmin
          .from('reviews')
          .delete()
          .in('id', reviewIds);
        
        if (deleteReviewError) {
          log(`❌ Error eliminando reviews: ${deleteReviewError.message}`, 'red');
        } else {
          log(`✅ ${reviewIds.length} reviews huérfanas eliminadas`, 'green');
        }
      }
    }
    
    log('\n🎉 Limpieza completada', 'green');
    log('📝 Ahora ejecuta en Supabase: database/fix_foreign_keys.sql', 'cyan');
    
  } catch (error) {
    log(`❌ Error general: ${error.message}`, 'red');
  }
};

main().catch(console.error);
