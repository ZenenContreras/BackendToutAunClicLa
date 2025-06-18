// ========================================
// SCRIPT DE TESTING - RUTAS DE USUARIOS
// ========================================
// API Base: http://localhost:5500/api/v1/users
// 
// Endpoints testeados:
// ✅ PUT /profile - Actualizar perfil
// ✅ PUT /password - Cambiar contraseña
// ✅ DELETE /account - Eliminar cuenta
// ✅ GET / - Obtener todos los usuarios (admin)
// ✅ PUT /:id/status - Actualizar estado de usuario (admin)

const baseURL = 'http://localhost:5500/api/v1/users';
const authURL = 'http://localhost:5500/api/v1/auth';

// Variables para testing
let userToken = '';
let adminToken = '';
let testUserId = '';
const testEmail = `test_user_${Date.now()}@example.com`;
const testPassword = 'password123';

console.log('👤 === TESTING RUTAS DE USUARIOS ===');
console.log(`📧 Email de prueba: ${testEmail}`);
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
    nombre: 'Usuario Test',
    email: testEmail,
    password: testPassword,
    telefono: '+34612345678'
  };

  const { response: registerResponse, result: registerResult } = await makeRequest('/register', 'POST', registerData, null, authURL);
  
  if (registerResponse && registerResponse.status === 201) {
    console.log('✅ Usuario registrado');
    testUserId = registerResult.user?.id;
  } else {
    console.log('❌ Error al registrar usuario');
    return false;
  }

  // Hacer login para obtener token
  const loginData = {
    email: testEmail,
    password: testPassword
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
// TESTS DE USUARIOS
// ========================================

async function runUserTests() {
  console.log('🚀 INICIANDO TESTS DE USUARIOS...\n');

  // Configurar usuario de prueba
  const setupSuccess = await setupTestUser();
  if (!setupSuccess) {
    console.log('❌ No se pudo configurar el usuario de prueba');
    return;
  }

  // ========================================
  // 1. TEST: ACTUALIZAR PERFIL
  // ========================================
  console.log('1️⃣ === TEST: ACTUALIZAR PERFIL ===');
  
  const updateProfileData = {
    nombre: 'Usuario Test Actualizado',
    telefono: '+34987654321',
    avatarUrl: 'https://example.com/avatar.jpg'
  };

  const { response: updateResponse } = await makeRequest('/profile', 'PUT', updateProfileData, userToken);
  
  if (updateResponse && updateResponse.status === 200) {
    console.log('✅ Perfil actualizado exitosamente');
  } else {
    console.log('❌ Error al actualizar perfil');
  }

  // ========================================
  // 2. TEST: CAMBIAR CONTRASEÑA
  // ========================================
  console.log('2️⃣ === TEST: CAMBIAR CONTRASEÑA ===');
  
  const changePasswordData = {
    currentPassword: testPassword,
    newPassword: 'newpassword123'
  };

  const { response: passwordResponse } = await makeRequest('/password', 'PUT', changePasswordData, userToken);
  
  if (passwordResponse && passwordResponse.status === 200) {
    console.log('✅ Contraseña cambiada exitosamente');
  } else {
    console.log('❌ Error al cambiar contraseña');
  }

  // ========================================
  // 3. TEST: CAMBIAR CONTRASEÑA CON DATOS INCORRECTOS
  // ========================================
  console.log('3️⃣ === TEST: CAMBIAR CONTRASEÑA CON DATOS INCORRECTOS ===');
  
  const wrongPasswordData = {
    currentPassword: 'wrongpassword',
    newPassword: 'newpassword123'
  };

  const { response: wrongPasswordResponse } = await makeRequest('/password', 'PUT', wrongPasswordData, userToken);
  
  if (wrongPasswordResponse && wrongPasswordResponse.status === 400) {
    console.log('✅ Cambio con contraseña incorrecta falló correctamente');
  } else {
    console.log('❌ Cambio con contraseña incorrecta debería haber fallado');
  }

  // ========================================
  // 4. TEST: OBTENER USUARIOS (ADMIN) - SIN PERMISOS
  // ========================================
  console.log('4️⃣ === TEST: OBTENER USUARIOS SIN PERMISOS ADMIN ===');
  
  const { response: usersResponse } = await makeRequest('/', 'GET', null, userToken);
  
  if (usersResponse && usersResponse.status === 403) {
    console.log('✅ Acceso denegado correctamente (no admin)');
  } else {
    console.log('❌ Debería denegar acceso a usuario no admin');
  }

  // ========================================
  // 5. TEST: ACTUALIZAR ESTADO DE USUARIO (ADMIN) - SIN PERMISOS
  // ========================================
  console.log('5️⃣ === TEST: ACTUALIZAR ESTADO SIN PERMISOS ADMIN ===');
  
  const updateStatusData = {
    blocked: true,
    reason: 'Test de bloqueo'
  };

  const { response: statusResponse } = await makeRequest(`/${testUserId}/status`, 'PUT', updateStatusData, userToken);
  
  if (statusResponse && statusResponse.status === 403) {
    console.log('✅ Actualización de estado denegada correctamente (no admin)');
  } else {
    console.log('❌ Debería denegar actualización de estado a usuario no admin');
  }

  // ========================================
  // 6. TEST: ACCESO SIN TOKEN
  // ========================================
  console.log('6️⃣ === TEST: ACCESO SIN TOKEN ===');
  
  const { response: noTokenResponse } = await makeRequest('/profile', 'PUT', updateProfileData);
  
  if (noTokenResponse && noTokenResponse.status === 401) {
    console.log('✅ Acceso sin token denegado correctamente');
  } else {
    console.log('❌ Debería denegar acceso sin token');
  }

  // ========================================
  // 7. TEST: VALIDACIÓN DE DATOS EN ACTUALIZAR PERFIL
  // ========================================
  console.log('7️⃣ === TEST: VALIDACIÓN DE DATOS EN PERFIL ===');
  
  const invalidProfileData = {
    nombre: '', // Nombre vacío
    telefono: '+34987654321'
  };

  const { response: invalidResponse } = await makeRequest('/profile', 'PUT', invalidProfileData, userToken);
  
  if (invalidResponse && invalidResponse.status === 400) {
    console.log('✅ Validación de datos falló correctamente');
  } else {
    console.log('❌ Debería fallar la validación de datos');
  }

  // ========================================
  // 8. TEST: ELIMINAR CUENTA
  // ========================================
  console.log('8️⃣ === TEST: ELIMINAR CUENTA ===');
  
  const deleteAccountData = {
    password: 'newpassword123' // Usar la nueva contraseña
  };

  const { response: deleteResponse } = await makeRequest('/account', 'DELETE', deleteAccountData, userToken);
  
  if (deleteResponse && deleteResponse.status === 200) {
    console.log('✅ Cuenta eliminada exitosamente');
  } else {
    console.log('❌ Error al eliminar cuenta');
  }

  // ========================================
  // 9. TEST: USAR TOKEN DESPUÉS DE ELIMINAR CUENTA
  // ========================================
  console.log('9️⃣ === TEST: USAR TOKEN DESPUÉS DE ELIMINAR CUENTA ===');
  
  const { response: deletedUserResponse } = await makeRequest('/profile', 'PUT', updateProfileData, userToken);
  
  if (deletedUserResponse && deletedUserResponse.status === 401) {
    console.log('✅ Token inválido después de eliminar cuenta');
  } else {
    console.log('❌ Token debería ser inválido después de eliminar cuenta');
  }

  console.log('\n🎉 === TESTS DE USUARIOS COMPLETADOS ===');
  console.log(`🔑 Token obtenido: ${userToken ? 'SÍ' : 'NO'}`);
  console.log(`👤 User ID: ${testUserId}`);
  
  return { userToken, testUserId };
}

// ========================================
// EJECUTAR TESTS
// ========================================
if (typeof globalThis !== 'undefined' && globalThis.process?.argv[1] && import.meta.url.includes(globalThis.process.argv[1])) {
  runUserTests().catch(console.error);
}

export { runUserTests };
