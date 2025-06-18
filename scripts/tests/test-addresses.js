// ========================================
// TESTS DE DIRECCIONES
// ========================================
// Rutas testeadas:
// GET /addresses - Obtener direcciones del usuario
// POST /addresses - Crear nueva dirección
// PUT /addresses/:id - Actualizar dirección
// DELETE /addresses/:id - Eliminar dirección

import { BaseAPITester, log } from './test-utils.js';

class AddressesTester extends BaseAPITester {
  constructor() {
    super('ADDRESSES');
    this.addresses = [];
  }

  async runTests() {
    log(`\n🏠 TESTING ADDRESSES ROUTES`, 'bold');
    log('='.repeat(50), 'bold');

    // Configurar autenticación (requerida para todas las rutas de direcciones)
    await this.setupAuth();

    // 1. Test obtener direcciones vacías
    await this.test('Get empty addresses', async () => {
      const response = await this.apiCall('/addresses');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      this.addresses = response.data.addresses || [];
      log(`    Initial addresses: ${this.addresses.length}`, 'dim');
      return true;
    });

    // 2. Test crear dirección (formato DB)
    await this.test('Create address (DB format)', async () => {
      const addressData = {
        direccion: 'Calle Test 123',
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

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      this.addresses.push(response.data.address);
      log(`    Address created with DB format`, 'dim');
      return true;
    });

    // 3. Test crear dirección (formato Frontend)
    await this.test('Create address (Frontend format)', async () => {
      const addressData = {
        address: 'Frontend Street 456',
        city: 'Barcelona',
        state: 'Barcelona',
        postalCode: '08001',
        country: 'España',
        phone: '+34987654321'
      };

      const response = await this.apiCall('/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData)
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      this.addresses.push(response.data.address);
      log(`    Address created with Frontend format`, 'dim');
      return true;
    });

    // 4. Test obtener todas las direcciones
    await this.test('Get all addresses', async () => {
      const response = await this.apiCall('/addresses');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      const addresses = response.data.addresses || [];
      log(`    Total addresses: ${addresses.length}`, 'dim');

      // Verificar formato de respuesta compatible
      if (addresses.length > 0) {
        const addr = addresses[0];
        const hasDBFormat = addr.direccion && addr.ciudad;
        const hasFrontendFormat = addr.address && addr.city;
        
        if (hasDBFormat && hasFrontendFormat) {
          log(`    Response format is compatible (DB + Frontend)`, 'dim');
        }
      }

      return true;
    });

    // 5. Test actualizar dirección
    if (this.addresses.length > 0) {
      await this.test('Update address', async () => {
        const addressId = this.addresses[0].id;
        const updateData = {
          direccion: 'Calle Actualizada 789',
          ciudad: 'Valencia',
          estado: 'Valencia',
          codigo_postal: '46001',
          pais: 'España',
          telefono: '+34666777888'
        };

        const response = await this.apiCall(`/addresses/${addressId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
          return false;
        }

        log(`    Address updated successfully`, 'dim');
        return true;
      });
    }

    // 6. Test actualizar dirección inexistente
    await this.test('Update non-existent address', async () => {
      const updateData = {
        direccion: 'Calle Falsa 123'
      };

      const response = await this.apiCall('/addresses/99999', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.status === 404) {
        log(`    Correctly returned 404 for non-existent address`, 'dim');
        return true;
      } else {
        log(`    Should return 404 for non-existent address`, 'red');
        return false;
      }
    });

    // 7. Test validación de campos requeridos
    await this.test('Create address with missing fields', async () => {
      const invalidData = {
        direccion: 'Solo dirección' // Faltan campos requeridos
      };

      const response = await this.apiCall('/addresses', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      if (response.status === 400) {
        log(`    Correctly rejected incomplete data`, 'dim');
        return true;
      } else {
        log(`    Should reject incomplete data`, 'red');
        return false;
      }
    });

    // 8. Test acceso sin token
    await this.test('Access without token', async () => {
      const tempToken = this.token;
      this.token = null;

      const response = await this.apiCall('/addresses');

      this.token = tempToken;

      if (response.status === 401) {
        log(`    Correctly denied access without token`, 'dim');
        return true;
      } else {
        log(`    Should deny access without token`, 'red');
        return false;
      }
    });

    // 9. Test eliminar dirección
    if (this.addresses.length > 0) {
      await this.test('Delete address', async () => {
        const addressId = this.addresses[0].id;
        const response = await this.apiCall(`/addresses/${addressId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
          return false;
        }

        log(`    Address deleted successfully`, 'dim');
        return true;
      });
    }

    // 10. Test eliminar dirección inexistente
    await this.test('Delete non-existent address', async () => {
      const response = await this.apiCall('/addresses/99999', {
        method: 'DELETE'
      });

      if (response.status === 404) {
        log(`    Correctly returned 404 for non-existent address`, 'dim');
        return true;
      } else {
        log(`    Should return 404 for non-existent address`, 'red');
        return false;
      }
    });

    this.printStats();
    return {
      addresses: this.addresses,
      token: this.token
    };
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AddressesTester();
  tester.runTests().catch(console.error);
}

export { AddressesTester };
