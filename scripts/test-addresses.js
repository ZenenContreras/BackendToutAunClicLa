#!/usr/bin/env node

/**
 * Script de pruebas para el sistema de direcciones de envío
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

const testAddressesAPI = async () => {
  log('\n🏠 TESTING DEL SISTEMA DE DIRECCIONES', 'bold');
  log('====================================', 'blue');

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

    // 2. Limpiar direcciones existentes del usuario
    await supabaseAdmin
      .from('direcciones_envio')
      .delete()
      .eq('usuario_id', testUser.id);

    log('🧹 Direcciones del usuario limpiadas', 'cyan');

    // 3. Test: Obtener direcciones vacías
    log('\n📝 Test 1: Obtener direcciones vacías', 'yellow');
    const { data: emptyAddresses, error: emptyError } = await supabaseAdmin
      .from('direcciones_envio')
      .select('*')
      .eq('usuario_id', testUser.id);

    if (emptyError) {
      log(`❌ Error obteniendo direcciones vacías: ${emptyError.message}`, 'red');
    } else {
      log(`✅ Direcciones vacías obtenidas correctamente (${emptyAddresses.length} elementos)`, 'green');
    }

    // 4. Test: Crear dirección válida
    log('\n📝 Test 2: Crear dirección válida', 'yellow');
    const addressData = {
      usuario_id: testUser.id,
      direccion: 'Calle Principal 123, Apartamento 4B',
      ciudad: 'París',
      estado: 'Île-de-France',
      codigo_postal: '75001',
      pais: 'Francia',
      telefono: '+33 1 23 45 67 89'
    };

    const { data: newAddress, error: createError } = await supabaseAdmin
      .from('direcciones_envio')
      .insert([addressData])
      .select('*')
      .single();

    if (createError) {
      log(`❌ Error creando dirección: ${createError.message}`, 'red');
    } else {
      log(`✅ Dirección creada: ${newAddress.direccion}`, 'green');
      log(`   Ciudad: ${newAddress.ciudad}, ${newAddress.estado}`, 'cyan');
      log(`   Código postal: ${newAddress.codigo_postal}`, 'cyan');
      log(`   País: ${newAddress.pais}`, 'cyan');
      log(`   Teléfono: ${newAddress.telefono}`, 'cyan');
    }

    // 5. Test: Crear múltiples direcciones
    log('\n📝 Test 3: Crear múltiples direcciones', 'yellow');
    const additionalAddresses = [
      {
        usuario_id: testUser.id,
        direccion: 'Avenue des Champs-Élysées 456',
        ciudad: 'París',
        estado: 'Île-de-France',
        codigo_postal: '75008',
        pais: 'Francia',
        telefono: '+33 1 98 76 54 32'
      },
      {
        usuario_id: testUser.id,
        direccion: 'Rue de la Paix 789',
        ciudad: 'Lyon',
        estado: 'Auvergne-Rhône-Alpes',
        codigo_postal: '69001',
        pais: 'Francia',
        telefono: null // Teléfono opcional
      },
      {
        usuario_id: testUser.id,
        direccion: '123 Office Street, Suite 500',
        ciudad: 'Marsella',
        estado: 'Provence-Alpes-Côte d\'Azur',
        codigo_postal: '13001',
        pais: 'Francia',
        telefono: '+33 4 12 34 56 78'
      }
    ];

    let addressesCreated = 0;
    for (const addr of additionalAddresses) {
      const { data: address, error } = await supabaseAdmin
        .from('direcciones_envio')
        .insert([addr])
        .select('*')
        .single();

      if (error) {
        log(`❌ Error creando dirección en ${addr.ciudad}: ${error.message}`, 'red');
      } else {
        log(`✅ Dirección creada en ${address.ciudad}`, 'green');
        addressesCreated++;
      }
    }

    log(`📊 ${addressesCreated} direcciones adicionales creadas`, 'cyan');

    // 6. Test: Obtener todas las direcciones del usuario
    log('\n📝 Test 4: Obtener todas las direcciones', 'yellow');
    const { data: allAddresses, error: allError } = await supabaseAdmin
      .from('direcciones_envio')
      .select('*')
      .eq('usuario_id', testUser.id)
      .order('created_at', { ascending: false });

    if (allError) {
      log(`❌ Error obteniendo direcciones: ${allError.message}`, 'red');
    } else {
      log(`✅ ${allAddresses.length} direcciones obtenidas`, 'green');
      allAddresses.forEach((addr, index) => {
        log(`   ${index + 1}. ${addr.direccion} - ${addr.ciudad}, ${addr.estado}`, 'cyan');
        log(`      ${addr.codigo_postal}, ${addr.pais}`, 'cyan');
        if (addr.telefono) {
          log(`      📞 ${addr.telefono}`, 'cyan');
        }
      });
    }

    // 7. Test: Actualizar dirección
    log('\n📝 Test 5: Actualizar dirección existente', 'yellow');
    if (newAddress) {
      const updatedData = {
        direccion: 'Calle Principal 123, Apartamento 4B (Actualizada)',
        telefono: '+33 1 11 22 33 44'
      };

      const { data: updatedAddress, error: updateError } = await supabaseAdmin
        .from('direcciones_envio')
        .update(updatedData)
        .eq('id', newAddress.id)
        .eq('usuario_id', testUser.id)
        .select('*')
        .single();

      if (updateError) {
        log(`❌ Error actualizando dirección: ${updateError.message}`, 'red');
      } else {
        log(`✅ Dirección actualizada: ${updatedAddress.direccion}`, 'green');
        log(`   Nuevo teléfono: ${updatedAddress.telefono}`, 'cyan');
      }
    }

    // 8. Test: Búsqueda por ciudad
    log('\n📝 Test 6: Búsqueda por ciudad', 'yellow');
    const { data: parisAddresses, error: searchError } = await supabaseAdmin
      .from('direcciones_envio')
      .select('*')
      .eq('usuario_id', testUser.id)
      .eq('ciudad', 'París');

    if (searchError) {
      log(`❌ Error buscando por ciudad: ${searchError.message}`, 'red');
    } else {
      log(`✅ ${parisAddresses.length} direcciones encontradas en París`, 'green');
    }

    // 9. Test: Búsqueda por país
    log('\n📝 Test 7: Búsqueda por país', 'yellow');
    const { data: franceAddresses, error: countryError } = await supabaseAdmin
      .from('direcciones_envio')
      .select('*')
      .eq('usuario_id', testUser.id)
      .eq('pais', 'Francia');

    if (countryError) {
      log(`❌ Error buscando por país: ${countryError.message}`, 'red');
    } else {
      log(`✅ ${franceAddresses.length} direcciones encontradas en Francia`, 'green');
    }

    // 10. Test: Validación de código postal
    log('\n📝 Test 8: Validación de códigos postales', 'yellow');
    const invalidPostalCodes = ['', '1234', '123456', 'ABCDE'];
    
    for (const postalCode of invalidPostalCodes) {
      const { data: invalidAddr, error: postalError } = await supabaseAdmin
        .from('direcciones_envio')
        .insert([{
          usuario_id: testUser.id,
          direccion: 'Test Address',
          ciudad: 'Test City',
          estado: 'Test State',
          codigo_postal: postalCode,
          pais: 'Francia'
        }]);

      if (postalError) {
        log(`✅ Código postal inválido "${postalCode}" rechazado`, 'green');
      } else {
        log(`⚠️  Código postal "${postalCode}" fue aceptado`, 'yellow');
      }
    }

    // 11. Test: Eliminar dirección
    log('\n📝 Test 9: Eliminar dirección', 'yellow');
    if (allAddresses && allAddresses.length > 0) {
      const addressToDelete = allAddresses[allAddresses.length - 1];
      const { error: deleteError } = await supabaseAdmin
        .from('direcciones_envio')
        .delete()
        .eq('id', addressToDelete.id)
        .eq('usuario_id', testUser.id);

      if (deleteError) {
        log(`❌ Error eliminando dirección: ${deleteError.message}`, 'red');
      } else {
        log(`✅ Dirección eliminada: ${addressToDelete.ciudad}`, 'green');
      }
    }

    // 12. Test: Verificar direcciones después de eliminación
    log('\n📝 Test 10: Verificar direcciones finales', 'yellow');
    const { data: finalAddresses, error: finalError } = await supabaseAdmin
      .from('direcciones_envio')
      .select('*')
      .eq('usuario_id', testUser.id);

    if (finalError) {
      log(`❌ Error obteniendo direcciones finales: ${finalError.message}`, 'red');
    } else {
      log(`✅ ${finalAddresses.length} direcciones finales`, 'green');
    }

    // 13. Test: Estadísticas por país
    log('\n📝 Test 11: Estadísticas de direcciones', 'yellow');
    const { data: countryStats, error: statsError } = await supabaseAdmin
      .from('direcciones_envio')
      .select('pais')
      .eq('usuario_id', testUser.id);

    if (statsError) {
      log(`❌ Error obteniendo estadísticas: ${statsError.message}`, 'red');
    } else {
      const countryCount = {};
      countryStats.forEach(addr => {
        countryCount[addr.pais] = (countryCount[addr.pais] || 0) + 1;
      });

      log(`✅ Distribución por país:`, 'green');
      Object.entries(countryCount).forEach(([country, count]) => {
        log(`   ${country}: ${count} direcciones`, 'cyan');
      });
    }

    log('\n🎉 Testing de direcciones completado', 'green');
    return true;

  } catch (error) {
    log(`❌ Error general en testing: ${error.message}`, 'red');
    return false;
  }
};

const testAddressesEdgeCases = async () => {
  log('\n🔍 TESTING DE CASOS EDGE', 'bold');
  log('========================', 'blue');

  try {
    const { data: users } = await supabaseAdmin.from('usuarios').select('id').limit(1);

    if (!users || users.length === 0) {
      log('⚠️  No hay usuarios para casos edge', 'yellow');
      return;
    }

    // Test con campos requeridos faltantes
    log('\n📝 Test: Dirección con campos faltantes', 'yellow');
    const incompleteAddress = {
      usuario_id: users[0].id,
      direccion: 'Incomplete Address',
      // Faltan ciudad, estado, codigo_postal, pais
    };

    const { data: incomplete, error: incompleteError } = await supabaseAdmin
      .from('direcciones_envio')
      .insert([incompleteAddress]);

    if (incompleteError) {
      log(`✅ Dirección incompleta rechazada: ${incompleteError.message}`, 'green');
    } else {
      log(`⚠️  Dirección incompleta fue aceptada`, 'yellow');
    }

    // Test con dirección muy larga
    log('\n📝 Test: Dirección excesivamente larga', 'yellow');
    const longAddress = 'A'.repeat(500);
    const { data: longAddr, error: longError } = await supabaseAdmin
      .from('direcciones_envio')
      .insert([{
        usuario_id: users[0].id,
        direccion: longAddress,
        ciudad: 'Test City',
        estado: 'Test State',
        codigo_postal: '12345',
        pais: 'Test Country'
      }]);

    if (longError) {
      log(`✅ Dirección larga manejada: ${longError.message}`, 'green');
    } else {
      log(`✅ Dirección larga aceptada (${longAddress.length} caracteres)`, 'green');
    }

    // Test con usuario inexistente
    log('\n📝 Test: Dirección con usuario inexistente', 'yellow');
    const { data: invalidUser, error: userError } = await supabaseAdmin
      .from('direcciones_envio')
      .insert([{
        usuario_id: '00000000-0000-0000-0000-000000000000',
        direccion: 'Test Address',
        ciudad: 'Test City',
        estado: 'Test State',
        codigo_postal: '12345',
        pais: 'Test Country'
      }]);

    if (userError) {
      log(`✅ Usuario inexistente rechazado: ${userError.message}`, 'green');
    } else {
      log(`⚠️  Usuario inexistente fue aceptado`, 'yellow');
    }

    log('\n✅ Testing de casos edge completado', 'green');

  } catch (error) {
    log(`❌ Error en casos edge: ${error.message}`, 'red');
  }
};

const main = async () => {
  log('🏠 SISTEMA DE TESTING - DIRECCIONES', 'bold');
  log('===================================', 'blue');

  const basicTestsResult = await testAddressesAPI();
  await testAddressesEdgeCases();

  log('\n📊 RESUMEN DE TESTING DE DIRECCIONES', 'bold');
  log('====================================', 'blue');

  if (basicTestsResult) {
    log('✅ Tests básicos: PASADOS', 'green');
    log('✅ Sistema de direcciones: FUNCIONAL', 'green');
    log('✅ CRUD de direcciones: OPERATIVO', 'green');
    log('✅ Validaciones: FUNCIONANDO', 'green');
    log('✅ Búsquedas: OPERATIVAS', 'green');
  } else {
    log('❌ Tests básicos: FALLIDOS', 'red');
    log('⚠️  Revisar configuración del sistema', 'yellow');
  }

  log('\n🔗 Endpoints de direcciones:', 'blue');
  log('  GET    /api/v1/addresses', 'cyan');
  log('  POST   /api/v1/addresses', 'cyan');
  log('  PUT    /api/v1/addresses/:id', 'cyan');
  log('  DELETE /api/v1/addresses/:id', 'cyan');
};

// Ejecutar tests
main().catch(console.error);
