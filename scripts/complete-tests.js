#!/usr/bin/env node

/**
 * Script de pruebas completas del sistema de carrito, favoritos y cupones
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testDatabaseTables = async () => {
  log('\n🗄️  VERIFICACIÓN DE TABLAS DE BASE DE DATOS', 'bold');
  log('============================================', 'blue');

  const tables = [
    'usuarios',
    'productos',
    'categorias',
    'carrito',
    'favoritos',
    'cupones',
    'pedidos',
    'detalles_pedido',
    'direcciones_envio',
    'reviews'
  ];

  const results = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        results[table] = { exists: false, error: error.message };
        log(`❌ ${table}: ${error.message}`, 'red');
      } else {
        results[table] = { exists: true };
        log(`✅ ${table}: OK`, 'green');
      }
    } catch (err) {
      results[table] = { exists: false, error: err.message };
      log(`❌ ${table}: ${err.message}`, 'red');
    }
  }

  return results;
};

const testCartFunctionality = async () => {
  log('\n🛒 PRUEBA DE FUNCIONALIDAD DEL CARRITO', 'bold');
  log('====================================', 'blue');

  try {
    // Buscar un usuario de prueba
    const { data: users, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id, correo_electronico')
      .limit(1);

    if (userError || !users || users.length === 0) {
      log('⚠️  No hay usuarios para probar. Créalos primero con npm run test:data', 'yellow');
      return false;
    }

    const testUser = users[0];
    log(`👤 Usuario de prueba: ${testUser.correo_electronico}`, 'cyan');

    // Verificar productos disponibles
    const { data: products, error: productError } = await supabaseAdmin
      .from('productos')
      .select('id, nombre, precio, stock')
      .gt('stock', 0)
      .limit(3);

    if (productError || !products || products.length === 0) {
      log('⚠️  No hay productos disponibles. Créalos primero con npm run test:data', 'yellow');
      return false;
    }

    log(`📦 ${products.length} productos disponibles para prueba`, 'cyan');

    // Limpiar carrito del usuario de prueba
    await supabaseAdmin
      .from('carrito')
      .delete()
      .eq('usuario_id', testUser.id);

    log('🧹 Carrito limpio para pruebas', 'cyan');

    // Agregar productos al carrito
    for (const product of products) {
      const { error: addError } = await supabaseAdmin
        .from('carrito')
        .insert({
          usuario_id: testUser.id,
          producto_id: product.id,
          cantidad: Math.min(2, product.stock)
        });

      if (addError) {
        log(`❌ Error agregando ${product.nombre}: ${addError.message}`, 'red');
      } else {
        log(`✅ ${product.nombre} agregado al carrito`, 'green');
      }
    }

    // Verificar carrito
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('carrito')
      .select(`
        *,
        productos(nombre, precio)
      `)
      .eq('usuario_id', testUser.id);

    if (cartError) {
      log(`❌ Error obteniendo carrito: ${cartError.message}`, 'red');
      return false;
    }

    log(`✅ Carrito tiene ${cartItems.length} elementos`, 'green');
    
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.productos.precio * item.cantidad);
    }, 0);

    log(`💰 Total del carrito: €${total.toFixed(2)}`, 'cyan');

    return true;
  } catch (error) {
    log(`❌ Error en prueba de carrito: ${error.message}`, 'red');
    return false;
  }
};

const testFavoritesFunctionality = async () => {
  log('\n❤️  PRUEBA DE FUNCIONALIDAD DE FAVORITOS', 'bold');
  log('=====================================', 'blue');

  try {
    // Buscar un usuario de prueba
    const { data: users, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id, correo_electronico')
      .limit(1);

    if (userError || !users || users.length === 0) {
      log('⚠️  No hay usuarios para probar', 'yellow');
      return false;
    }

    const testUser = users[0];

    // Buscar productos
    const { data: products, error: productError } = await supabaseAdmin
      .from('productos')
      .select('id, nombre')
      .limit(2);

    if (productError || !products || products.length === 0) {
      log('⚠️  No hay productos disponibles', 'yellow');
      return false;
    }

    // Limpiar favoritos del usuario
    await supabaseAdmin
      .from('favoritos')
      .delete()
      .eq('usuario_id', testUser.id);

    // Agregar a favoritos
    for (const product of products) {
      const { error: favError } = await supabaseAdmin
        .from('favoritos')
        .insert({
          usuario_id: testUser.id,
          producto_id: product.id
        });

      if (favError) {
        log(`❌ Error agregando ${product.nombre} a favoritos: ${favError.message}`, 'red');
      } else {
        log(`✅ ${product.nombre} agregado a favoritos`, 'green');
      }
    }

    // Verificar favoritos
    const { data: favorites, error: favoritesError } = await supabaseAdmin
      .from('favoritos')
      .select(`
        *,
        productos(nombre)
      `)
      .eq('usuario_id', testUser.id);

    if (favoritesError) {
      log(`❌ Error obteniendo favoritos: ${favoritesError.message}`, 'red');
      return false;
    }

    log(`✅ Usuario tiene ${favorites.length} productos en favoritos`, 'green');

    return true;
  } catch (error) {
    log(`❌ Error en prueba de favoritos: ${error.message}`, 'red');
    return false;
  }
};

const testCouponFunctionality = async () => {
  log('\n🎫 PRUEBA DE FUNCIONALIDAD DE CUPONES', 'bold');
  log('==================================', 'blue');

  try {
    // Verificar cupones disponibles
    const { data: coupons, error: couponError } = await supabaseAdmin
      .from('cupones')
      .select('codigo, descuento, fecha_expiracion')
      .order('id', { ascending: false });

    if (couponError) {
      log(`❌ Error obteniendo cupones: ${couponError.message}`, 'red');
      return false;
    }

    if (!coupons || coupons.length === 0) {
      log('⚠️  No hay cupones disponibles. Créalos primero con npm run test:data', 'yellow');
      return false;
    }

    log(`🎟️  ${coupons.length} cupones disponibles`, 'cyan');

    for (const coupon of coupons.slice(0, 3)) {
      const isExpired = coupon.fecha_expiracion && new Date(coupon.fecha_expiracion) < new Date();
      const status = isExpired ? '❌ EXPIRADO' : '✅ ACTIVO';
      const expiration = coupon.fecha_expiracion ? 
        new Date(coupon.fecha_expiracion).toLocaleDateString() : 
        'Sin expiración';
      
      log(`  📄 ${coupon.codigo}: ${coupon.descuento}% - ${status} (${expiration})`, 'cyan');
    }

    // Encontrar un cupón activo
    const activeCoupon = coupons.find(c => 
      !c.fecha_expiracion || new Date(c.fecha_expiracion) >= new Date()
    );

    if (activeCoupon) {
      log(`✅ Cupón activo encontrado: ${activeCoupon.codigo} (${activeCoupon.descuento}%)`, 'green');
    } else {
      log('⚠️  No hay cupones activos', 'yellow');
    }

    return true;
  } catch (error) {
    log(`❌ Error en prueba de cupones: ${error.message}`, 'red');
    return false;
  }
};

const testOrderDetailsTable = async () => {
  log('\n📋 PRUEBA DE TABLA DETALLES_PEDIDO', 'bold');
  log('==============================', 'blue');

  try {
    // Verificar que la tabla existe y tiene la estructura correcta
    const { data, error } = await supabaseAdmin
      .from('detalles_pedido')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.detalles_pedido" does not exist')) {
        log('❌ Tabla detalles_pedido no existe', 'red');
        log('💡 Ejecuta: npm run migrate:detalles-pedido', 'yellow');
        return false;
      } else {
        log(`❌ Error con tabla detalles_pedido: ${error.message}`, 'red');
        return false;
      }
    }

    log('✅ Tabla detalles_pedido existe y es accesible', 'green');

    // Verificar si hay algún pedido para probar
    const { data: orders, error: orderError } = await supabaseAdmin
      .from('pedidos')
      .select('id')
      .limit(1);

    if (orderError) {
      log('⚠️  No se pueden verificar pedidos existentes', 'yellow');
    } else if (!orders || orders.length === 0) {
      log('ℹ️  No hay pedidos existentes (normal en desarrollo)', 'blue');
    } else {
      log(`✅ Sistema de pedidos funcional (${orders.length} pedidos)`, 'green');
    }

    return true;
  } catch (error) {
    log(`❌ Error en prueba de detalles_pedido: ${error.message}`, 'red');
    return false;
  }
};

const generateReport = (results) => {
  log('\n📊 REPORTE DE ESTADO DEL SISTEMA', 'bold');
  log('===============================', 'blue');

  const { tables, cart, favorites, coupons, orderDetails } = results;

  // Reporte de tablas
  log('\n🗄️  Estado de Tablas:', 'magenta');
  const criticalTables = ['usuarios', 'productos', 'carrito', 'favoritos', 'cupones'];
  let tablesOk = 0;
  
  for (const [table, result] of Object.entries(tables)) {
    const isCritical = criticalTables.includes(table);
    const status = result.exists ? '✅' : '❌';
    const importance = isCritical ? '(CRÍTICA)' : '(OPCIONAL)';
    log(`  ${status} ${table} ${importance}`, result.exists ? 'green' : 'red');
    if (result.exists) tablesOk++;
  }

  // Reporte de funcionalidades
  log('\n🔧 Estado de Funcionalidades:', 'magenta');
  log(`  ${cart ? '✅' : '❌'} Sistema de Carrito`, cart ? 'green' : 'red');
  log(`  ${favorites ? '✅' : '❌'} Sistema de Favoritos`, favorites ? 'green' : 'red');
  log(`  ${coupons ? '✅' : '❌'} Sistema de Cupones`, coupons ? 'green' : 'red');
  log(`  ${orderDetails ? '✅' : '❌'} Tabla Detalles Pedido`, orderDetails ? 'green' : 'red');

  // Resumen general
  log('\n📈 Resumen General:', 'magenta');
  const totalTables = Object.keys(tables).length;
  const tablesPercentage = Math.round((tablesOk / totalTables) * 100);
  
  const functionalityCount = [cart, favorites, coupons, orderDetails].filter(Boolean).length;
  const functionalityPercentage = Math.round((functionalityCount / 4) * 100);

  log(`  📊 Tablas: ${tablesOk}/${totalTables} (${tablesPercentage}%)`, 
    tablesPercentage >= 80 ? 'green' : 'yellow');
  log(`  ⚙️  Funcionalidades: ${functionalityCount}/4 (${functionalityPercentage}%)`, 
    functionalityPercentage >= 75 ? 'green' : 'yellow');

  // Estado general
  if (functionalityPercentage >= 75 && tablesPercentage >= 80) {
    log('\n🎉 SISTEMA LISTO PARA PRODUCCIÓN!', 'green');
  } else if (functionalityPercentage >= 50 && tablesPercentage >= 60) {
    log('\n⚠️  SISTEMA PARCIALMENTE FUNCIONAL', 'yellow');
    log('   Requiere algunas correcciones antes de producción', 'yellow');
  } else {
    log('\n❌ SISTEMA REQUIERE ATENCIÓN', 'red');
    log('   Múltiples problemas detectados', 'red');
  }

  // Recomendaciones
  log('\n💡 Próximos Pasos:', 'blue');
  if (!orderDetails) {
    log('  1. Ejecutar: npm run migrate:detalles-pedido', 'cyan');
  }
  if (tablesOk < totalTables) {
    log('  2. Verificar configuración de base de datos', 'cyan');
  }
  if (!cart || !favorites || !coupons) {
    log('  3. Crear datos de prueba: npm run test:data', 'cyan');
  }
  log('  4. Iniciar servidor: npm run dev', 'cyan');
  log('  5. Probar API endpoints según docs/API_TESTING.md', 'cyan');
};

const main = async () => {
  log('🔬 SISTEMA DE PRUEBAS COMPLETAS', 'bold');
  log('==============================', 'blue');
  log('Verificando carrito, favoritos, cupones y base de datos...', 'cyan');

  const results = {
    tables: await testDatabaseTables(),
    cart: await testCartFunctionality(),
    favorites: await testFavoritesFunctionality(),
    coupons: await testCouponFunctionality(),
    orderDetails: await testOrderDetailsTable()
  };

  generateReport(results);

  log('\n✨ Pruebas completas terminadas', 'green');
};

// Ejecutar las pruebas
main().catch(console.error);
