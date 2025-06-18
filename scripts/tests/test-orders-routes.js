// ========================================
// SCRIPT DE TESTING - RUTAS DE PEDIDOS
// ========================================
// API Base: http://localhost:5500/api/v1/orders
// 
// Endpoints testeados:
// ✅ GET /my-orders - Obtener pedidos del usuario
// ✅ GET /:id - Obtener pedido por ID
// ✅ POST / - Crear pedido
// ✅ PUT /:id/cancel - Cancelar pedido
// ✅ GET / - Obtener todos los pedidos (admin)
// ✅ PUT /:id/status - Actualizar estado de pedido (admin)

const baseURL = 'http://localhost:5500/api/v1/orders';
const authURL = 'http://localhost:5500/api/v1/auth';

// Variables para testing
let userToken = '';
let testOrderId = '';
let testAddressId = '';
const testEmail = `test_orders_${Date.now()}@example.com`;

console.log('📦 === TESTING RUTAS DE PEDIDOS ===');
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
// FUNCIÓN PARA CONFIGURAR USUARIO Y DIRECCIÓN
// ========================================
async function setupTestUserAndAddress() {
  console.log('🔧 === CONFIGURANDO USUARIO Y DIRECCIÓN DE PRUEBA ===');
  
  // Registrar usuario
  const registerData = {
    nombre: 'Usuario Test Pedidos',
    email: testEmail,
    password: 'password123',
    telefono: '+34612345678'
  };

  const { response: registerResponse } = await makeRequest('/register', 'POST', registerData, null, authURL);
  
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
  } else {
    console.log('❌ Error en login');
    return false;
  }

  // Crear dirección para el pedido
  const addressData = {
    direccion: 'Calle Test Pedidos 123',
    ciudad: 'Madrid',
    estado: 'Madrid',
    codigo_postal: '28001',
    pais: 'España',
    telefono: '+34912345678'
  };

  const addressURL = 'http://localhost:5500/api/v1/addresses';
  const { response: addressResponse, result: addressResult } = await makeRequest('/', 'POST', addressData, userToken, addressURL);
  
  if (addressResponse && addressResponse.status === 201) {
    console.log('✅ Dirección creada para pedido');
    testAddressId = addressResult.address?.id;
    return true;
  } else {
    console.log('❌ Error al crear dirección');
    return false;
  }
}

// ========================================
// TESTS DE PEDIDOS
// ========================================

