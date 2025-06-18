// ========================================
// SCRIPT DE TESTING - RUTAS DE RESEÑAS
// ========================================
// API Base: http://localhost:5500/api/v1/reviews
// 
// Endpoints testeados:
// ✅ GET /product/:productId - Obtener reseñas de producto (público)
// ✅ POST / - Crear reseña (protegido)
// ✅ PUT /:id - Actualizar reseña (protegido)
// ✅ DELETE /:id - Eliminar reseña (protegido)

const baseURL = 'http://localhost:5500/api/v1/reviews';
const authURL = 'http://localhost:5500/api/v1/auth';

// Variables para testing
let userToken = '';
let testReviewId = '';
const testEmail = `test_reviews_${Date.now()}@example.com`;
const testProductId = 1; // Asumiendo que existe un producto con ID 1

console.log('⭐ === TESTING RUTAS DE RESEÑAS ===');
console.log(`🌐 Base URL: ${baseURL}`);
console.log(`📦 Product ID de prueba: ${testProductId}`);
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
    nombre: 'Usuario Test Reseñas',
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
// TESTS DE RESEÑAS
// ========================================

async function runReviewTests() {
  console.log('🚀 INICIANDO TESTS DE RESEÑAS...\n');

  // Configurar usuario de prueba
  const setupSuccess = await setupTestUser();
  if (!setupSuccess) {
    console.log('❌ No se pudo configurar el usuario de prueba');
    return;
  }

  // ========================================
  // 1. TEST: OBTENER RESEÑAS DE PRODUCTO (PÚBLICO)
  // ========================================
  console.log('1️⃣ === TEST: OBTENER RESEÑAS DE PRODUCTO (PÚBLICO) ===');
  
  const { response: getReviewsResponse, result: getReviewsResult } = await makeRequest(`/product/${testProductId}`, 'GET');
  
  if (getReviewsResponse && getReviewsResponse.status === 200) {
    console.log('✅ Obtener reseñas de producto exitoso');
    console.log(`📊 Reseñas encontradas: ${getReviewsResult.reviews?.length || 0}`);
    console.log(`⭐ Promedio: ${getReviewsResult.averageRating || 'N/A'}`);
  } else {
    console.log('❌ Error al obtener reseñas de producto');
  }

  // ========================================
  // 2. TEST: CREAR RESEÑA (FORMATO DB)
  // ========================================
  console.log('2️⃣ === TEST: CREAR RESEÑA (FORMATO DB) ===');
  
  const reviewDataDB = {
    producto_id: testProductId,
    estrellas: 5,
    comentario: 'Excelente producto, muy recomendado!'
  };

  const { response: createResponse, result: createResult } = await makeRequest('/', 'POST', reviewDataDB, userToken);
  
  if (createResponse && createResponse.status === 201) {
    console.log('✅ Reseña creada exitosamente (formato DB)');
    testReviewId = createResult.review?.id;
  } else {
    console.log('❌ Error al crear reseña (formato DB)');
  }

  // ========================================
  // 3. TEST: CREAR RESEÑA (FORMATO FRONTEND)
  // ========================================
  console.log('3️⃣ === TEST: CREAR RESEÑA (FORMATO FRONTEND) ===');
  
  const reviewDataFrontend = {
    productId: testProductId,
    rating: 4,
    comment: 'Buen producto, pero podría mejorar en algunos aspectos.'
  };

  const { response: createFrontendResponse } = await makeRequest('/', 'POST', reviewDataFrontend, userToken);
  
  if (createFrontendResponse && createFrontendResponse.status === 201) {
    console.log('✅ Reseña creada exitosamente (formato Frontend)');
  } else if (createFrontendResponse && createFrontendResponse.status === 400) {
    console.log('⚠️ Usuario ya tiene reseña para este producto (esperado si se permite una sola reseña por usuario)');
  } else {
    console.log('❌ Error al crear reseña (formato Frontend)');
  }

  // ========================================
  // 4. TEST: OBTENER RESEÑAS DESPUÉS DE CREAR
  // ========================================
  console.log('4️⃣ === TEST: OBTENER RESEÑAS DESPUÉS DE CREAR ===');
  
  const { response: getAfterCreateResponse, result: getAfterCreateResult } = await makeRequest(`/product/${testProductId}`, 'GET');
  
  if (getAfterCreateResponse && getAfterCreateResponse.status === 200) {
    console.log('✅ Obtener reseñas después de crear exitoso');
    console.log(`📊 Reseñas totales: ${getAfterCreateResult.reviews?.length || 0}`);
    console.log(`⭐ Nuevo promedio: ${getAfterCreateResult.averageRating || 'N/A'}`);
  } else {
    console.log('❌ Error al obtener reseñas después de crear');
  }

  // ========================================
  // 5. TEST: ACTUALIZAR RESEÑA
  // ========================================
  console.log('5️⃣ === TEST: ACTUALIZAR RESEÑA ===');
  
  if (testReviewId) {
    const updateData = {
      estrellas: 3,
      comentario: 'He cambiado de opinión, es un producto regular.'
    };

    const { response: updateResponse } = await makeRequest(`/${testReviewId}`, 'PUT', updateData, userToken);
    
    if (updateResponse && updateResponse.status === 200) {
      console.log('✅ Reseña actualizada exitosamente');
    } else {
      console.log('❌ Error al actualizar reseña');
    }
  } else {
    console.log('⚠️ No hay reseña para actualizar');
  }

  // ========================================
  // 6. TEST: ACTUALIZAR RESEÑA INEXISTENTE
  // ========================================
  console.log('6️⃣ === TEST: ACTUALIZAR RESEÑA INEXISTENTE ===');
  
  const updateFakeData = {
    estrellas: 5,
    comentario: 'Reseña inexistente'
  };

  const { response: updateFakeResponse } = await makeRequest('/99999', 'PUT', updateFakeData, userToken);
  
  if (updateFakeResponse && updateFakeResponse.status === 404) {
    console.log('✅ Actualización de reseña inexistente falló correctamente');
  } else {
    console.log('❌ Actualización de reseña inexistente debería fallar');
  }

  // ========================================
  // 7. TEST: VALIDACIÓN DE DATOS
  // ========================================
  console.log('7️⃣ === TEST: VALIDACIÓN DE DATOS ===');
  
  const invalidReviewData = {
    producto_id: 'invalid', // ID inválido
    estrellas: 6, // Fuera de rango (1-5)
    comentario: '' // Comentario vacío
  };

  const { response: validationResponse } = await makeRequest('/', 'POST', invalidReviewData, userToken);
  
  if (validationResponse && validationResponse.status === 400) {
    console.log('✅ Validación de datos funcionando correctamente');
  } else {
    console.log('❌ Validación de datos no funcionando');
  }

  // ========================================
  // 8. TEST: CREAR RESEÑA SIN TOKEN
  // ========================================
  console.log('8️⃣ === TEST: CREAR RESEÑA SIN TOKEN ===');
  
  const reviewWithoutAuth = {
    producto_id: testProductId,
    estrellas: 5,
    comentario: 'Sin autenticación'
  };

  const { response: noAuthResponse } = await makeRequest('/', 'POST', reviewWithoutAuth);
  
  if (noAuthResponse && noAuthResponse.status === 401) {
    console.log('✅ Creación sin token denegada correctamente');
  } else {
    console.log('❌ Creación sin token debería ser denegada');
  }

  // ========================================
  // 9. TEST: OBTENER RESEÑAS DE PRODUCTO INEXISTENTE
  // ========================================
  console.log('9️⃣ === TEST: OBTENER RESEÑAS DE PRODUCTO INEXISTENTE ===');
  
  const { response: noProductResponse, result: noProductResult } = await makeRequest('/product/99999', 'GET');
  
  if (noProductResponse && noProductResponse.status === 200) {
    console.log('✅ Obtener reseñas de producto inexistente manejado');
    console.log(`📊 Reseñas: ${noProductResult.reviews?.length || 0} (esperado: 0)`);
  } else {
    console.log('❌ Error al obtener reseñas de producto inexistente');
  }

  // ========================================
  // 10. TEST: ELIMINAR RESEÑA
  // ========================================
  console.log('🔟 === TEST: ELIMINAR RESEÑA ===');
  
  if (testReviewId) {
    const { response: deleteResponse } = await makeRequest(`/${testReviewId}`, 'DELETE', null, userToken);
    
    if (deleteResponse && deleteResponse.status === 200) {
      console.log('✅ Reseña eliminada exitosamente');
    } else {
      console.log('❌ Error al eliminar reseña');
    }
  } else {
    console.log('⚠️ No hay reseña para eliminar');
  }

  // ========================================
  // 11. TEST: ELIMINAR RESEÑA INEXISTENTE
  // ========================================
  console.log('1️⃣1️⃣ === TEST: ELIMINAR RESEÑA INEXISTENTE ===');
  
  const { response: deleteFakeResponse } = await makeRequest('/99999', 'DELETE', null, userToken);
  
  if (deleteFakeResponse && deleteFakeResponse.status === 404) {
    console.log('✅ Eliminación de reseña inexistente falló correctamente');
  } else {
    console.log('❌ Eliminación de reseña inexistente debería fallar');
  }

  // ========================================
  // 12. TEST: VERIFICAR RESEÑAS DESPUÉS DE ELIMINAR
  // ========================================
  console.log('1️⃣2️⃣ === TEST: VERIFICAR RESEÑAS DESPUÉS DE ELIMINAR ===');
  
  const { response: finalResponse, result: finalResult } = await makeRequest(`/product/${testProductId}`, 'GET');
  
  if (finalResponse && finalResponse.status === 200) {
    console.log('✅ Verificación final de reseñas exitosa');
    console.log(`📊 Reseñas finales: ${finalResult.reviews?.length || 0}`);
    console.log(`⭐ Promedio final: ${finalResult.averageRating || 'N/A'}`);
  } else {
    console.log('❌ Error en verificación final');
  }

  console.log('\n🎉 === TESTS DE RESEÑAS COMPLETADOS ===');
  console.log(`🔑 Token obtenido: ${userToken ? 'SÍ' : 'NO'}`);
  console.log(`⭐ Review ID creada: ${testReviewId}`);
  console.log(`📦 Product ID usado: ${testProductId}`);
  
  return { userToken, testReviewId };
}

// ========================================
// EJECUTAR TESTS
// ========================================
if (typeof globalThis !== 'undefined' && globalThis.process?.argv[1] && import.meta.url.includes(globalThis.process.argv[1])) {
  runReviewTests().catch(console.error);
}

export { runReviewTests };
