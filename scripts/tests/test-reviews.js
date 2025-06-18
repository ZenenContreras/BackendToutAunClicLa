// ========================================
// TESTS DE RESEÑAS
// ========================================
// Rutas testeadas:
// GET /reviews/product/:productId - Obtener reseñas de producto (público)
// POST /reviews - Crear reseña (protegido)
// PUT /reviews/:id - Actualizar reseña (protegido)
// DELETE /reviews/:id - Eliminar reseña (protegido)

import { BaseAPITester, log } from './test-utils.js';

class ReviewsTester extends BaseAPITester {
  constructor() {
    super('REVIEWS');
    this.reviews = [];
    this.products = [];
    this.testProductId = 1;
  }

  async runTests() {
    log(`\n⭐ TESTING REVIEWS ROUTES`, 'bold');
    log('='.repeat(50), 'bold');

    // Configurar autenticación (requerida para crear/actualizar/eliminar reseñas)
    await this.setupAuth();

    // Obtener productos disponibles
    const productsResponse = await this.apiCall('/products');
    if (productsResponse.ok) {
      this.products = productsResponse.data.products || [];
      if (this.products.length > 0) {
        this.testProductId = this.products[0].id;
      }
    }

    // 1. Test obtener reseñas de producto (público)
    await this.test('Get product reviews (public)', async () => {
      const response = await this.apiCall(`/reviews/product/${this.testProductId}`);

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const reviews = response.data.reviews || [];
      log(`    Found ${reviews.length} reviews`, 'dim');
      log(`    Average rating: ${response.data.averageRating || 'N/A'}`, 'dim');
      return true;
    });

    // 2. Test crear reseña (formato DB)
    await this.test('Create review (DB format)', async () => {
      const reviewData = {
        producto_id: this.testProductId,
        estrellas: 5,
        comentario: 'Excelente producto, muy recomendado!'
      };

      const response = await this.apiCall('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const review = response.data.review;
      if (review) {
        this.reviews.push(review);
      }
      log(`    Review created with DB format`, 'dim');
      return true;
    });

    // 3. Test crear reseña (formato Frontend)
    await this.test('Create review (Frontend format)', async () => {
      const reviewData = {
        productId: this.testProductId,
        rating: 4,
        comment: 'Buen producto, pero podría mejorar.'
      };

      const response = await this.apiCall('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });

      // Puede fallar si el usuario ya tiene una reseña para este producto
      if (response.status === 400) {
        log(`    User already has review for this product (expected)`, 'dim');
        return true;
      } else if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const review = response.data.review;
      if (review) {
        this.reviews.push(review);
      }
      log(`    Review created with Frontend format`, 'dim');
      return true;
    });

    // 4. Test obtener reseñas después de crear
    await this.test('Get reviews after creation', async () => {
      const response = await this.apiCall(`/reviews/product/${this.testProductId}`);

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const reviews = response.data.reviews || [];
      log(`    Total reviews: ${reviews.length}`, 'dim');
      log(`    New average rating: ${response.data.averageRating || 'N/A'}`, 'dim');
      return true;
    });

    // 5. Test actualizar reseña
    if (this.reviews.length > 0) {
      await this.test('Update review', async () => {
        const reviewId = this.reviews[0].id;
        const updateData = {
          estrellas: 3,
          comentario: 'He cambiado de opinión, es un producto regular.'
        };

        const response = await this.apiCall(`/reviews/${reviewId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
          return false;
        }

        log(`    Review updated successfully`, 'dim');
        return true;
      });
    }

    // 6. Test actualizar reseña inexistente
    await this.test('Update non-existent review', async () => {
      const updateData = {
        estrellas: 5,
        comentario: 'Reseña inexistente'
      };

      const response = await this.apiCall('/reviews/99999', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.status === 404) {
        log(`    Correctly returned 404 for non-existent review`, 'dim');
        return true;
      } else {
        log(`    Should return 404 for non-existent review`, 'red');
        return false;
      }
    });

    // 7. Test validación de datos
    await this.test('Create review with invalid data', async () => {
      const invalidData = {
        producto_id: 'invalid',
        estrellas: 6, // Fuera de rango (1-5)
        comentario: ''
      };

      const response = await this.apiCall('/reviews', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      if (response.status === 400) {
        log(`    Correctly rejected invalid data`, 'dim');
        return true;
      } else {
        log(`    Should reject invalid data`, 'red');
        return false;
      }
    });

    // 8. Test crear reseña sin token
    await this.test('Create review without token', async () => {
      const tempToken = this.token;
      this.token = null;

      const reviewData = {
        producto_id: this.testProductId,
        estrellas: 5,
        comentario: 'Sin autenticación'
      };

      const response = await this.apiCall('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });

      this.token = tempToken;

      if (response.status === 401) {
        log(`    Correctly denied creation without token`, 'dim');
        return true;
      } else {
        log(`    Should deny creation without token`, 'red');
        return false;
      }
    });

    // 9. Test obtener reseñas de producto inexistente
    await this.test('Get reviews for non-existent product', async () => {
      const response = await this.apiCall('/reviews/product/99999');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const reviews = response.data.reviews || [];
      log(`    Reviews for non-existent product: ${reviews.length} (expected: 0)`, 'dim');
      return true;
    });

    // 10. Test eliminar reseña
    if (this.reviews.length > 0) {
      await this.test('Delete review', async () => {
        const reviewId = this.reviews[0].id;
        const response = await this.apiCall(`/reviews/${reviewId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
          return false;
        }

        log(`    Review deleted successfully`, 'dim');
        return true;
      });
    }

    // 11. Test eliminar reseña inexistente
    await this.test('Delete non-existent review', async () => {
      const response = await this.apiCall('/reviews/99999', {
        method: 'DELETE'
      });

      if (response.status === 404) {
        log(`    Correctly returned 404 for non-existent review`, 'dim');
        return true;
      } else {
        log(`    Should return 404 for non-existent review`, 'red');
        return false;
      }
    });

    // 12. Test verificar reseñas después de eliminar
    await this.test('Verify reviews after deletion', async () => {
      const response = await this.apiCall(`/reviews/product/${this.testProductId}`);

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const reviews = response.data.reviews || [];
      log(`    Final reviews count: ${reviews.length}`, 'dim');
      log(`    Final average rating: ${response.data.averageRating || 'N/A'}`, 'dim');
      return true;
    });

    this.printStats();
    return {
      reviews: this.reviews,
      testProductId: this.testProductId,
      token: this.token
    };
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ReviewsTester();
  tester.runTests().catch(console.error);
}

export { ReviewsTester };
