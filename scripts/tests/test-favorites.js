#!/usr/bin/env node

/**
 * SCRIPT DE TESTING PARA RUTAS DE FAVORITOS
 * ==========================================
 * 
 * Prueba todas las funcionalidades del sistema de favoritos:
 * - Obtener favoritos (vacío inicial)
 * - Agregar productos a favoritos
 * - Verificar estado de favorito 
 * - Obtener lista de favoritos con productos
 * - Eliminar productos de favoritos
 * - Validaciones y casos de error
 * 
 * Uso: node scripts/tests/test-favorites.js
 */

import { BaseAPITester } from './test-utils.js';

class FavoritesTester extends BaseAPITester {
  constructor() {
    super('favorites'); // Pasar el nombre del módulo al constructor base
    this.routeName = 'FAVORITOS';
    this.routeEndpoint = '/favorites';
    this.routeEmoji = '❤️';
  }

  async runTests() {
    await this.setupAuth();
    
    // Obtener productos disponibles para pruebas
    await this.test('Obtener productos para testing', async () => {
      const response = await this.apiCall('/products?limit=10');
      
      if (!response.ok || !response.data.products?.length) {
        this.log('⚠️  No hay productos disponibles para testing', 'yellow');
        return false;
      }
      
      this.testData.products = response.data.products;
      this.log(`📦 ${this.testData.products.length} productos disponibles`, 'dim');
      return true;
    });

    // 1. Obtener favoritos iniciales (vacío)
    await this.test('Obtener favoritos iniciales', async () => {
      const response = await this.apiCall('/favorites');
      
      if (!response.ok) {
        this.log(`❌ Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }
      
      this.log(`📋 Favoritos iniciales: ${response.data.favorites?.length || 0}`, 'dim');
      return true;
    });

    if (this.testData.products.length === 0) {
      this.log('❌ No se pueden ejecutar más pruebas sin productos', 'red');
      return this.printStats();
    }

    const testProductId = this.testData.products[0].id;
    const testProductName = this.testData.products[0].nombre;

    // 2. Verificar estado inicial de favorito (debe ser false)
    await this.test('Verificar estado inicial de favorito', async () => {
      const response = await this.apiCall(`/favorites/status/${testProductId}`);
      
      if (!response.ok) {
        this.log(`❌ Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }
      
      const isFavorite = response.data.isFavorite;
      this.log(`🔍 Producto ${testProductId} favorito: ${isFavorite ? 'SÍ' : 'NO'}`, 'dim');
      return !isFavorite; // Debe ser false inicialmente
    });

    // 3. Agregar producto a favoritos
    await this.test('Agregar producto a favoritos', async () => {
      const response = await this.apiCall('/favorites', {
        method: 'POST',
        body: JSON.stringify({
          productId: testProductId
        })
      });
      
      if (!response.ok) {
        this.log(`❌ Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }
      
      this.testData.favoriteId = response.data.favorite?.id;
      this.log(`✅ Producto "${testProductName}" agregado a favoritos`, 'dim');
      return true;
    });

    // 4. Verificar que ahora sí es favorito
    await this.test('Verificar estado después de agregar', async () => {
      const response = await this.apiCall(`/favorites/status/${testProductId}`);
      
      if (!response.ok) {
        this.log(`❌ Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }
      
      const isFavorite = response.data.isFavorite;
      this.log(`🔍 Estado actualizado: ${isFavorite ? 'ES favorito' : 'NO es favorito'}`, 'dim');
      return isFavorite === true;
    });

    // 5. Intentar agregar el mismo producto otra vez (debe fallar)
    await this.test('Intentar agregar producto duplicado', async () => {
      const response = await this.apiCall('/favorites', {
        method: 'POST',
        body: JSON.stringify({
          productId: testProductId
        })
      });
      
      if (response.ok) {
        this.log(`❌ Debería haber fallado al agregar duplicado`, 'red');
        return false;
      }
      
      if (response.status === 409) {
        this.log(`✅ Error 409 correcto: ${response.data?.message || 'Ya en favoritos'}`, 'dim');
        return true;
      }
      
      this.log(`❌ Error inesperado: ${response.status} - ${response.data?.error}`, 'red');
      return false;
    });

    // 6. Obtener lista de favoritos (debe contener 1 producto)
    await this.test('Obtener lista de favoritos', async () => {
      const response = await this.apiCall('/favorites');
      
      if (!response.ok) {
        this.log(`❌ Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }
      
      const favorites = response.data.favorites || [];
      const hasOurProduct = favorites.some(fav => fav.producto_id === testProductId);
      
      this.log(`📋 Favoritos encontrados: ${favorites.length}`, 'dim');
      this.log(`🔍 Nuestro producto está: ${hasOurProduct ? 'SÍ' : 'NO'}`, 'dim');
      
      return favorites.length > 0 && hasOurProduct;
    });

    // 7. Probar paginación
    await this.test('Probar paginación de favoritos', async () => {
      const response = await this.apiCall('/favorites?page=1&limit=5');
      
      if (!response.ok) {
        this.log(`❌ Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }
      
      const pagination = response.data.pagination;
      this.log(`📄 Página: ${pagination?.currentPage}, Total: ${pagination?.totalItems}`, 'dim');
      return true;
    });

    // 8. Agregar un segundo producto si está disponible
    if (this.testData.products.length > 1) {
      const secondProductId = this.testData.products[1].id;
      const secondProductName = this.testData.products[1].nombre;
      
      await this.test('Agregar segundo producto a favoritos', async () => {
        const response = await this.apiCall('/favorites', {
          method: 'POST',
          body: JSON.stringify({
            productId: secondProductId
          })
        });
        
        if (!response.ok) {
          this.log(`❌ Error: ${response.data?.error || 'Unknown error'}`, 'red');
          return false;
        }
        
        this.log(`✅ Segundo producto "${secondProductName}" agregado`, 'dim');
        return true;
      });
    }

    // 9. Eliminar primer producto de favoritos
    await this.test('Eliminar producto de favoritos', async () => {
      const response = await this.apiCall(`/favorites/${testProductId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        this.log(`❌ Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }
      
      this.log(`🗑️ Producto "${testProductName}" eliminado de favoritos`, 'dim');
      return true;
    });

    // 10. Verificar que ya no es favorito
    await this.test('Verificar estado después de eliminar', async () => {
      const response = await this.apiCall(`/favorites/status/${testProductId}`);
      
      if (!response.ok) {
        this.log(`❌ Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }
      
      const isFavorite = response.data.isFavorite;
      this.log(`🔍 Estado final: ${isFavorite ? 'ES favorito' : 'NO es favorito'}`, 'dim');
      return isFavorite === false;
    });

    // 11. Intentar eliminar producto que ya no está en favoritos
    await this.test('Intentar eliminar producto no favorito', async () => {
      const response = await this.apiCall(`/favorites/${testProductId}`, {
        method: 'DELETE'
      });
      
      // Esto podría ser éxito (idempotente) o error 404, ambos son válidos
      if (response.ok) {
        this.log(`✅ Eliminación idempotente exitosa`, 'dim');
        return true;
      }
      
      if (response.status === 404) {
        this.log(`✅ Error 404 correcto: producto no en favoritos`, 'dim');
        return true;
      }
      
      this.log(`❌ Error inesperado: ${response.status}`, 'red');
      return false;
    });

    // 12. Probar con producto inexistente
    await this.test('Verificar producto inexistente', async () => {
      const fakeProductId = 999999;
      const response = await this.apiCall(`/favorites/status/${fakeProductId}`);
      
      // Debería devolver 404 o isFavorite: false
      if (response.ok && response.data.isFavorite === false) {
        this.log(`✅ Producto inexistente manejado correctamente`, 'dim');
        return true;
      }
      
      if (response.status === 404) {
        this.log(`✅ Error 404 correcto para producto inexistente`, 'dim');
        return true;
      }
      
      this.log(`❌ Respuesta inesperada para producto inexistente`, 'red');
      return false;
    });

    // 13. Probar agregar producto inexistente
    await this.test('Agregar producto inexistente', async () => {
      const fakeProductId = 999999;
      const response = await this.apiCall('/favorites', {
        method: 'POST',
        body: JSON.stringify({
          productId: fakeProductId
        })
      });
      
      if (response.status === 404) {
        this.log(`✅ Error 404 correcto: producto no encontrado`, 'dim');
        return true;
      }
      
      if (!response.ok) {
        this.log(`✅ Error manejado: ${response.data?.error}`, 'dim');
        return true;
      }
      
      this.log(`❌ Debería haber fallado con producto inexistente`, 'red');
      return false;
    });

    // 14. Probar validación de datos
    await this.test('Validación de datos inválidos', async () => {
      const response = await this.apiCall('/favorites', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'invalid'
        })
      });
      
      if (response.status === 400) {
        this.log(`✅ Error 400 correcto: datos inválidos`, 'dim');
        return true;
      }
      
      if (!response.ok) {
        this.log(`✅ Error de validación: ${response.data?.error}`, 'dim');
        return true;
      }
      
      this.log(`❌ Debería haber fallado con datos inválidos`, 'red');
      return false;
    });

    return this.printStats();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new FavoritesTester();
  tester.runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export { FavoritesTester };