async function runOrderTests() {
  console.log('🚀 INICIANDO TESTS DE PEDIDOS...\n');

  // Configurar usuario de prueba
  const setupSuccess = await setupTestUserAndAddress();
  if (!setupSuccess) {
    console.log('❌ No se pudo configurar el usuario de prueba');
    return;
  }

  // ========================================
  // 1. TEST: OBTENER PEDIDOS VACÍOS
  // ========================================
  console.log('1️⃣ === TEST: OBTENER PEDIDOS VACÍOS ===');
  
  const { response: emptyOrdersResponse, result: emptyOrdersResult } = await makeRequest('/my-orders', 'GET', null, userToken);
  
  if (emptyOrdersResponse && emptyOrdersResponse.status === 200) {
    console.log('✅ Obtener pedidos vacíos exitoso');
    console.log(`📊 Pedidos iniciales: ${emptyOrdersResult.orders?.length || 0}`);
  } else {
    console.log('❌ Error al obtener pedidos vacíos');
  }

  // ========================================
  // 2. TEST: CREAR PEDIDO
  // ========================================
  console.log('2️⃣ === TEST: CREAR PEDIDO ===');
  
  const orderData = {
    addressId: testAddressId,
    paymentMethodId: 'pm_test_payment_method'
  };

  const { response: createOrderResponse, result: createOrderResult } = await makeRequest('/', 'POST', orderData, userToken);
  
  if (createOrderResponse && createOrderResponse.status === 201) {
    console.log('✅ Pedido creado exitosamente');
    testOrderId = createOrderResult.order?.id;
  } else {
    console.log('❌ Error al crear pedido');
  }

  // ========================================
  // 3. TEST: OBTENER PEDIDOS DESPUÉS DE CREAR
  // ========================================
  console.log('3️⃣ === TEST: OBTENER PEDIDOS DESPUÉS DE CREAR ===');
  
  const { response: ordersAfterCreateResponse, result: ordersAfterCreateResult } = await makeRequest('/my-orders', 'GET', null, userToken);
  
  if (ordersAfterCreateResponse && ordersAfterCreateResponse.status === 200) {
    console.log('✅ Obtener pedidos después de crear exitoso');
    console.log(`📊 Total pedidos: ${ordersAfterCreateResult.orders?.length || 0}`);
  } else {
    console.log('❌ Error al obtener pedidos después de crear');
  }

  // ========================================
  // 4. TEST: OBTENER PEDIDO POR ID
  // ========================================
  console.log('4️⃣ === TEST: OBTENER PEDIDO POR ID ===');
  
  if (testOrderId) {
    const { response: getOrderResponse, result: getOrderResult } = await makeRequest(`/${testOrderId}`, 'GET', null, userToken);
    
    if (getOrderResponse && getOrderResponse.status === 200) {
      console.log('✅ Obtener pedido por ID exitoso');
      console.log(`📦 Estado del pedido: ${getOrderResult.order?.status || 'N/A'}`);
      console.log(`💰 Total: ${getOrderResult.order?.total || 'N/A'}`);
    } else {
      console.log('❌ Error al obtener pedido por ID');
    }
  } else {
    console.log('⚠️ No hay pedido para obtener');
  }

  // ========================================
  // 5. TEST: OBTENER PEDIDO INEXISTENTE
  // ========================================
  console.log('5️⃣ === TEST: OBTENER PEDIDO INEXISTENTE ===');
  
  const { response: notFoundResponse } = await makeRequest('/99999', 'GET', null, userToken);
  
  if (notFoundResponse && notFoundResponse.status === 404) {
    console.log('✅ Pedido inexistente manejado correctamente');
  } else {
    console.log('❌ Pedido inexistente debería devolver 404');
  }

  // ========================================
  // 6. TEST: CANCELAR PEDIDO
  // ========================================
  console.log('6️⃣ === TEST: CANCELAR PEDIDO ===');
  
  if (testOrderId) {
    const { response: cancelResponse } = await makeRequest(`/${testOrderId}/cancel`, 'PUT', null, userToken);
    
    if (cancelResponse && cancelResponse.status === 200) {
      console.log('✅ Pedido cancelado exitosamente');
    } else {
      console.log('❌ Error al cancelar pedido');
    }
  } else {
    console.log('⚠️ No hay pedido para cancelar');
  }

  // ========================================
  // 7. TEST: CREAR PEDIDO CON DATOS INVÁLIDOS
  // ========================================
  console.log('7️⃣ === TEST: CREAR PEDIDO CON DATOS INVÁLIDOS ===');
  
  const invalidOrderData = {
    addressId: 'invalid-uuid',
    paymentMethodId: '' // Payment method vacío
  };

  const { response: invalidResponse } = await makeRequest('/', 'POST', invalidOrderData, userToken);
  
  if (invalidResponse && invalidResponse.status === 400) {
    console.log('✅ Validación de datos inválidos funcionando');
  } else {
    console.log('❌ Validación de datos inválidos no funcionando');
  }

  // ========================================
  // 8. TEST: CREAR PEDIDO SIN DIRECCIÓN
  // ========================================
  console.log('8️⃣ === TEST: CREAR PEDIDO SIN DIRECCIÓN ===');
  
  const orderWithoutAddress = {
    paymentMethodId: 'pm_test_payment_method'
  };

  const { response: noAddressResponse } = await makeRequest('/', 'POST', orderWithoutAddress, userToken);
  
  if (noAddressResponse && noAddressResponse.status === 400) {
    console.log('✅ Pedido sin dirección rechazado correctamente');
  } else {
    console.log('❌ Pedido sin dirección debería ser rechazado');
  }

  // ========================================
  // 9. TEST: ACCESO SIN TOKEN
  // ========================================
  console.log('9️⃣ === TEST: ACCESO SIN TOKEN ===');
  
  const { response: noTokenResponse } = await makeRequest('/my-orders', 'GET');
  
  if (noTokenResponse && noTokenResponse.status === 401) {
    console.log('✅ Acceso sin token denegado correctamente');
  } else {
    console.log('❌ Acceso sin token debería ser denegado');
  }

  // ========================================
  // 10. TEST: OBTENER TODOS LOS PEDIDOS (ADMIN) - SIN PERMISOS
  // ========================================
  console.log('🔟 === TEST: OBTENER TODOS LOS PEDIDOS SIN PERMISOS ADMIN ===');
  
  const { response: allOrdersResponse } = await makeRequest('/', 'GET', null, userToken);
  
  if (allOrdersResponse && allOrdersResponse.status === 403) {
    console.log('✅ Acceso a todos los pedidos denegado correctamente (no admin)');
  } else {
    console.log('❌ Debería denegar acceso a todos los pedidos para usuario no admin');
  }

  // ========================================
  // 11. TEST: ACTUALIZAR ESTADO DE PEDIDO (ADMIN) - SIN PERMISOS
  // ========================================
  console.log('1️⃣1️⃣ === TEST: ACTUALIZAR ESTADO SIN PERMISOS ADMIN ===');
  
  if (testOrderId) {
    const updateStatusData = {
      status: 'shipped'
    };

    const { response: updateStatusResponse } = await makeRequest(`/${testOrderId}/status`, 'PUT', updateStatusData, userToken);
    
    if (updateStatusResponse && updateStatusResponse.status === 403) {
      console.log('✅ Actualización de estado denegada correctamente (no admin)');
    } else {
      console.log('❌ Debería denegar actualización de estado para usuario no admin');
    }
  } else {
    console.log('⚠️ No hay pedido para actualizar estado');
  }

  // ========================================
  // 12. TEST: CANCELAR PEDIDO INEXISTENTE
  // ========================================
  console.log('1️⃣2️⃣ === TEST: CANCELAR PEDIDO INEXISTENTE ===');
  
  const { response: cancelFakeResponse } = await makeRequest('/99999/cancel', 'PUT', null, userToken);
  
  if (cancelFakeResponse && cancelFakeResponse.status === 404) {
    console.log('✅ Cancelación de pedido inexistente manejada correctamente');
  } else {
    console.log('❌ Cancelación de pedido inexistente debería devolver 404');
  }

  console.log('\n🎉 === TESTS DE PEDIDOS COMPLETADOS ===');
  console.log(`🔑 Token obtenido: ${userToken ? 'SÍ' : 'NO'}`);
  console.log(`📦 Order ID creada: ${testOrderId}`);
  console.log(`🏠 Address ID usada: ${testAddressId}`);
  
  return { userToken, testOrderId, testAddressId };
}

// ========================================
// EJECUTAR TESTS
// ========================================
if (typeof globalThis !== 'undefined' && globalThis.process?.argv[1] && import.meta.url.includes(globalThis.process.argv[1])) {
  runOrderTests().catch(console.error);
}

export { runOrderTests };
