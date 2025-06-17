#!/usr/bin/env node

/**
 * Script completo de testing para verificar todos los sistemas
 * Incluye: Auth, Favoritos, Reviews, Direcciones
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

// Variables globales para testing
let testUser = null;
let testProducts = [];
let authToken = null;

// Función auxiliar para hacer peticiones HTTP
async function makeRequest(method, endpoint, data = null, token = null) {
  const url = `http://localhost:5500${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'TestScript/1.0'
    }
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    return {
      status: response.status,
      data: result,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      ok: false
    };
  }
}

// Test 1: Verificar que el servidor esté corriendo
async function testServerHealth() {
  log('\n🏥 TEST: Verificar salud del servidor', 'cyan');
  
  try {
    const response = await makeRequest('GET', '/api/v1/products');
    if (response.status === 200) {
      log('✅ Servidor respondiendo correctamente', 'green');
      return true;
    } else {
      log(`❌ Servidor respondió con status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error conectando al servidor: ${error.message}`, 'red');
    log('💡 Asegúrate de que el servidor esté corriendo en puerto 5500', 'yellow');
    return false;
  }
}

// Test 2: Crear usuario de prueba y verificar login
async function testAuthSystem() {
  log('\n🔐 TEST: Sistema de autenticación', 'cyan');
  
  try {
    // 1. Crear usuario en la base de datos directamente (simulando registro completo)
    const email = `test-${Date.now()}@toutaunclicla.com`;
    const password = 'password123';
    
    log(`👤 Creando usuario: ${email}`, 'blue');
    
    // Crear usuario en auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Marcamos como confirmado
    });
    
    if (authError) throw authError;
    
    // Crear usuario en tabla usuarios (ya verificado)
    const { data: user, error: userError } = await supabaseAdmin
      .from('usuarios')
      .insert([{
        id: authUser.user.id,
        correo_electronico: email,
        nombre: 'Test User',
        telefono: '+1234567890',
        verificado: true, // Usuario verificado
        autenticacion_social: false
      }])
      .select()
      .single();
      
    if (userError) throw userError;
    
    testUser = user;
    log('✅ Usuario creado en base de datos', 'green');
    
    // 2. Probar login
    log('🔑 Probando login...', 'blue');
    const loginResponse = await makeRequest('POST', '/api/v1/auth/login', {
      email,
      password
    });
    
    if (loginResponse.ok && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      log('✅ Login exitoso con usuario verificado', 'green');
      log(`   Token: ${authToken.substring(0, 50)}...`, 'blue');
      return true;
    } else {
      log(`❌ Login falló: ${JSON.stringify(loginResponse.data)}`, 'red');
      return false;
    }
    
  } catch (error) {
    log(`❌ Error en sistema de auth: ${error.message}`, 'red');
    return false;
  }
}

// Test 3: Sistema de productos (prerequisito para otros tests)
async function testProductSystem() {
  log('\n📦 TEST: Sistema de productos', 'cyan');
  
  try {
    const response = await makeRequest('GET', '/api/v1/products?limit=3');
    
    if (response.ok && response.data.products) {
      testProducts = response.data.products.slice(0, 3);
      log(`✅ ${testProducts.length} productos obtenidos para testing`, 'green');
      testProducts.forEach((product, index) => {
        log(`   ${index + 1}. ${product.nombre} (ID: ${product.id})`, 'blue');
      });
      return true;
    } else {
      log(`❌ Error obteniendo productos: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error en sistema de productos: ${error.message}`, 'red');
    return false;
  }
}

// Test 4: Sistema de favoritos
async function testFavoritesSystem() {
  log('\n❤️  TEST: Sistema de favoritos', 'cyan');
  
  if (!authToken || testProducts.length === 0) {
    log('❌ Faltan prerequisitos (auth token o productos)', 'red');
    return false;
  }
  
  try {
    // 1. Obtener favoritos vacíos
    log('📋 Verificando favoritos iniciales...', 'blue');
    let response = await makeRequest('GET', '/api/v1/favorites', null, authToken);
    
    if (!response.ok) {
      log(`❌ Error obteniendo favoritos: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
    
    log(`✅ Favoritos iniciales: ${response.data.favorites?.length || 0}`, 'green');
    
    // 2. Agregar producto a favoritos
    const productToAdd = testProducts[0];
    log(`💕 Agregando producto a favoritos: ${productToAdd.nombre}`, 'blue');
    
    response = await makeRequest('POST', '/api/v1/favorites', {
      productId: productToAdd.id
    }, authToken);
    
    if (response.ok) {
      log('✅ Producto agregado a favoritos', 'green');
    } else {
      log(`❌ Error agregando favorito: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
    
    // 3. Verificar que se agregó
    response = await makeRequest('GET', '/api/v1/favorites', null, authToken);
    if (response.ok && response.data.favorites?.length > 0) {
      log(`✅ Favorito confirmado: ${response.data.favorites.length} elemento(s)`, 'green');
    } else {
      log('❌ Favorito no se agregó correctamente', 'red');
      return false;
    }
    
    // 4. Eliminar favorito
    log('🗑️  Eliminando favorito...', 'blue');
    response = await makeRequest('DELETE', `/api/v1/favorites/${productToAdd.id}`, null, authToken);
    
    if (response.ok) {
      log('✅ Favorito eliminado correctamente', 'green');
      return true;
    } else {
      log(`❌ Error eliminando favorito: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
    
  } catch (error) {
    log(`❌ Error en sistema de favoritos: ${error.message}`, 'red');
    return false;
  }
}

// Test 5: Sistema de reviews
async function testReviewsSystem() {
  log('\n⭐ TEST: Sistema de reviews', 'cyan');
  
  if (!authToken || testProducts.length === 0) {
    log('❌ Faltan prerequisitos (auth token o productos)', 'red');
    return false;
  }
  
  try {
    const productToReview = testProducts[0];
    
    // 1. Obtener reviews del producto
    log(`📝 Obteniendo reviews de: ${productToReview.nombre}`, 'blue');
    let response = await makeRequest('GET', `/api/v1/reviews/product/${productToReview.id}`);
    
    if (response.ok) {
      log(`✅ Reviews obtenidas: ${response.data.reviews?.length || 0}`, 'green');
    } else {
      log(`❌ Error obteniendo reviews: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
    
    // 2. Crear review
    log('✍️  Creando nueva review...', 'blue');
    response = await makeRequest('POST', '/api/v1/reviews', {
      productId: productToReview.id,
      rating: 5,
      comment: 'Excelente producto de prueba! Muy recomendado.'
    }, authToken);
    
    if (response.ok) {
      log('✅ Review creada exitosamente', 'green');
      
      // 3. Verificar que se creó
      response = await makeRequest('GET', `/api/v1/reviews/product/${productToReview.id}`);
      if (response.ok && response.data.reviews?.length > 0) {
        log('✅ Review confirmada en listado', 'green');
        return true;
      }
    } else {
      log(`❌ Error creando review: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
    
  } catch (error) {
    log(`❌ Error en sistema de reviews: ${error.message}`, 'red');
    return false;
  }
}

// Test 6: Sistema de direcciones
async function testAddressSystem() {
  log('\n🏠 TEST: Sistema de direcciones', 'cyan');
  
  if (!authToken) {
    log('❌ Falta auth token', 'red');
    return false;
  }
  
  try {
    // 1. Obtener direcciones iniciales
    log('📍 Obteniendo direcciones...', 'blue');
    let response = await makeRequest('GET', '/api/v1/addresses', null, authToken);
    
    if (response.ok) {
      log(`✅ Direcciones obtenidas: ${response.data.addresses?.length || 0}`, 'green');
    } else {
      log(`❌ Error obteniendo direcciones: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
    
    // 2. Crear nueva dirección
    log('🏗️  Creando nueva dirección...', 'blue');
    const newAddress = {
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'España',
      phone: '+34123456789'
    };
    
    response = await makeRequest('POST', '/api/v1/addresses', newAddress, authToken);
    
    if (response.ok) {
      log('✅ Dirección creada exitosamente', 'green');
      const addressId = response.data.address?.id;
      
      // 3. Verificar que se creó
      response = await makeRequest('GET', '/api/v1/addresses', null, authToken);
      if (response.ok && response.data.addresses?.length > 0) {
        log('✅ Dirección confirmada en listado', 'green');
        
        // 4. Eliminar dirección de prueba
        if (addressId) {
          log('🗑️  Limpiando dirección de prueba...', 'blue');
          await makeRequest('DELETE', `/api/v1/addresses/${addressId}`, null, authToken);
        }
        
        return true;
      }
    } else {
      log(`❌ Error creando dirección: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
    
  } catch (error) {
    log(`❌ Error en sistema de direcciones: ${error.message}`, 'red');
    return false;
  }
}

// Test 7: Limpiar datos de prueba
async function cleanup() {
  log('\n🧹 LIMPIEZA: Eliminando datos de prueba', 'cyan');
  
  try {
    if (testUser) {
      // Eliminar de tabla usuarios
      await supabaseAdmin
        .from('usuarios')
        .delete()
        .eq('id', testUser.id);
      
      // Eliminar de auth.users
      await supabaseAdmin.auth.admin.deleteUser(testUser.id);
      
      log('✅ Usuario de prueba eliminado', 'green');
    }
  } catch (error) {
    log(`⚠️  Error en limpieza: ${error.message}`, 'yellow');
  }
}

// Función principal
async function runCompleteTests() {
  log('🚀 INICIANDO TESTS COMPLETOS DEL SISTEMA', 'bold');
  log('==========================================', 'cyan');
  
  const results = {
    server: false,
    auth: false,
    products: false,
    favorites: false,
    reviews: false,
    addresses: false
  };
  
  try {
    // Ejecutar todos los tests en secuencia
    results.server = await testServerHealth();
    if (results.server) {
      results.auth = await testAuthSystem();
      if (results.auth) {
        results.products = await testProductSystem();
        if (results.products) {
          results.favorites = await testFavoritesSystem();
          results.reviews = await testReviewsSystem();
          results.addresses = await testAddressSystem();
        }
      }
    }
    
  } catch (error) {
    log(`❌ Error crítico: ${error.message}`, 'red');
  } finally {
    await cleanup();
  }
  
  // Mostrar resumen final
  log('\n📊 RESUMEN FINAL DE TESTS', 'bold');
  log('==========================', 'cyan');
  
  const testNames = {
    server: 'Servidor',
    auth: 'Autenticación',
    products: 'Productos',
    favorites: 'Favoritos',
    reviews: 'Reviews',
    addresses: 'Direcciones'
  };
  
  let passedTests = 0;
  const totalTests = Object.keys(results).length;
  
  for (const [key, result] of Object.entries(results)) {
    const status = result ? '✅ PASÓ' : '❌ FALLÓ';
    const color = result ? 'green' : 'red';
    log(`${status} ${testNames[key]}`, color);
    if (result) passedTests++;
  }
  
  log(`\n🎯 RESULTADO: ${passedTests}/${totalTests} tests pasaron`, 
       passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 ¡TODOS LOS SISTEMAS FUNCIONAN CORRECTAMENTE!', 'green');
  } else {
    log('⚠️  Algunos sistemas necesitan atención', 'yellow');
  }
  
  log('\n💡 INSTRUCCIONES:', 'blue');
  log('- Si falló "Servidor": ejecuta "npm start" en otra terminal', 'blue');
  log('- Si falló "Autenticación": revisa configuración de Supabase', 'blue');
  log('- Si falló otros: revisa los logs de error arriba', 'blue');
}

// Ejecutar tests
runCompleteTests().catch(console.error);
