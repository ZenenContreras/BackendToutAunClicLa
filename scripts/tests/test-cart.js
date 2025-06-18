// ========================================
// TESTS DE CARRITO
// ========================================
// Rutas testeadas:
// GET /cart - Obtener carrito
// GET /cart/with-coupon - Obtener carrito con cupón
// POST /cart/items - Agregar item al carrito
// PUT /cart/items/:id - Actualizar item del carrito
// DELETE /cart/items/:id - Eliminar item del carrito
// POST /cart/apply-coupon - Aplicar cupón
// DELETE /cart - Limpiar carrito

import { BaseAPITester, log } from './test-utils.js';

class CartTester extends BaseAPITester {
  constructor() {
    super('CART');
    this.cartItems = [];
    this.products = [];
  }

  async runTests() {
    log(`\n🛒 TESTING CART ROUTES`, 'bold');
    log('='.repeat(50), 'bold');

    // Configurar autenticación (requerida para todas las rutas de carrito)
    await this.setupAuth();

    // Obtener productos disponibles para usar en el carrito
    const productsResponse = await this.apiCall('/products');
    if (productsResponse.ok) {
      this.products = productsResponse.data.products || [];
    }

    // 1. Test obtener carrito vacío
    await this.test('Get empty cart', async () => {
      const response = await this.apiCall('/cart');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const items = response.data.items || response.data.cartItems || [];
      log(`    Initial cart items: ${items.length}`, 'dim');
      log(`    Initial total: ${response.data.total || 0}`, 'dim');
      return true;
    });

    // 2. Test agregar item al carrito
    await this.test('Add item to cart', async () => {
      const productId = this.products.length > 0 ? this.products[0].id : 1;
      const cartItemData = {
        productId: productId,
        quantity: 2,
        size: 'M',
        color: 'Azul'
      };

      const response = await this.apiCall('/cart/items', {
        method: 'POST',
        body: JSON.stringify(cartItemData)
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const item = response.data.item || response.data.cartItem;
      if (item) {
        this.cartItems.push(item);
      }
      log(`    Item added to cart`, 'dim');
      return true;
    });

    // 3. Test agregar segundo item
    await this.test('Add second item to cart', async () => {
      const productId = this.products.length > 1 ? this.products[1].id : 2;
      const cartItemData = {
        productId: productId,
        quantity: 1,
        size: 'L',
        color: 'Rojo'
      };

      const response = await this.apiCall('/cart/items', {
        method: 'POST',
        body: JSON.stringify(cartItemData)
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const item = response.data.item || response.data.cartItem;
      if (item) {
        this.cartItems.push(item);
      }
      log(`    Second item added to cart`, 'dim');
      return true;
    });

    // 4. Test obtener carrito con items
    await this.test('Get cart with items', async () => {
      const response = await this.apiCall('/cart');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const items = response.data.items || response.data.cartItems || [];
      log(`    Cart items: ${items.length}`, 'dim');
      log(`    Cart total: ${response.data.total || 0}`, 'dim');
      return true;
    });

    // 5. Test actualizar item del carrito
    if (this.cartItems.length > 0) {
      await this.test('Update cart item', async () => {
        const itemId = this.cartItems[0].id;
        const updateData = {
          quantity: 5,
          size: 'XL',
          color: 'Verde'
        };

        const response = await this.apiCall(`/cart/items/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
          return false;
        }

        log(`    Cart item updated`, 'dim');
        return true;
      });
    }

    // 6. Test aplicar cupón
    await this.test('Apply coupon', async () => {
      const couponData = {
        code: 'DESCUENTO10'
      };

      const response = await this.apiCall('/cart/apply-coupon', {
        method: 'POST',
        body: JSON.stringify(couponData)
      });

      // Puede fallar si el cupón no existe, lo cual es normal
      if (response.status === 400 || response.status === 404) {
        log(`    Coupon not found (expected for test)`, 'dim');
        return true;
      } else if (response.ok) {
        log(`    Coupon applied successfully`, 'dim');
        return true;
      } else {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }
    });

    // 7. Test obtener carrito con cupón
    await this.test('Get cart with coupon', async () => {
      const response = await this.apiCall('/cart/with-coupon');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const coupon = response.data.appliedCoupon;
      log(`    Applied coupon: ${coupon?.code || 'None'}`, 'dim');
      log(`    Total with discount: ${response.data.totalWithDiscount || 'N/A'}`, 'dim');
      return true;
    });

    // 8. Test agregar item con datos inválidos
    await this.test('Add item with invalid data', async () => {
      const invalidData = {
        productId: 'invalid',
        quantity: -1
      };

      const response = await this.apiCall('/cart/items', {
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

    // 9. Test acceso sin token
    await this.test('Access without token', async () => {
      const tempToken = this.token;
      this.token = null;

      const response = await this.apiCall('/cart');

      this.token = tempToken;

      if (response.status === 401) {
        log(`    Correctly denied access without token`, 'dim');
        return true;
      } else {
        log(`    Should deny access without token`, 'red');
        return false;
      }
    });

    // 10. Test eliminar item del carrito
    if (this.cartItems.length > 0) {
      await this.test('Remove cart item', async () => {
        const itemId = this.cartItems[0].id;
        const response = await this.apiCall(`/cart/items/${itemId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
          return false;
        }

        log(`    Cart item removed`, 'dim');
        return true;
      });
    }

    // 11. Test limpiar carrito
    await this.test('Clear cart', async () => {
      const response = await this.apiCall('/cart', {
        method: 'DELETE'
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      log(`    Cart cleared`, 'dim');
      return true;
    });

    // 12. Test verificar carrito vacío después de limpiar
    await this.test('Verify empty cart after clear', async () => {
      const response = await this.apiCall('/cart');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const items = response.data.items || response.data.cartItems || [];
      if (items.length === 0) {
        log(`    Cart is empty after clear`, 'dim');
        return true;
      } else {
        log(`    Cart should be empty after clear`, 'red');
        return false;
      }
    });

    this.printStats();
    return {
      cartItems: this.cartItems,
      token: this.token
    };
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new CartTester();
  tester.runTests().catch(console.error);
}

export { CartTester };
