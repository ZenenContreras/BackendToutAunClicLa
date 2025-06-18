// ========================================
// SCRIPT DE TESTING - RUTAS DE DIRECCIONES
// ========================================
// API Base: http://localhost:5500/api/v1/addresses
// 
// Endpoints testeados:
// ✅ GET / - Obtener direcciones del usuario
// ✅ POST / - Crear nueva dirección
// ✅ PUT /:id - Actualizar dirección
// ✅ DELETE /:id - Eliminar dirección

const baseURL = 'http://localhost:5500/api/v1/addresses';
const authURL = 'http://localhost:5500/api/v1/auth';

// Variables para testing
let userToken = '';
let testAddressId = '';
const testEmail = `test_addresses_${Date.now()}@example.com`;

console.log('🏠 === TESTING RUTAS DE DIRECCIONES ===');
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
    nombre: 'Usuario Test Direcciones',
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
// TESTS DE DIRECCIONES
// ========================================

async function runAddressTests() {
  console.log('🚀 INICIANDO TESTS DE DIRECCIONES...\n');

  // Configurar usuario de prueba
  const setupSuccess = await setupTestUser();
  if (!setupSuccess) {
    console.log('❌ No se pudo configurar el usuario de prueba');
    return;
  }

  // ========================================
  // 1. TEST: OBTENER DIRECCIONES VACÍAS
  // ========================================
  console.log('1️⃣ === TEST: OBTENER DIRECCIONES VACÍAS ===');
  
  const { response: emptyResponse, result: emptyResult } = await makeRequest('/', 'GET', null, userToken);
  
  if (emptyResponse && emptyResponse.status === 200) {
    console.log('✅ Obtener direcciones vacías exitoso');
    console.log(`📊 Direcciones iniciales: ${emptyResult.addresses?.length || 0}`);
  } else {
    console.log('❌ Error al obtener direcciones vacías');
  }

  // ========================================
  // 2. TEST: CREAR DIRECCIÓN (FORMATO DB)
  // ========================================
  console.log('2️⃣ === TEST: CREAR DIRECCIÓN (FORMATO DB) ===');
  
  const addressDataDB = {
    direccion: 'Calle Test 123',
    ciudad: 'Madrid',
    estado: 'Madrid',
    codigo_postal: '28001',
    pais: 'España',
    telefono: '+34912345678'
  };

  const { response: createResponse, result: createResult } = await makeRequest('/', 'POST', addressDataDB, userToken);
  
  if (createResponse && createResponse.status === 201) {
    console.log('✅ Dirección creada exitosamente (formato DB)');
    testAddressId = createResult.address?.id;
  } else {
    console.log('❌ Error al crear dirección (formato DB)');
  }

  // ========================================
  // 3. TEST: CREAR DIRECCIÓN (FORMATO FRONTEND)
  // ========================================
  console.log('3️⃣ === TEST: CREAR DIRECCIÓN (FORMATO FRONTEND) ===');
  
  const addressDataFrontend = {
    address: 'Frontend Street 456',
    city: 'Barcelona',
    state: 'Barcelona',
    postalCode: '08001',
    country: 'España',
    phone: '+34987654321'
  };

  const { response: createFrontendResponse } = await makeRequest('/', 'POST', addressDataFrontend, userToken);
  
  if (createFrontendResponse && createFrontendResponse.status === 201) {
    console.log('✅ Dirección creada exitosamente (formato Frontend)');
  } else {
    console.log('❌ Error al crear dirección (formato Frontend)');
  }

  // ========================================
  // 4. TEST: OBTENER TODAS LAS DIRECCIONES
  // ========================================
  console.log('4️⃣ === TEST: OBTENER TODAS LAS DIRECCIONES ===');
  
  const { response: getAllResponse, result: getAllResult } = await makeRequest('/', 'GET', null, userToken);
  
  if (getAllResponse && getAllResponse.status === 200) {
    console.log('✅ Obtener todas las direcciones exitoso');
    console.log(`📊 Total direcciones: ${getAllResult.addresses?.length || 0}`);
    
    // Verificar formato de respuesta
    if (getAllResult.addresses && getAllResult.addresses.length > 0) {
      const firstAddress = getAllResult.addresses[0];
      const hasDBFormat = firstAddress.direccion && firstAddress.ciudad;
      const hasFrontendFormat = firstAddress.address && firstAddress.city;
      
      if (hasDBFormat && hasFrontendFormat) {
        console.log('✅ Formato de respuesta compatible (DB + Frontend)');
      } else {
        console.log('❌ Formato de respuesta incompleto');
      }
    }
  } else {
    console.log('❌ Error al obtener todas las direcciones');
  }

  // ========================================
  // 5. TEST: ACTUALIZAR DIRECCIÓN
  // ========================================
  console.log('5️⃣ === TEST: ACTUALIZAR DIRECCIÓN ===');
  
  if (testAddressId) {
    const updateData = {
      direccion: 'Calle Actualizada 789',
      ciudad: 'Valencia',
      estado: 'Valencia',
      codigo_postal: '46001',
      pais: 'España',
      telefono: '+34666777888'
    };

    const { response: updateResponse } = await makeRequest(`/${testAddressId}`, 'PUT', updateData, userToken);
    
    if (updateResponse && updateResponse.status === 200) {
      console.log('✅ Dirección actualizada exitosamente');
    } else {
      console.log('❌ Error al actualizar dirección');
    }
  } else {
    console.log('⚠️ No hay dirección para actualizar');
  }

  // ========================================
  // 6. TEST: ACTUALIZAR DIRECCIÓN INEXISTENTE
  // ========================================
  console.log('6️⃣ === TEST: ACTUALIZAR DIRECCIÓN INEXISTENTE ===');
  
  const updateDataFake = {
    direccion: 'Calle Falsa 123'
  };

  const { response: updateFakeResponse } = await makeRequest('/99999', 'PUT', updateDataFake, userToken);
  
  if (updateFakeResponse && updateFakeResponse.status === 404) {
    console.log('✅ Actualización de dirección inexistente falló correctamente');
  } else {
    console.log('❌ Actualización de dirección inexistente debería fallar');
  }

  // ========================================
  // 7. TEST: VALIDACIÓN DE CAMPOS REQUERIDOS
  // ========================================
  console.log('7️⃣ === TEST: VALIDACIÓN DE CAMPOS REQUERIDOS ===');
  
  const invalidData = {
    direccion: 'Solo dirección' // Faltan campos requeridos
  };

  const { response: validationResponse } = await makeRequest('/', 'POST', invalidData, userToken);
  
  if (validationResponse && validationResponse.status === 400) {
    console.log('✅ Validación de campos requeridos funcionando');
  } else {
    console.log('❌ Validación de campos requeridos no funcionando');
  }

  // ========================================
  // 8. TEST: ACCESO SIN TOKEN
  // ========================================
  console.log('8️⃣ === TEST: ACCESO SIN TOKEN ===');
  
  const { response: noTokenResponse } = await makeRequest('/', 'GET');
  
  if (noTokenResponse && noTokenResponse.status === 401) {
    console.log('✅ Acceso sin token denegado correctamente');
  } else {
    console.log('❌ Acceso sin token debería ser denegado');
  }

  // ========================================
  // 9. TEST: ELIMINAR DIRECCIÓN
  // ========================================
  console.log('9️⃣ === TEST: ELIMINAR DIRECCIÓN ===');
  
  if (testAddressId) {
    const { response: deleteResponse } = await makeRequest(`/${testAddressId}`, 'DELETE', null, userToken);
    
    if (deleteResponse && deleteResponse.status === 200) {
      console.log('✅ Dirección eliminada exitosamente');
    } else {
      console.log('❌ Error al eliminar dirección');
    }
  } else {
    console.log('⚠️ No hay dirección para eliminar');
  }

  // ========================================
  // 10. TEST: ELIMINAR DIRECCIÓN INEXISTENTE
  // ========================================
  console.log('🔟 === TEST: ELIMINAR DIRECCIÓN INEXISTENTE ===');
  
  const { response: deleteFakeResponse } = await makeRequest('/99999', 'DELETE', null, userToken);
  
  if (deleteFakeResponse && deleteFakeResponse.status === 404) {
    console.log('✅ Eliminación de dirección inexistente falló correctamente');
  } else {
    console.log('❌ Eliminación de dirección inexistente debería fallar');
  }

  console.log('\n🎉 === TESTS DE DIRECCIONES COMPLETADOS ===');
  console.log(`🔑 Token obtenido: ${userToken ? 'SÍ' : 'NO'}`);
  console.log(`🏠 Dirección ID creada: ${testAddressId}`);
  
  return { userToken, testAddressId };
}

// ========================================
// EJECUTAR TESTS
// ========================================
if (typeof globalThis !== 'undefined' && globalThis.process?.argv[1] && import.meta.url.includes(globalThis.process.argv[1])) {
  runAddressTests().catch(console.error);
}

export { runAddressTests };
