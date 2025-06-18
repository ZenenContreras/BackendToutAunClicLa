// ========================================
// SCRIPT DE TESTING - RUTAS DE PRODUCTOS
// ========================================
// API Base: http://localhost:5500/api/v1/products
// 
// Endpoints testeados:
// ✅ GET / - Obtener todos los productos (público)
// ✅ GET /:id - Obtener producto por ID (público)
// ✅ POST / - Crear producto (admin)
// ✅ PUT /:id - Actualizar producto (admin)
// ✅ DELETE /:id - Eliminar producto (admin)

const baseURL = 'http://localhost:5500/api/v1/products';
const authURL = 'http://localhost:5500/api/v1/auth';

// Variables para testing
let userToken = '';
let adminToken = '';
let testProductId = '';
const testEmail = `test_products_${Date.now()}@example.com`;

console.log('📦 === TESTING RUTAS DE PRODUCTOS ===');
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
  
  // Registrar usuario normal
  const registerData = {
    nombre: 'Usuario Test Productos',
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
// TESTS DE PRODUCTOS
// ========================================

async function runProductTests() {
  console.log('🚀 INICIANDO TESTS DE PRODUCTOS...\n');

  // Configurar usuario de prueba
  const setupSuccess = await setupTestUser();
  if (!setupSuccess) {
    console.log('❌ No se pudo configurar el usuario de prueba');
  }

  // ========================================
  // 1. TEST: OBTENER TODOS LOS PRODUCTOS (PÚBLICO)
  // ========================================
  console.log('1️⃣ === TEST: OBTENER TODOS LOS PRODUCTOS (PÚBLICO) ===');
  
  const { response: getAllResponse, result: getAllResult } = await makeRequest('/', 'GET');
  
  if (getAllResponse && getAllResponse.status === 200) {
    console.log('✅ Obtener productos exitoso');
    console.log(`📊 Total de productos: ${getAllResult.products?.length || 0}`);
  } else {
    console.log('❌ Error al obtener productos');
  }

  // ========================================
  // 2. TEST: OBTENER PRODUCTOS CON PARÁMETROS DE BÚSQUEDA
  // ========================================
  console.log('2️⃣ === TEST: OBTENER PRODUCTOS CON BÚSQUEDA ===');
  
  const { response: searchResponse } = await makeRequest('/?search=test&category=ropa&minPrice=10&maxPrice=100&page=1&limit=10', 'GET');
  
  if (searchResponse && searchResponse.status === 200) {
    console.log('✅ Búsqueda de productos exitosa');
  } else {
    console.log('❌ Error en búsqueda de productos');
  }

  // ========================================
  // 3. TEST: OBTENER PRODUCTO POR ID INEXISTENTE
  // ========================================
  console.log('3️⃣ === TEST: OBTENER PRODUCTO POR ID INEXISTENTE ===');
  
  const { response: notFoundResponse } = await makeRequest('/99999', 'GET');
  
  if (notFoundResponse && notFoundResponse.status === 404) {
    console.log('✅ Producto no encontrado manejado correctamente');
  } else {
    console.log('❌ Debería devolver 404 para producto inexistente');
  }

  // ========================================
  // 4. TEST: CREAR PRODUCTO SIN PERMISOS ADMIN
  // ========================================
  console.log('4️⃣ === TEST: CREAR PRODUCTO SIN PERMISOS ADMIN ===');
  
  const productData = {
    nombre: 'Producto Test',
    descripcion: 'Descripción del producto test',
    precio: 29.99,
    categoria: 'test',
    stock: 100,
    imagenes: ['https://example.com/image1.jpg']
  };

  const { response: createResponse } = await makeRequest('/', 'POST', productData, userToken);
  
  if (createResponse && createResponse.status === 403) {
    console.log('✅ Creación sin permisos admin denegada correctamente');
  } else {
    console.log('❌ Debería denegar creación a usuario no admin');
  }

  // ========================================
  // 5. TEST: CREAR PRODUCTO SIN TOKEN
  // ========================================
  console.log('5️⃣ === TEST: CREAR PRODUCTO SIN TOKEN ===');
  
  const { response: noTokenResponse } = await makeRequest('/', 'POST', productData);
  
  if (noTokenResponse && noTokenResponse.status === 401) {
    console.log('✅ Creación sin token denegada correctamente');
  } else {
    console.log('❌ Debería denegar creación sin token');
  }

  // ========================================
  // 6. TEST: ACTUALIZAR PRODUCTO SIN PERMISOS
  // ========================================
  console.log('6️⃣ === TEST: ACTUALIZAR PRODUCTO SIN PERMISOS ===');
  
  const updateData = {
    nombre: 'Producto Actualizado',
    precio: 39.99
  };

  const { response: updateResponse } = await makeRequest('/1', 'PUT', updateData, userToken);
  
  if (updateResponse && updateResponse.status === 403) {
    console.log('✅ Actualización sin permisos admin denegada correctamente');
  } else {
    console.log('❌ Debería denegar actualización a usuario no admin');
  }

  // ========================================
  // 7. TEST: ELIMINAR PRODUCTO SIN PERMISOS
  // ========================================
  console.log('7️⃣ === TEST: ELIMINAR PRODUCTO SIN PERMISOS ===');
  
  const { response: deleteResponse } = await makeRequest('/1', 'DELETE', null, userToken);
  
  if (deleteResponse && deleteResponse.status === 403) {
    console.log('✅ Eliminación sin permisos admin denegada correctamente');
  } else {
    console.log('❌ Debería denegar eliminación a usuario no admin');
  }

  // ========================================
  // 8. TEST: VALIDACIÓN DE DATOS EN CREACIÓN
  // ========================================
  console.log('8️⃣ === TEST: VALIDACIÓN DE DATOS EN CREACIÓN ===');
  
  const invalidProductData = {
    nombre: '', // Nombre vacío
    precio: -10 // Precio negativo
  };

  const { response: validationResponse } = await makeRequest('/', 'POST', invalidProductData, userToken);
  
  if (validationResponse && validationResponse.status === 400) {
    console.log('✅ Validación de datos falló correctamente');
  } else {
    console.log('❌ Debería fallar la validación de datos');
  }

  // ========================================
  // 9. TEST: OBTENER PRODUCTO POR ID VÁLIDO (si existe)
  // ========================================
  console.log('9️⃣ === TEST: OBTENER PRODUCTO POR ID VÁLIDO ===');
  
  // Intentar obtener un producto con ID 1
  const { response: getByIdResponse, result: getByIdResult } = await makeRequest('/1', 'GET');
  
  if (getByIdResponse && getByIdResponse.status === 200) {
    console.log('✅ Obtener producto por ID exitoso');
    console.log(`📦 Producto: ${getByIdResult.product?.nombre || 'Sin nombre'}`);
  } else if (getByIdResponse && getByIdResponse.status === 404) {
    console.log('⚠️ No hay productos con ID 1 en la base de datos');
  } else {
    console.log('❌ Error al obtener producto por ID');
  }

  // ========================================
  // 10. TEST: OBTENER PRODUCTOS CON PAGINACIÓN
  // ========================================
  console.log('🔟 === TEST: OBTENER PRODUCTOS CON PAGINACIÓN ===');
  
  const { response: paginationResponse, result: paginationResult } = await makeRequest('/?page=1&limit=5', 'GET');
  
  if (paginationResponse && paginationResponse.status === 200) {
    console.log('✅ Paginación funcionando correctamente');
    console.log(`📄 Página 1, límite 5, total: ${paginationResult.products?.length || 0}`);
  } else {
    console.log('❌ Error en paginación');
  }

  console.log('\n🎉 === TESTS DE PRODUCTOS COMPLETADOS ===');
  console.log(`🔑 Token obtenido: ${userToken ? 'SÍ' : 'NO'}`);
  console.log(`📦 Productos encontrados en DB: ${getAllResult?.products?.length || 0}`);
  
  return { userToken };
}

// ========================================
// EJECUTAR TESTS
// ========================================
if (typeof globalThis !== 'undefined' && globalThis.process?.argv[1] && import.meta.url.includes(globalThis.process.argv[1])) {
  runProductTests().catch(console.error);
}

export { runProductTests };
