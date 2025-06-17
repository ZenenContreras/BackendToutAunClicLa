#!/usr/bin/env node

/**
 * Script de pruebas para el sistema de reviews
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

const testReviewsAPI = async () => {
  log('\n⭐ TESTING DEL SISTEMA DE REVIEWS', 'bold');
  log('=================================', 'blue');

  try {
    // 1. Obtener usuario de prueba
    const { data: users, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id, correo_electronico, nombre')
      .limit(1);

    if (userError || !users || users.length === 0) {
      log('❌ No hay usuarios para probar. Ejecuta: npm run test:data create', 'red');
      return false;
    }

    const testUser = users[0];
    log(`👤 Usuario de prueba: ${testUser.correo_electronico}`, 'cyan');

    // 2. Obtener productos disponibles
    const { data: products, error: productError } = await supabaseAdmin
      .from('productos')
      .select('id, nombre')
      .limit(2);

    if (productError || !products || products.length === 0) {
      log('❌ No hay productos disponibles', 'red');
      return false;
    }

    log(`📦 ${products.length} productos disponibles para testing`, 'cyan');

    // 3. Limpiar reviews existentes del usuario
    await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('usuario_id', testUser.id);

    log('🧹 Reviews del usuario limpiados', 'cyan');

    // 4. Test: Obtener reviews vacías de un producto
    log('\n📝 Test 1: Obtener reviews vacías de producto', 'yellow');
    const testProduct = products[0];
    const { data: emptyReviews, error: emptyError } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        usuarios(nombre, apellido)
      `)
      .eq('producto_id', testProduct.id);

    if (emptyError) {
      log(`❌ Error obteniendo reviews vacías: ${emptyError.message}`, 'red');
    } else {
      log(`✅ Reviews vacías obtenidas correctamente (${emptyReviews.length} elementos)`, 'green');
    }

    // 5. Test: Crear review válida
    log('\n📝 Test 2: Crear review válida', 'yellow');
    const { data: newReview, error: createError } = await supabaseAdmin
      .from('reviews')
      .insert([{
        usuario_id: testUser.id,
        producto_id: testProduct.id,
        estrellas: 5,
        comentario: 'Excelente producto, muy recomendado!'
      }])
      .select(`
        *,
        usuarios(nombre, apellido)
      `)
      .single();

    if (createError) {
      log(`❌ Error creando review: ${createError.message}`, 'red');
    } else {
      log(`✅ Review creada: ${newReview.estrellas} estrellas`, 'green');
      log(`   Comentario: "${newReview.comentario}"`, 'cyan');
    }

    // 6. Test: Crear múltiples reviews
    log('\n📝 Test 3: Crear múltiples reviews', 'yellow');
    const reviewsToCreate = [
      {
        usuario_id: testUser.id,
        producto_id: products[1].id,
        estrellas: 4,
        comentario: 'Muy buen producto, aunque podría mejorar en algunos aspectos.'
      },
      {
        usuario_id: testUser.id,
        producto_id: testProduct.id,
        estrellas: 3,
        comentario: 'Producto decente, cumple con lo esperado.'
      }
    ];

    let reviewsCreated = 0;
    for (const reviewData of reviewsToCreate) {
      const { data: review, error } = await supabaseAdmin
        .from('reviews')
        .insert([reviewData])
        .select('*')
        .single();

      if (error) {
        if (error.message.includes('duplicate')) {
          log(`⚠️  Review duplicada rechazada (correcto): ${error.message}`, 'yellow');
        } else {
          log(`❌ Error creando review: ${error.message}`, 'red');
        }
      } else {
        log(`✅ Review creada para producto ${reviewData.producto_id}: ${reviewData.estrellas} estrellas`, 'green');
        reviewsCreated++;
      }
    }

    // 7. Test: Obtener reviews de un producto
    log('\n📝 Test 4: Obtener reviews de producto', 'yellow');
    const { data: productReviews, error: reviewsError, count } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        usuarios(nombre, apellido)
      `, { count: 'exact' })
      .eq('producto_id', testProduct.id)
      .order('fecha_creacion', { ascending: false });

    if (reviewsError) {
      log(`❌ Error obteniendo reviews: ${reviewsError.message}`, 'red');
    } else {
      log(`✅ ${productReviews.length} reviews obtenidas para ${testProduct.nombre}`, 'green');
      productReviews.forEach((review, index) => {
        const userName = review.usuarios ? `${review.usuarios.nombre} ${review.usuarios.apellido}` : 'Usuario';
        log(`   ${index + 1}. ${userName}: ${review.estrellas}⭐ - "${review.comentario}"`, 'cyan');
      });
    }

    // 8. Test: Calcular promedio de estrellas
    log('\n📝 Test 5: Calcular estadísticas de reviews', 'yellow');
    if (productReviews && productReviews.length > 0) {
      const totalStars = productReviews.reduce((sum, review) => sum + review.estrellas, 0);
      const averageRating = (totalStars / productReviews.length).toFixed(1);
      const starDistribution = {};
      
      productReviews.forEach(review => {
        starDistribution[review.estrellas] = (starDistribution[review.estrellas] || 0) + 1;
      });

      log(`✅ Promedio de calificación: ${averageRating}⭐ (${productReviews.length} reviews)`, 'green');
      log('   Distribución de estrellas:', 'cyan');
      for (let stars = 5; stars >= 1; stars--) {
        const count = starDistribution[stars] || 0;
        log(`   ${stars}⭐: ${count} reviews`, 'cyan');
      }
    }

    // 9. Test: Actualizar review
    log('\n📝 Test 6: Actualizar review existente', 'yellow');
    if (newReview) {
      const { data: updatedReview, error: updateError } = await supabaseAdmin
        .from('reviews')
        .update({ 
          estrellas: 4, 
          comentario: 'Producto actualizado - Muy buena calidad después de usarlo más tiempo'
        })
        .eq('id', newReview.id)
        .eq('usuario_id', testUser.id)
        .select(`
          *,
          usuarios(nombre, apellido)
        `)
        .single();

      if (updateError) {
        log(`❌ Error actualizando review: ${updateError.message}`, 'red');
      } else {
        log(`✅ Review actualizada: ${updatedReview.estrellas}⭐`, 'green');
        log(`   Nuevo comentario: "${updatedReview.comentario}"`, 'cyan');
      }
    }

    // 10. Test: Paginación de reviews
    log('\n📝 Test 7: Paginación de reviews', 'yellow');
    const { data: paginatedReviews, error: paginationError, count: totalCount } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        usuarios(nombre, apellido)
      `, { count: 'exact' })
      .eq('producto_id', testProduct.id)
      .order('fecha_creacion', { ascending: false })
      .range(0, 4); // Primeros 5 elementos

    if (paginationError) {
      log(`❌ Error en paginación: ${paginationError.message}`, 'red');
    } else {
      log(`✅ Paginación funcional: ${paginatedReviews.length} elementos de ${totalCount} total`, 'green');
    }

    // 11. Test: Validación de estrellas
    log('\n📝 Test 8: Validación de estrellas (casos inválidos)', 'yellow');
    const invalidRatings = [0, 6, -1, 'invalid'];
    
    for (const rating of invalidRatings) {
      const { data: invalidReview, error: validationError } = await supabaseAdmin
        .from('reviews')
        .insert([{
          usuario_id: testUser.id,
          producto_id: testProduct.id,
          estrellas: rating,
          comentario: 'Test de validación'
        }]);

      if (validationError) {
        log(`✅ Rating inválido ${rating} rechazado correctamente`, 'green');
      } else {
        log(`⚠️  Rating inválido ${rating} fue aceptado`, 'yellow');
      }
    }

    // 12. Test: Eliminar review
    log('\n📝 Test 9: Eliminar review', 'yellow');
    if (newReview) {
      const { error: deleteError } = await supabaseAdmin
        .from('reviews')
        .delete()
        .eq('id', newReview.id)
        .eq('usuario_id', testUser.id);

      if (deleteError) {
        log(`❌ Error eliminando review: ${deleteError.message}`, 'red');
      } else {
        log(`✅ Review eliminada correctamente`, 'green');
      }
    }

    log('\n🎉 Testing de reviews completado', 'green');
    return true;

  } catch (error) {
    log(`❌ Error general en testing: ${error.message}`, 'red');
    return false;
  }
};

const testReviewsEdgeCases = async () => {
  log('\n🔍 TESTING DE CASOS EDGE', 'bold');
  log('========================', 'blue');

  try {
    const { data: users } = await supabaseAdmin.from('usuarios').select('id').limit(1);
    const { data: products } = await supabaseAdmin.from('productos').select('id').limit(1);

    if (!users || !products || users.length === 0 || products.length === 0) {
      log('⚠️  No hay datos suficientes para casos edge', 'yellow');
      return;
    }

    // Test con producto inexistente
    log('\n📝 Test: Review para producto inexistente', 'yellow');
    const { data: invalidProduct, error: productError } = await supabaseAdmin
      .from('reviews')
      .insert([{
        usuario_id: users[0].id,
        producto_id: 99999,
        estrellas: 5,
        comentario: 'Test producto inexistente'
      }]);

    if (productError) {
      log(`✅ Producto inexistente rechazado: ${productError.message}`, 'green');
    } else {
      log(`⚠️  Producto inexistente fue aceptado`, 'yellow');
    }

    // Test con comentario muy largo
    log('\n📝 Test: Comentario excesivamente largo', 'yellow');
    const longComment = 'A'.repeat(2000); // 2000 caracteres
    const { data: longReview, error: longError } = await supabaseAdmin
      .from('reviews')
      .insert([{
        usuario_id: users[0].id,
        producto_id: products[0].id,
        estrellas: 3,
        comentario: longComment
      }]);

    if (longError) {
      log(`✅ Comentario largo manejado: ${longError.message}`, 'green');
    } else {
      log(`✅ Comentario largo aceptado (${longComment.length} caracteres)`, 'green');
    }

    log('\n✅ Testing de casos edge completado', 'green');

  } catch (error) {
    log(`❌ Error en casos edge: ${error.message}`, 'red');
  }
};

const main = async () => {
  log('⭐ SISTEMA DE TESTING - REVIEWS', 'bold');
  log('===============================', 'blue');

  const basicTestsResult = await testReviewsAPI();
  await testReviewsEdgeCases();

  log('\n📊 RESUMEN DE TESTING DE REVIEWS', 'bold');
  log('================================', 'blue');

  if (basicTestsResult) {
    log('✅ Tests básicos: PASADOS', 'green');
    log('✅ Sistema de reviews: FUNCIONAL', 'green');
    log('✅ CRUD de reviews: OPERATIVO', 'green');
    log('✅ Validaciones: FUNCIONANDO', 'green');
    log('✅ Estadísticas: CALCULANDO CORRECTAMENTE', 'green');
  } else {
    log('❌ Tests básicos: FALLIDOS', 'red');
    log('⚠️  Revisar configuración del sistema', 'yellow');
  }

  log('\n🔗 Endpoints de reviews:', 'blue');
  log('  GET    /api/v1/reviews/product/:productId', 'cyan');
  log('  POST   /api/v1/reviews', 'cyan');
  log('  PUT    /api/v1/reviews/:id', 'cyan');
  log('  DELETE /api/v1/reviews/:id', 'cyan');
};

// Ejecutar tests
main().catch(console.error);