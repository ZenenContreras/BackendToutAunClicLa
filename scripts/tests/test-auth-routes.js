// ===================================================================
// SCRIPT DE TESTING COMPLETO PARA RUTAS DE AUTENTICACIÓN
// ===================================================================

import fetch from 'node-fetch';
import { randomBytes } from 'crypto';

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

// ===================================================================
// UTILIDADES HELPER
// ===================================================================

const makeRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${AUTH_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken && !options.noAuth) {
    defaultHeaders.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = { error: 'Failed to parse response' };
  }

  return { response, data, status: response.status };
};

const logTest = (testName, success, details = '') => {
  const status = success ? '✅' : '❌';
  console.log(`${status} ${testName}${details ? ` - ${details}` : ''}`);
};

const logSection = (sectionName) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TESTING: ${sectionName.toUpperCase()}`);
  console.log(`${'='.repeat(60)}`);
};

// ===================================================================
// TESTS DE AUTENTICACIÓN
// ===================================================================

const testUserRegistration = async () => {
  logSection('Registro de Usuario');
  
  testUser = generateTestUser();
  
  try {
    // 1. Test registro exitoso
    const { data, status } = await makeRequest('/register', {
      method: 'POST',
      body: testUser,
      noAuth: true
    });

    if (status === 201 && data.user) {
      logTest('Registro exitoso', true, `Usuario: ${data.user.email}`);
      testUser.id = data.user.id;
      return true;
    } else {
      logTest('Registro exitoso', false, `Status: ${status}, Error: ${data.error || 'Unknown'}`);
      return false;
    }
  } catch (error) {
    logTest('Registro exitoso', false, `Error: ${error.message}`);
    return false;
  }
};

const testUserRegistrationValidation = async () => {
  logSection('Validación de Registro');
  
  const testCases = [
    {
      name: 'Email inválido',
      data: { ...generateTestUser(), email: 'invalid-email' },
      expectedStatus: 400
    },
    {
      name: 'Password muy corta',
      data: { ...generateTestUser(), password: '123' },
      expectedStatus: 400
    },
    {
      name: 'Nombre vacío',
      data: { ...generateTestUser(), nombre: '' },
      expectedStatus: 400
    },
    {
      name: 'Campos faltantes',
      data: { email: 'test@example.com' },
      expectedStatus: 400
    }
  ];

  for (const testCase of testCases) {
    try {
      const { status } = await makeRequest('/register', {
        method: 'POST',
        body: testCase.data,
        noAuth: true
      });

      const success = status === testCase.expectedStatus;
      logTest(testCase.name, success, `Expected: ${testCase.expectedStatus}, Got: ${status}`);
    } catch (error) {
      logTest(testCase.name, false, `Error: ${error.message}`);
    }
  }
};

const testUserLogin = async () => {
  logSection('Login de Usuario');
  
  try {
    // 1. Test login con credenciales correctas
    const { data, status } = await makeRequest('/login', {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password
      },
      noAuth: true
    });

    if (status === 200 && data.token) {
      logTest('Login exitoso', true, `Token recibido`);
      authToken = data.token;
      return true;
    } else {
      logTest('Login exitoso', false, `Status: ${status}, Error: ${data.error || 'Unknown'}`);
      return false;
    }
  } catch (error) {
    logTest('Login exitoso', false, `Error: ${error.message}`);
    return false;
  }
};

const testLoginValidation = async () => {
  logSection('Validación de Login');
  
  const testCases = [
    {
      name: 'Email incorrecto',
      data: { email: 'wrong@example.com', password: testUser.password },
      expectedStatus: 401
    },
    {
      name: 'Password incorrecta',
      data: { email: testUser.email, password: 'wrongpassword' },
      expectedStatus: 401
    },
    {
      name: 'Email faltante',
      data: { password: testUser.password },
      expectedStatus: 400
    },
    {
      name: 'Password faltante',
      data: { email: testUser.email },
      expectedStatus: 400
    }
  ];

  for (const testCase of testCases) {
    try {
      const { status } = await makeRequest('/login', {
        method: 'POST',
        body: testCase.data,
        noAuth: true
      });

      const success = status === testCase.expectedStatus;
      logTest(testCase.name, success, `Expected: ${testCase.expectedStatus}, Got: ${status}`);
    } catch (error) {
      logTest(testCase.name, false, `Error: ${error.message}`);
    }
  }
};

const testGetProfile = async () => {
  logSection('Obtener Perfil');
  
  try {
    // 1. Test obtener perfil con token válido
    const { data, status } = await makeRequest('/profile', {
      method: 'GET'
    });

    if (status === 200 && data.user) {
      logTest('Obtener perfil autenticado', true, `Usuario: ${data.user.nombre}`);
    } else {
      logTest('Obtener perfil autenticado', false, `Status: ${status}, Error: ${data.error || 'Unknown'}`);
    }

    // 2. Test obtener perfil sin token
    const { status: statusNoAuth } = await makeRequest('/profile', {
      method: 'GET',
      noAuth: true
    });

    const success = statusNoAuth === 401;
    logTest('Perfil sin autenticación', success, `Expected: 401, Got: ${statusNoAuth}`);

  } catch (error) {
    logTest('Obtener perfil', false, `Error: ${error.message}`);
  }
};

const testEmailVerification = async () => {
  logSection('Verificación de Email');
  
  try {
    // 1. Test verificar status de verificación
    const { data, status } = await makeRequest('/verification-status', {
      method: 'GET',
      noAuth: true
    });

    if (status === 200) {
      logTest('Verificar status de verificación', true, `Status obtenido`);
    } else {
      logTest('Verificar status de verificación', false, `Status: ${status}`);
    }

    // 2. Test reenviar código de verificación
    const { data: resendData, status: resendStatus } = await makeRequest('/resend-verification', {
      method: 'POST',
      body: { email: testUser.email },
      noAuth: true
    });

    if (resendStatus === 200) {
      logTest('Reenviar código de verificación', true, `Código reenviado`);
    } else {
      logTest('Reenviar código de verificación', false, `Status: ${resendStatus}, Error: ${resendData.error || 'Unknown'}`);
    }

    // 3. Test verificar email con código inválido
    const { status: verifyStatus } = await makeRequest('/verify-email', {
      method: 'POST',
      body: {
        email: testUser.email,
        code: '000000'
      },
      noAuth: true
    });

    const success = verifyStatus === 400 || verifyStatus === 401;
    logTest('Verificar email con código inválido', success, `Expected: 400/401, Got: ${verifyStatus}`);

  } catch (error) {
    logTest('Verificación de email', false, `Error: ${error.message}`);
  }
};

// ===================================================================
// FUNCIÓN PRINCIPAL
// ===================================================================

const runAuthTests = async () => {
  console.log('🚀 INICIANDO TESTS DE RUTAS DE AUTENTICACIÓN');
  console.log(`📍 Base URL: ${AUTH_URL}`);
  console.log(`📅 Fecha: ${new Date().toISOString()}\n`);

  const startTime = Date.now();
  let testsRun = 0;
  let testsPassed = 0;

  try {
    // Ejecutar tests de registro
    if (await testUserRegistration()) {
      testsPassed++;
    }
    testsRun++;

    await testUserRegistrationValidation();
    testsRun++;

    // Ejecutar tests de login
    if (await testUserLogin()) {
      testsPassed++;
    }
    testsRun++;

    await testLoginValidation();
    testsRun++;

    // Ejecutar tests de perfil (requiere autenticación)
    if (authToken) {
      await testGetProfile();
      testsRun++;
    }

    // Ejecutar tests de verificación de email
    await testEmailVerification();
    testsRun++;

  } catch (error) {
    console.error('❌ Error durante la ejecución de tests:', error);
  }

  // Resumen final
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 RESUMEN DE TESTS DE AUTENTICACIÓN');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Tests principales exitosos: ${testsPassed}/${testsRun}`);
  console.log(`⏱️  Tiempo total: ${duration}s`);
  console.log(`👤 Usuario de prueba: ${testUser?.email || 'No creado'}`);
  console.log(`🔑 Token de autenticación: ${authToken ? 'Obtenido' : 'No obtenido'}`);
  
  if (testUser) {
    console.log(`\n📝 Datos del usuario de prueba:`);
    console.log(`   - Email: ${testUser.email}`);
    console.log(`   - Nombre: ${testUser.nombre}`);
    console.log(`   - ID: ${testUser.id || 'No disponible'}`);
  }

  console.log(`\n🏁 Tests de autenticación completados`);
};

// Ejecutar tests si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAuthTests().catch(console.error);
}

export { runAuthTests, testUser, authToken };
