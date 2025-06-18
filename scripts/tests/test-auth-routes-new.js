// ========================================
// SCRIPT DE TESTING - RUTAS DE AUTENTICACIÓN
// ========================================
// API Base: http://localhost:5500/api/v1/auth
// 
// Endpoints testeados:
// ✅ POST /register - Registro de usuario
// ✅ POST /login - Inicio de sesión
// ✅ POST /verify-email - Verificar email
// ✅ POST /resend-verification - Reenviar verificación
// ✅ GET /verification-status - Estado de verificación
// ✅ GET /profile - Perfil de usuario (protegido)

const baseURL = 'http://localhost:5500/api/v1/auth';

// Variables globales para el testing
let userToken = '';
let userId = '';
let verificationCode = '';
const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'password123';

console.log('🔐 === TESTING RUTAS DE AUTENTICACIÓN ===');
console.log(`📧 Email de prueba: ${testEmail}`);
console.log(`🌐 Base URL: ${baseURL}`);
console.log('');

// ========================================
// FUNCIÓN HELPER PARA HACER REQUESTS
// ========================================
async function makeRequest(endpoint, method = 'GET', data = null, token = null) {
  const url = `${baseURL}${endpoint}`;
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
// TESTS DE AUTENTICACIÓN
// ========================================

async function runAuthTests() {
  console.log('🚀 INICIANDO TESTS DE AUTENTICACIÓN...\n');

  // ========================================
  // 1. TEST: REGISTRO DE USUARIO
  // ========================================
  console.log('1️⃣ === TEST: REGISTRO DE USUARIO ===');
  
  const registerData = {
    nombre: 'Usuario Test',
    email: testEmail,
    password: testPassword,
    telefono: '+34612345678'
  };

  const { response: registerResponse, result: registerResult } = await makeRequest('/register', 'POST', registerData);
  
  if (registerResponse && registerResponse.status === 201) {
    console.log('✅ Registro exitoso');
    userId = registerResult.user?.id;
    verificationCode = '123456'; // Simulado para testing
  } else {
    console.log('❌ Error en registro');
    return;
  }

  // ========================================
  // 2. TEST: LOGIN ANTES DE VERIFICAR
  // ========================================
  console.log('2️⃣ === TEST: LOGIN SIN VERIFICAR ===');
  
  const loginData = {
    email: testEmail,
    password: testPassword
  };

  const { response: loginResponse1 } = await makeRequest('/login', 'POST', loginData);
  
  if (loginResponse1 && loginResponse1.status === 400) {
    console.log('✅ Login sin verificar falló correctamente');
  } else {
    console.log('❌ Login sin verificar debería haber fallado');
  }

  // ========================================
  // 3. TEST: VERIFICAR EMAIL
  // ========================================
  console.log('3️⃣ === TEST: VERIFICAR EMAIL ===');
  
  const verifyData = {
    email: testEmail,
    code: verificationCode
  };

  const { response: verifyResponse } = await makeRequest('/verify-email', 'POST', verifyData);
  
  if (verifyResponse && verifyResponse.status === 200) {
    console.log('✅ Verificación exitosa');
  } else {
    console.log('❌ Error en verificación');
  }

  // ========================================
  // 4. TEST: LOGIN DESPUÉS DE VERIFICAR
  // ========================================
  console.log('4️⃣ === TEST: LOGIN DESPUÉS DE VERIFICAR ===');
  
  const { response: loginResponse2, result: loginResult } = await makeRequest('/login', 'POST', loginData);
  
  if (loginResponse2 && loginResponse2.status === 200) {
    console.log('✅ Login exitoso');
    userToken = loginResult.token;
  } else {
    console.log('❌ Error en login');
    return;
  }

  // ========================================
  // 5. TEST: OBTENER PERFIL
  // ========================================
  console.log('5️⃣ === TEST: OBTENER PERFIL ===');
  
  const { response: profileResponse } = await makeRequest('/profile', 'GET', null, userToken);
  
  if (profileResponse && profileResponse.status === 200) {
    console.log('✅ Obtener perfil exitoso');
  } else {
    console.log('❌ Error al obtener perfil');
  }

  // ========================================
  // 6. TEST: ESTADO DE VERIFICACIÓN
  // ========================================
  console.log('6️⃣ === TEST: ESTADO DE VERIFICACIÓN ===');
  
  const { response: statusResponse } = await makeRequest(`/verification-status?email=${testEmail}`, 'GET');
  
  if (statusResponse && statusResponse.status === 200) {
    console.log('✅ Estado de verificación obtenido');
  } else {
    console.log('❌ Error al obtener estado');
  }

  // ========================================
  // 7. TEST: REENVIAR VERIFICACIÓN
  // ========================================
  console.log('7️⃣ === TEST: REENVIAR VERIFICACIÓN ===');
  
  const resendData = { email: testEmail };
  const { response: resendResponse } = await makeRequest('/resend-verification', 'POST', resendData);
  
  if (resendResponse && (resendResponse.status === 200 || resendResponse.status === 400)) {
    console.log('✅ Reenvío procesado');
  } else {
    console.log('❌ Error en reenvío');
  }

  console.log('\n🎉 === TESTS DE AUTENTICACIÓN COMPLETADOS ===');
  console.log(`🔑 Token: ${userToken ? 'OBTENIDO' : 'NO OBTENIDO'}`);
  console.log(`👤 User ID: ${userId}`);
  
  return { userToken, userId };
}

// ========================================
// EJECUTAR TESTS
// ========================================
if (typeof globalThis !== 'undefined' && globalThis.process?.argv[1] && import.meta.url.includes(globalThis.process.argv[1])) {
  runAuthTests().catch(console.error);
}

export { runAuthTests, testEmail, testPassword };
