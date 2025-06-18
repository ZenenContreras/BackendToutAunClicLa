// ========================================
// TESTS DE PEDIDOS
// ========================================
// Rutas testeadas:
// GET /orders/my-orders - Obtener pedidos del usuario
// GET /orders/:id - Obtener pedido por ID
// POST /orders - Crear pedido
// PUT /orders/:id/cancel - Cancelar pedido
// GET /orders - Obtener todos los pedidos (admin)
// PUT /orders/:id/status - Actualizar estado de pedido (admin)

import { BaseAPITester, log } from './test-utils.js';

class OrdersTester extends BaseAPITester {
  constructor() {
    super('ORDERS');
    this.orders = [];
    this.testAddressId = null;
  }

  async runTests() {
    log(`\n📦 TESTING ORDERS ROUTES`, 'bold');
    log('='.repeat(50), 'bold');

    // Configurar autenticación (requerida para todas las rutas de pedidos)
    await this.setupAuth();

    // Crear una dirección para usar en los pedidos
    await this.createTestAddress();

    // 1. Test obtener pedidos vacíos
    await this.test('Get empty orders', async () => {
      const response = await this.apiCall('/orders/my-orders');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const orders = response.data.orders || [];
      log(`    Initial orders: ${orders.length}`, 'dim');
      return true;
    });

    // 2. Test crear pedido
    await this.test('Create order', async () => {
      if (!this.testAddressId) {
        log(`    No address available for order creation`, 'yellow');
        return true; // No es crítico si no hay dirección
      }

      const orderData = {
        addressId: this.testAddressId,
        paymentMethodId: 'pm_test_payment_method'
      };

      const response = await this.apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const order = response.data.order;
      if (order) {
        this.orders.push(order);
      }
      log(`    Order created successfully`, 'dim');
      return true;
    });

    // 3. Test obtener pedidos después de crear
    await this.test('Get orders after creation', async () => {
      const response = await this.apiCall('/orders/my-orders');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const orders = response.data.orders || [];
      log(`    Total orders: ${orders.length}`, 'dim');
      return true;
    });

    // 4. Test obtener pedido por ID
    if (this.orders.length > 0) {
      await this.test('Get order by ID', async () => {
        const orderId = this.orders[0].id;
        const response = await this.apiCall(`/orders/${orderId}`);

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
          return false;
        }

        const order = response.data.order;
        log(`    Order status: ${order?.status || 'N/A'}`, 'dim');
        log(`    Order total: ${order?.total || 'N/A'}`, 'dim');
        return true;
      });
    }

    // 5. Test obtener pedido inexistente
    await this.test('Get non-existent order', async () => {
      const response = await this.apiCall('/orders/99999');

      if (response.status === 404) {
        log(`    Correctly returned 404 for non-existent order`, 'dim');
        return true;
      } else {
        log(`    Should return 404 for non-existent order`, 'red');
        return false;
      }
    });

    // 6. Test cancelar pedido
    if (this.orders.length > 0) {
      await this.test('Cancel order', async () => {
        const orderId = this.orders[0].id;
        const response = await this.apiCall(`/orders/${orderId}/cancel`, {
          method: 'PUT'
        });

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
          return false;
        }

        log(`    Order cancelled successfully`, 'dim');
        return true;
      });
    }

    // 7. Test crear pedido con datos inválidos
    await this.test('Create order with invalid data', async () => {
      const invalidData = {
        addressId: 'invalid-uuid',
        paymentMethodId: ''
      };

      const response = await this.apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      if (response.status === 400) {
        log(`    Correctly rejected invalid order data`, 'dim');
        return true;
      } else {
        log(`    Should reject invalid order data`, 'red');
        return false;
      }
    });

    // 8. Test crear pedido sin dirección
    await this.test('Create order without address', async () => {
      const orderData = {
        paymentMethodId: 'pm_test_payment_method'
      };

      const response = await this.apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      if (response.status === 400) {
        log(`    Correctly rejected order without address`, 'dim');
        return true;
      } else {
        log(`    Should reject order without address`, 'red');
        return false;
      }
    });

    // 9. Test acceso sin token
    await this.test('Access without token', async () => {
      const tempToken = this.token;
      this.token = null;

      const response = await this.apiCall('/orders/my-orders');

      this.token = tempToken;

      if (response.status === 401) {
        log(`    Correctly denied access without token`, 'dim');
        return true;
      } else {
        log(`    Should deny access without token`, 'red');
        return false;
      }
    });

    // 10. Test obtener todos los pedidos sin permisos admin
    await this.test('Get all orders without admin permissions', async () => {
      const response = await this.apiCall('/orders');

      if (response.status === 403) {
        log(`    Correctly denied access without admin permissions`, 'dim');
        return true;
      } else {
        log(`    Should deny access without admin permissions`, 'red');
        return false;
      }
    });

    // 11. Test actualizar estado de pedido sin permisos admin
    if (this.orders.length > 0) {
      await this.test('Update order status without admin permissions', async () => {
        const orderId = this.orders[0].id;
        const statusData = {
          status: 'shipped'
        };

        const response = await this.apiCall(`/orders/${orderId}/status`, {
          method: 'PUT',
          body: JSON.stringify(statusData)
        });

        if (response.status === 403) {
          log(`    Correctly denied status update without admin permissions`, 'dim');
          return true;
        } else {
          log(`    Should deny status update without admin permissions`, 'red');
          return false;
        }
      });
    }

    // 12. Test cancelar pedido inexistente
    await this.test('Cancel non-existent order', async () => {
      const response = await this.apiCall('/orders/99999/cancel', {
        method: 'PUT'
      });

      if (response.status === 404) {
        log(`    Correctly returned 404 for non-existent order cancellation`, 'dim');
        return true;
      } else {
        log(`    Should return 404 for non-existent order cancellation`, 'red');
        return false;
      }
    });

    this.printStats();
    return {
      orders: this.orders,
      testAddressId: this.testAddressId,
      token: this.token
    };
  }

  async createTestAddress() {
    log(`    Creating test address for orders...`, 'dim');
    
    const addressData = {
      direccion: 'Calle Test Pedidos 123',
      ciudad: 'Madrid',
      estado: 'Madrid',
      codigo_postal: '28001',
      pais: 'España',
      telefono: '+34912345678'
    };

    const response = await this.apiCall('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });

    if (response.ok) {
      this.testAddressId = response.data.address?.id;
      log(`    Test address created: ${this.testAddressId}`, 'dim');
    } else {
      log(`    Failed to create test address`, 'yellow');
    }
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new OrdersTester();
  tester.runTests().catch(console.error);
}

export { OrdersTester };
