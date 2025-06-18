// ========================================
// TESTS DE PRODUCTOS
// ========================================
// Rutas testeadas:
// GET /products - Obtener todos los productos (público)
// GET /products/:id - Obtener producto por ID (público)
// POST /products - Crear producto (admin)
// PUT /products/:id - Actualizar producto (admin)
// DELETE /products/:id - Eliminar producto (admin)

import { BaseAPITester, log } from './test-utils.js';

class ProductsTester extends BaseAPITester {
  constructor() {
    super('PRODUCTS');
    this.products = [];
  }

  async runTests() {
    log(`\n📦 TESTING PRODUCTS ROUTES`, 'bold');
    log('='.repeat(50), 'bold');

    // Configurar autenticación para tests que la requieren
    await this.setupAuth();

    // 1. Test obtener todos los productos (público)
    await this.test('Get all products (public)', async () => {
      const response = await this.apiCall('/products');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      this.products = response.data.products || [];
      log(`    Found ${this.products.length} products`, 'dim');
      return true;
    });

    // 2. Test obtener productos con paginación
    await this.test('Get products with pagination', async () => {
      const response = await this.apiCall('/products?page=1&limit=5');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const products = response.data.products || [];
      log(`    Paginated: ${products.length} products`, 'dim');
      return true;
    });

    // 3. Test búsqueda de productos
    await this.test('Search products', async () => {
      const response = await this.apiCall('/products?search=test&category=electronics');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const products = response.data.products || [];
      log(`    Search results: ${products.length} products`, 'dim');
      return true;
    });

    // 4. Test obtener producto por ID (si existen productos)
    if (this.products.length > 0) {
      await this.test('Get product by ID', async () => {
        const productId = this.products[0].id;
        const response = await this.apiCall(`/products/${productId}`);

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
          return false;
        }

        log(`    Product retrieved: ${response.data.product?.nombre || response.data.nombre || 'Unknown'}`, 'dim');
        return true;
      });
    }

    // 5. Test obtener producto inexistente
    await this.test('Get non-existent product', async () => {
      const response = await this.apiCall('/products/99999');

      if (response.status === 404) {
        log(`    Correctly returned 404 for non-existent product`, 'dim');
        return true;
      } else {
        log(`    Should return 404 for non-existent product`, 'red');
        return false;
      }
    });

    // 6. Test crear producto sin permisos admin
    await this.test('Create product without admin permissions', async () => {
      const productData = {
        nombre: 'Test Product',
        descripcion: 'Test Description',
        precio: 29.99,
        categoria: 'test',
        stock: 100,
        imagenes: ['https://example.com/image.jpg']
      };

      const response = await this.apiCall('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });

      if (response.status === 403 || response.status === 401) {
        log(`    Correctly denied creation without admin permissions`, 'dim');
        return true;
      } else {
        log(`    Should deny creation without admin permissions`, 'red');
        return false;
      }
    });

    // 7. Test crear producto sin autenticación
    await this.test('Create product without authentication', async () => {
      const tempToken = this.token;
      this.token = null;

      const productData = {
        nombre: 'Test Product',
        precio: 29.99
      };

      const response = await this.apiCall('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });

      this.token = tempToken;

      if (response.status === 401) {
        log(`    Correctly denied creation without authentication`, 'dim');
        return true;
      } else {
        log(`    Should deny creation without authentication`, 'red');
        return false;
      }
    });

    // 8. Test actualizar producto sin permisos admin
    await this.test('Update product without admin permissions', async () => {
      const updateData = {
        nombre: 'Updated Product',
        precio: 39.99
      };

      const productId = this.products.length > 0 ? this.products[0].id : 1;
      const response = await this.apiCall(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.status === 403 || response.status === 401) {
        log(`    Correctly denied update without admin permissions`, 'dim');
        return true;
      } else {
        log(`    Should deny update without admin permissions`, 'red');
        return false;
      }
    });

    // 9. Test eliminar producto sin permisos admin
    await this.test('Delete product without admin permissions', async () => {
      const productId = this.products.length > 0 ? this.products[0].id : 1;
      const response = await this.apiCall(`/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.status === 403 || response.status === 401) {
        log(`    Correctly denied deletion without admin permissions`, 'dim');
        return true;
      } else {
        log(`    Should deny deletion without admin permissions`, 'red');
        return false;
      }
    });

    // 10. Test validación de datos en creación
    await this.test('Create product with invalid data', async () => {
      const invalidData = {
        nombre: '', // Nombre vacío
        precio: -10 // Precio negativo
      };

      const response = await this.apiCall('/products', {
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

    this.printStats();
    return {
      products: this.products,
      token: this.token
    };
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ProductsTester();
  tester.runTests().catch(console.error);
}

export { ProductsTester };
