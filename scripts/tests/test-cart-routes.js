// ========================================
// SCRIPT DE TESTING - RUTAS DE CARRITO
// ========================================
// API Base: http://localhost:5500/api/v1/cart
// 
// Endpoints testeados:
// ✅ GET / - Obtener carrito
// ✅ GET /with-coupon - Obtener carrito con cupón
// ✅ POST /items - Agregar item al carrito
// ✅ PUT /items/:id - Actualizar item del carrito
// ✅ DELETE /items/:id - Eliminar item del carrito
// ✅ POST /apply-coupon - Aplicar cupón
// ✅ DELETE / - Limpiar carrito

const baseURL = 'http://localhost:5500/api/v1/cart';
const authURL = 'http://localhost:5500/api/v1/auth';

// Variables para testing
let userToken = '';
let cartItemId = '';
const testEmail = `test_cart_${Date.now()}@example.com`;

console.log('🛒 === TESTING RUTAS DE CARRITO ===');
console.log(`🌐 Base URL: ${baseURL}`);
console.log('');

// ========================================
// FUNCIÓN HELPER PARA HACER REQUESTS
// ========================================
async function makeRequest(endpoint, method = 'GET', data = null, token = null, baseUrl = baseURL) {
  const url = `${baseUrl}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`🔄 ${method} ${endpoint}`);
    console.log(`📤 Data:`, data);
    
    const response = await fetch(url, options);
    const result = await response.json();
    
    console.log(`📥 Status: ${response.status}`);
    console.log(`📥 Response:`, result);
    console.log('─'.repeat(50));
    
    return { response, result };
  } catch (error) {
    console.error(`❌ Error en ${method} ${endpoint}:`, error.message);
    console.log('─'.repeat(50));
    return { error };
  }
}

// ========================================
// FUNCIÓN PARA CONFIGURAR USUARIO DE PRUEBA
// ========================================
async function setupTestUser() {
  console.log('🔧 === CONFIGURANDO USUARIO DE PRUEBA ===');
  
  // Registrar usuario
  const registerData = {
    nombre: 'Usuario Test Carrito',
    email: testEmail,
    password: 'password123',
    telefono: '+34612345678'
  };

  const { response: registerResponse, result: registerResult } = await makeRequest('/register', 'POST', registerData, null, authURL);
  
  if (registerResponse && registerResponse.status === 201) {
    console.log('✅ Usuario registrado');
  } else {
    console.log('❌ Error al registrar usuario');
    return false;
  }

  // Login para obtener token
  const loginData = {
    email: testEmail,
    password: 'password123'
  };

  const { response: loginResponse, result: loginResult } = await makeRequest('/login', 'POST', loginData, null, authURL);
  
  if (loginResponse && loginResponse.status === 200) {
    console.log('✅ Login exitoso');
    userToken = loginResult.token;
    return true;
  } else {
    console.log('❌ Error en login');
    return false;
  }
}

// ========================================
// TESTS DE CARRITO
// ========================================

async function runCartTests() {
  console.log('🚀 INICIANDO TESTS DE CARRITO...\n');

  // Configurar usuario de prueba
  const setupSuccess = await setupTestUser();
  if (!setupSuccess) {
    console.log('❌ No se pudo configurar el usuario de prueba');
    return;
  }

  // ========================================
  // 1. TEST: OBTENER CARRITO VACÍO
  // ========================================
  console.log('1️⃣ === TEST: OBTENER CARRITO VACÍO ===');
  
  const { response: emptyCartResponse, result: emptyCartResult } = await makeRequest('/', 'GET', null, userToken);
  
  if (emptyCartResponse && emptyCartResponse.status === 200) {
    console.log('✅ Obtener carrito vacío exitoso');
    console.log(`📊 Items iniciales: ${emptyCartResult.items?.length || 0}`);
    console.log(`💰 Total inicial: ${emptyCartResult.total || 0}`);
  } else {
    console.log('❌ Error al obtener carrito vacío');
  }

  // ========================================
  // 2. TEST: AGREGAR ITEM AL CARRITO
  // ========================================
  console.log('2️⃣ === TEST: AGREGAR ITEM AL CARRITO ===');
  
  const cartItemData = {
    productId: 1, // Asumiendo que existe un producto con ID 1
    quantity: 2,
    size: 'M',
    color: 'Azul'
  };

  const { response: addItemResponse, result: addItemResult } = await makeRequest('/items', 'POST', cartItemData, userToken);
  
  if (addItemResponse && addItemResponse.status === 201) {
    console.log('✅ Item agregado al carrito exitosamente');
    cartItemId = addItemResult.item?.id;
  } else {
    console.log('❌ Error al agregar item al carrito');
  }

  // ========================================
  // 3. TEST: AGREGAR SEGUNDO ITEM
  // ========================================
  console.log('3️⃣ === TEST: AGREGAR SEGUNDO ITEM ===');
  
  const secondItemData = {
    productId: 2, // Otro producto
    quantity: 1,
    size: 'L',
    color: 'Rojo'
  };

  const { response: addSecondResponse } = await makeRequest('/items', 'POST', secondItemData, userToken);
  
  if (addSecondResponse && addSecondResponse.status === 201) {
    console.log('✅ Segundo item agregado exitosamente');
  } else {
    console.log('❌ Error al agregar segundo item');
  }

  // ========================================
  // 4. TEST: OBTENER CARRITO CON ITEMS
  // ========================================
  console.log('4️⃣ === TEST: OBTENER CARRITO CON ITEMS ===');
  
  const { response: fullCartResponse, result: fullCartResult } = await makeRequest('/', 'GET', null, userToken);
  
  if (fullCartResponse && fullCartResponse.status === 200) {
    console.log('✅ Obtener carrito con items exitoso');
    console.log(`📊 Items totales: ${fullCartResult.items?.length || 0}`);
    console.log(`💰 Total del carrito: ${fullCartResult.total || 0}`);
  } else {
    console.log('❌ Error al obtener carrito con items');
  }

  // ========================================
  // 5. TEST: ACTUALIZAR ITEM DEL CARRITO
  // ========================================
  console.log('5️⃣ === TEST: ACTUALIZAR ITEM DEL CARRITO ===');
  
  if (cartItemId) {
    const updateItemData = {
      quantity: 5,
      size: 'XL',
      color: 'Verde'
    };

    const { response: updateResponse } = await makeRequest(`/items/${cartItemId}`, 'PUT', updateItemData, userToken);
    
    if (updateResponse && updateResponse.status === 200) {
      console.log('✅ Item actualizado exitosamente');
    } else {
      console.log('❌ Error al actualizar item');
    }
  } else {
    console.log('⚠️ No hay item para actualizar');
  }

  // ========================================
  // 6. TEST: APLICAR CUPÓN
  // ========================================
  console.log('6️⃣ === TEST: APLICAR CUPÓN ===');
  
  const couponData = {
    code: 'DESCUENTO10'
  };

  const { response: couponResponse } = await makeRequest('/apply-coupon', 'POST', couponData, userToken);
  
  if (couponResponse && (couponResponse.status === 200 || couponResponse.status === 400)) {
    console.log('✅ Aplicación de cupón procesada (puede fallar si el cupón no existe)');
  } else {
    console.log('❌ Error en aplicación de cupón');
  }

  // ========================================
  // 7. TEST: OBTENER CARRITO CON CUPÓN
  // ========================================
  console.log('7️⃣ === TEST: OBTENER CARRITO CON CUPÓN ===');
  
  const { response: couponCartResponse, result: couponCartResult } = await makeRequest('/with-coupon', 'GET', null, userToken);
  
  if (couponCartResponse && couponCartResponse.status === 200) {
    console.log('✅ Obtener carrito con cupón exitoso');
    console.log(`💰 Total con descuento: ${couponCartResult.totalWithDiscount || 'N/A'}`);
    console.log(`🎫 Cupón aplicado: ${couponCartResult.appliedCoupon?.code || 'Ninguno'}`);
  } else {
    console.log('❌ Error al obtener carrito con cupón');
  }

  // ========================================
  // 8. TEST: AGREGAR ITEM CON DATOS INVÁLIDOS
  // ========================================
  console.log('8️⃣ === TEST: AGREGAR ITEM CON DATOS INVÁLIDOS ===');
  
  const invalidItemData = {
    productId: 'invalid', // ID inválido
    quantity: -1 // Cantidad negativa
  };

  const { response: invalidResponse } = await makeRequest('/items', 'POST', invalidItemData, userToken);
  
  if (invalidResponse && invalidResponse.status === 400) {
    console.log('✅ Validación de datos inválidos funcionando');
  } else {
    console.log('❌ Validación de datos inválidos no funcionando');
  }

  // ========================================
  // 9. TEST: ACCESO SIN TOKEN
  // ========================================
  console.log('9️⃣ === TEST: ACCESO SIN TOKEN ===');
  
  const { response: noTokenResponse } = await makeRequest('/', 'GET');
  
  if (noTokenResponse && noTokenResponse.status === 401) {
    console.log('✅ Acceso sin token denegado correctamente');
  } else {
    console.log('❌ Acceso sin token debería ser denegado');
  }

  // ========================================
  // 10. TEST: ELIMINAR ITEM DEL CARRITO
  // ========================================
  console.log('🔟 === TEST: ELIMINAR ITEM DEL CARRITO ===');
  
  if (cartItemId) {
    const { response: deleteItemResponse } = await makeRequest(`/items/${cartItemId}`, 'DELETE', null, userToken);
    
    if (deleteItemResponse && deleteItemResponse.status === 200) {
      console.log('✅ Item eliminado del carrito exitosamente');
    } else {
      console.log('❌ Error al eliminar item del carrito');
    }
  } else {
    console.log('⚠️ No hay item para eliminar');
  }

  // ========================================
  // 11. TEST: LIMPIAR CARRITO
  // ========================================
  console.log('1️⃣1️⃣ === TEST: LIMPIAR CARRITO ===');
  
  const { response: clearResponse } = await makeRequest('/', 'DELETE', null, userToken);
  
  if (clearResponse && clearResponse.status === 200) {
    console.log('✅ Carrito limpiado exitosamente');
  } else {
    console.log('❌ Error al limpiar carrito');
  }

  // ========================================
  // 12. TEST: VERIFICAR CARRITO VACÍO DESPUÉS DE LIMPIAR
  // ========================================
  console.log('1️⃣2️⃣ === TEST: VERIFICAR CARRITO VACÍO DESPUÉS DE LIMPIAR ===');
  
  const { response: finalCartResponse, result: finalCartResult } = await makeRequest('/', 'GET', null, userToken);
  
  if (finalCartResponse && finalCartResponse.status === 200) {
    const isEmpty = !finalCartResult.items || finalCartResult.items.length === 0;
    if (isEmpty) {
      console.log('✅ Carrito vacío después de limpiar - Correcto');
    } else {
      console.log('❌ El carrito no está vacío después de limpiar');
    }
  } else {
    console.log('❌ Error al verificar carrito final');
  }

  console.log('\n🎉 === TESTS DE CARRITO COMPLETADOS ===');
  console.log(`🔑 Token obtenido: ${userToken ? 'SÍ' : 'NO'}`);
  console.log(`🛒 Item ID creado: ${cartItemId}`);
  
  return { userToken, cartItemId };
}

// ========================================
// EJECUTAR TESTS
// ========================================
if (typeof globalThis !== 'undefined' && globalThis.process?.argv[1] && import.meta.url.includes(globalThis.process.argv[1])) {
  runCartTests().catch(console.error);
}

export { runCartTests };
