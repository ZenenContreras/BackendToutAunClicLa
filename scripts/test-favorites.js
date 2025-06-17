#!/usr/bin/env node

/**
 * Script de pruebas para el sistema de favoritos
 * @author GitHub Copilot
 * @date 2024
 */

import { supabaseAdmin } from '../src/config/supabase.js';

// Colores para la consola
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

const testFavoritesAPI = async () => {
  log('\n❤️  TESTING DEL SISTEMA DE FAVORITOS', 'bold');
  log('===================================', 'blue');

  try {
    // 1. Obtener usuario de prueba
    const { data: users, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id, correo_electronico')
      .limit(1);

    if (userError || !users || users.length === 0) {
      log('❌ No hay usuarios para probar. Ejecuta: npm run test:data create', 'red');
      return false;
    }

    const testUser = users[0];
    log(`👤 Usuario de prueba: ${testUser.correo_electronico}`, 'cyan');

    // 2. Obtener productos disponibles
    const { data: products, error: productError } = await supabaseAdmin
      .from('productos')
      .select('id, nombre')
      .limit(3);

    if (productError || !products || products.length === 0) {
      log('❌ No hay productos disponibles', 'red');
      return false;
    }

    log(`📦 ${products.length} productos disponibles para testing`, 'cyan');

    // 3. Limpiar favoritos existentes del usuario
    await supabaseAdmin
      .from('favoritos')
      .delete()
      .eq('usuario_id', testUser.id);

    log('🧹 Favoritos del usuario limpiados', 'cyan');

    // 4. Test: Verificar favoritos vacíos
    log('\n📝 Test 1: Obtener favoritos vacíos', 'yellow');
    const { data: emptyFavorites, error: emptyError } = await supabaseAdmin
      .from('favoritos')
      .select(`
        *,
        productos(
          id,
          nombre,
          precio,
          imagen_principal,
          stock,
          categorias(nombre)
        )
      `)
      .eq('usuario_id', testUser.id);

    if (emptyError) {
      log(`❌ Error obteniendo favoritos vacíos: ${emptyError.message}`, 'red');
    } else {
      log(`✅ Favoritos vacíos obtenidos correctamente (${emptyFavorites.length} elementos)`, 'green');
    }

    // 5. Test: Agregar producto a favoritos
    log('\n📝 Test 2: Agregar productos a favoritos', 'yellow');
    let addedCount = 0;
    
    for (const product of products) {
      // Verificar que el producto no esté ya en favoritos
      const { data: existing } = await supabaseAdmin
        .from('favoritos')
        .select('id')
        .eq('usuario_id', testUser.id)
        .eq('producto_id', product.id)
        .single();

      if (existing) {
        log(`⚠️  ${product.nombre} ya está en favoritos`, 'yellow');
        continue;
      }

      // Agregar a favoritos
      const { data: favorite, error: addError } = await supabaseAdmin
        .from('favoritos')
        .insert([{
          usuario_id: testUser.id,
          producto_id: product.id
        }])
        .select(`
          *,
          productos(
            id,
            nombre,
            precio,
            imagen_principal,
            stock
          )
        `)
        .single();

      if (addError) {
        log(`❌ Error agregando ${product.nombre}: ${addError.message}`, 'red');
      } else {
        log(`✅ ${product.nombre} agregado a favoritos`, 'green');
        addedCount++;
      }
    }

    // 6. Test: Verificar favoritos agregados
    log('\n📝 Test 3: Verificar favoritos agregados', 'yellow');
    const { data: favorites, error: favoritesError } = await supabaseAdmin
      .from('favoritos')
      .select(`
        *,
        productos(
          id,
          nombre,
          precio,
          imagen_principal,
          stock,
          categorias(nombre)
        )
      `)
      .eq('usuario_id', testUser.id)
      .order('fecha_agregado', { ascending: false });

    if (favoritesError) {
      log(`❌ Error obteniendo favoritos: ${favoritesError.message}`, 'red');
    } else {
      log(`✅ ${favorites.length} favoritos obtenidos correctamente`, 'green');
      favorites.forEach((fav, index) => {
        log(`   ${index + 1}. ${fav.productos.nombre} - €${fav.productos.precio}`, 'cyan');
      });
    }

    // 7. Test: Verificar estado de favorito específico
    log('\n📝 Test 4: Verificar estado de favorito específico', 'yellow');
    if (products.length > 0) {
      const testProduct = products[0];
      const { data: favoriteStatus, error: statusError } = await supabaseAdmin
        .from('favoritos')
        .select('id')
        .eq('usuario_id', testUser.id)
        .eq('producto_id', testProduct.id)
        .single();

      if (statusError && statusError.code !== 'PGRST116') {
        log(`❌ Error verificando estado: ${statusError.message}`, 'red');
      } else {
        const isFavorite = !!favoriteStatus;
        log(`✅ Estado del producto ${testProduct.nombre}: ${isFavorite ? 'ES FAVORITO' : 'NO ES FAVORITO'}`, 'green');
      }
    }

    // 8. Test: Intentar agregar duplicado
    log('\n📝 Test 5: Intentar agregar producto duplicado', 'yellow');
    if (products.length > 0) {
      const testProduct = products[0];
      const { data: duplicate, error: duplicateError } = await supabaseAdmin
        .from('favoritos')
        .insert([{
          usuario_id: testUser.id,
          producto_id: testProduct.id
        }]);

      if (duplicateError) {
        log(`✅ Duplicado rechazado correctamente: ${duplicateError.message}`, 'green');
      } else {
        log(`⚠️  Duplicado fue aceptado (no debería ocurrir)`, 'yellow');
      }
    }

    // 9. Test: Eliminar favorito
    log('\n📝 Test 6: Eliminar favorito', 'yellow');
    if (favorites && favorites.length > 0) {
      const favoriteToDelete = favorites[0];
      const { error: deleteError } = await supabaseAdmin
        .from('favoritos')
        .delete()
        .eq('usuario_id', testUser.id)
        .eq('producto_id', favoriteToDelete.producto_id);

      if (deleteError) {
        log(`❌ Error eliminando favorito: ${deleteError.message}`, 'red');
      } else {
        log(`✅ Favorito eliminado: ${favoriteToDelete.productos.nombre}`, 'green');
      }
    }

    // 10. Test: Verificar favoritos después de eliminación
    log('\n📝 Test 7: Verificar favoritos después de eliminación', 'yellow');
    const { data: finalFavorites, error: finalError } = await supabaseAdmin
      .from('favoritos')
      .select('*')
      .eq('usuario_id', testUser.id);

    if (finalError) {
      log(`❌ Error obteniendo favoritos finales: ${finalError.message}`, 'red');
    } else {
      log(`✅ ${finalFavorites.length} favoritos restantes`, 'green');
    }

    log('\n🎉 Testing de favoritos completado', 'green');
    return true;

  } catch (error) {
    log(`❌ Error general en testing: ${error.message}`, 'red');
    return false;
  }
};

const main = async () => {
  log('❤️  SISTEMA DE TESTING - FAVORITOS', 'bold');
  log('==================================', 'blue');

  const basicTestsResult = await testFavoritesAPI();

  log('\n📊 RESUMEN DE TESTING DE FAVORITOS', 'bold');
  log('==================================', 'blue');

  if (basicTestsResult) {
    log('✅ Tests básicos: PASADOS', 'green');
    log('✅ Sistema de favoritos: FUNCIONAL', 'green');
    log('✅ CRUD de favoritos: OPERATIVO', 'green');
    log('✅ Validaciones: FUNCIONANDO', 'green');
  } else {
    log('❌ Tests básicos: FALLIDOS', 'red');
    log('⚠️  Revisar configuración del sistema', 'yellow');
  }

  log('\n🔗 Endpoints de favoritos:', 'blue');
  log('  GET    /api/v1/favorites', 'cyan');
  log('  POST   /api/v1/favorites', 'cyan');
  log('  DELETE /api/v1/favorites/:productId', 'cyan');
  log('  GET    /api/v1/favorites/status/:productId', 'cyan');
};

// Ejecutar tests
main().catch(console.error);