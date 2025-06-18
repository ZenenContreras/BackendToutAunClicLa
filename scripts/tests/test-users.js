// ========================================
// TESTS DE USUARIOS
// ========================================
// Rutas testeadas:
// PUT /users/profile - Actualizar perfil
// PUT /users/password - Cambiar contraseña
// DELETE /users/account - Eliminar cuenta
// GET /users - Obtener todos los usuarios (admin)
// PUT /users/:id/status - Actualizar estado de usuario (admin)

import { BaseAPITester, log } from './test-utils.js';

class UsersTester extends BaseAPITester {
  constructor() {
    super('USERS');
    this.originalPassword = 'TestPassword123!';
    this.newPassword = 'NewPassword456!';
  }

  async runTests() {
    log(`\n👤 TESTING USERS ROUTES`, 'bold');
    log('='.repeat(50), 'bold');

    // Configurar autenticación (requerida para todas las rutas de usuarios)
    await this.setupAuth();

    // 1. Test actualizar perfil
    await this.test('Update user profile', async () => {
      const updateData = {
        nombre: 'Usuario de Prueba Actualizado',
        telefono: '+34987654321',
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      const response = await this.apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      log(`    Profile updated successfully`, 'dim');
      return true;
    });

    // 2. Test actualizar perfil con datos inválidos
    await this.test('Update profile with invalid data', async () => {
      const invalidData = {
        nombre: '', // Nombre vacío
        telefono: '+34987654321'
      };

      const response = await this.apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(invalidData)
      });

      if (response.status === 400) {
        log(`    Correctly rejected invalid profile data`, 'dim');
        return true;
      } else {
        log(`    Should reject invalid profile data`, 'red');
        return false;
      }
    });

    // 3. Test cambiar contraseña
    await this.test('Change password', async () => {
      const passwordData = {
        currentPassword: this.originalPassword,
        newPassword: this.newPassword
      };

      const response = await this.apiCall('/users/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      log(`    Password changed successfully`, 'dim');
      return true;
    });

    // 4. Test cambiar contraseña con contraseña actual incorrecta
    await this.test('Change password with wrong current password', async () => {
      const wrongPasswordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'anothernewpassword123'
      };

      const response = await this.apiCall('/users/password', {
        method: 'PUT',
        body: JSON.stringify(wrongPasswordData)
      });

      if (response.status === 400 || response.status === 401) {
        log(`    Correctly rejected wrong current password`, 'dim');
        return true;
      } else {
        log(`    Should reject wrong current password`, 'red');
        return false;
      }
    });

    // 5. Test obtener todos los usuarios sin permisos admin
    await this.test('Get all users without admin permissions', async () => {
      const response = await this.apiCall('/users');

      if (response.status === 403) {
        log(`    Correctly denied access without admin permissions`, 'dim');
        return true;
      } else {
        log(`    Should deny access without admin permissions`, 'red');
        return false;
      }
    });

    // 6. Test actualizar estado de usuario sin permisos admin
    await this.test('Update user status without admin permissions', async () => {
      const statusData = {
        blocked: true,
        reason: 'Test de bloqueo'
      };

      const response = await this.apiCall(`/users/${this.userId}/status`, {
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

    // 7. Test acceso sin token
    await this.test('Access without token', async () => {
      const tempToken = this.token;
      this.token = null;

      const updateData = {
        nombre: 'Test sin token'
      };

      const response = await this.apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      this.token = tempToken;

      if (response.status === 401) {
        log(`    Correctly denied access without token`, 'dim');
        return true;
      } else {
        log(`    Should deny access without token`, 'red');
        return false;
      }
    });

    // 8. Test validación de cambio de contraseña
    await this.test('Change password with invalid data', async () => {
      const invalidPasswordData = {
        currentPassword: this.newPassword,
        newPassword: '123' // Contraseña muy corta
      };

      const response = await this.apiCall('/users/password', {
        method: 'PUT',
        body: JSON.stringify(invalidPasswordData)
      });

      if (response.status === 400) {
        log(`    Correctly rejected weak password`, 'dim');
        return true;
      } else {
        log(`    Should reject weak password`, 'red');
        return false;
      }
    });

    // 9. Test eliminar cuenta con contraseña incorrecta
    await this.test('Delete account with wrong password', async () => {
      const deleteData = {
        password: 'wrongpassword'
      };

      const response = await this.apiCall('/users/account', {
        method: 'DELETE',
        body: JSON.stringify(deleteData)
      });

      if (response.status === 400 || response.status === 401) {
        log(`    Correctly rejected deletion with wrong password`, 'dim');
        return true;
      } else {
        log(`    Should reject deletion with wrong password`, 'red');
        return false;
      }
    });

    // 10. Test eliminar cuenta (último test, ya que elimina el usuario)
    await this.test('Delete user account', async () => {
      const deleteData = {
        password: this.newPassword // Usar la nueva contraseña
      };

      const response = await this.apiCall('/users/account', {
        method: 'DELETE',
        body: JSON.stringify(deleteData)
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      log(`    Account deleted successfully`, 'dim');
      return true;
    });

    // 11. Test usar token después de eliminar cuenta
    await this.test('Use token after account deletion', async () => {
      const updateData = {
        nombre: 'Test después de eliminar'
      };

      const response = await this.apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.status === 401) {
        log(`    Token correctly invalidated after account deletion`, 'dim');
        return true;
      } else {
        log(`    Token should be invalidated after account deletion`, 'red');
        return false;
      }
    });

    this.printStats();
    return {
      token: this.token,
      userId: this.userId
    };
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new UsersTester();
  tester.runTests().catch(console.error);
}

export { UsersTester };
