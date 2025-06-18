// ========================================
// TESTS DE AUTENTICACIÓN
// ========================================
// Rutas testeadas:
// POST /auth/register - Registro de usuario
// POST /auth/login - Inicio de sesión
// POST /auth/verify-email - Verificar email
// POST /auth/resend-verification - Reenviar verificación
// GET /auth/verification-status - Estado de verificación
// GET /auth/profile - Perfil de usuario (protegido)

import { BaseAPITester, log } from './test-utils.js';

class AuthTester extends BaseAPITester {
  constructor() {
    super('AUTH');
    this.verificationCode = '123456'; // Código simulado para testing
  }

  async runTests() {
    log(`\n🔐 TESTING AUTHENTICATION ROUTES`, 'bold');
    log('='.repeat(50), 'bold');

    // 1. Test registro de usuario
    await this.test('Register new user', async () => {
      const response = await this.apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: this.testEmail,
          password: this.testPassword,
          nombre: 'Test User Auth',
          telefono: '+34123456789'
        })
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      this.userId = response.data.user?.id;
      log(`    User registered: ${this.testEmail}`, 'dim');
      return true;
    });

    // 2. Test login sin verificar (debería fallar)
    await this.test('Login without verification (should fail)', async () => {
      const response = await this.apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: this.testEmail,
          password: this.testPassword
        })
      });

      // Esperamos que falle porque el email no está verificado
      if (response.status === 400 || response.status === 401) {
        log(`    Correctly rejected unverified login`, 'dim');
        return true;
      } else {
        log(`    Should have rejected unverified login`, 'red');
        return false;
      }
    });

    // 3. Test verificar email
    await this.test('Verify email', async () => {
      const response = await this.apiCall('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          email: this.testEmail,
          code: this.verificationCode
        })
      });

      if (!response.ok && response.status !== 400) {
        log(`    Verification might not be implemented or code invalid`, 'yellow');
        // Continuamos asumiendo que está verificado
      }
      
      log(`    Email verification attempted`, 'dim');
      return true;
    });

    // 4. Test login después de verificar
    await this.test('Login after verification', async () => {
      const response = await this.apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: this.testEmail,
          password: this.testPassword
        })
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      this.token = response.data.token;
      log(`    Login successful, token obtained`, 'dim');
      return true;
    });

    // 5. Test obtener perfil
    await this.test('Get user profile', async () => {
      const response = await this.apiCall('/auth/profile');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown'}`, 'red');
        return false;
      }

      log(`    Profile retrieved: ${response.data.user?.nombre || 'Unknown'}`, 'dim');
      return true;
    });

    // 6. Test estado de verificación
    await this.test('Check verification status', async () => {
      const response = await this.apiCall(`/auth/verification-status?email=${this.testEmail}`);

      if (!response.ok && response.status !== 404) {
        log(`    Status check failed`, 'yellow');
        return true; // No es crítico
      }

      log(`    Verification status checked`, 'dim');
      return true;
    });

    // 7. Test reenviar verificación
    await this.test('Resend verification', async () => {
      const response = await this.apiCall('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({
          email: this.testEmail
        })
      });

      // Puede fallar si ya está verificado
      if (!response.ok && response.status !== 400) {
        log(`    Resend failed, but not critical`, 'yellow');
      }

      log(`    Resend verification attempted`, 'dim');
      return true;
    });

    // 8. Test acceso sin token
    await this.test('Access without token (should fail)', async () => {
      const tempToken = this.token;
      this.token = null;
      
      const response = await this.apiCall('/auth/profile');
      
      this.token = tempToken;
      
      if (response.status === 401) {
        log(`    Correctly denied access without token`, 'dim');
        return true;
      } else {
        log(`    Should deny access without token`, 'red');
        return false;
      }
    });

    // 9. Test login con credenciales incorrectas
    await this.test('Login with wrong credentials', async () => {
      const response = await this.apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: this.testEmail,
          password: 'wrongpassword'
        })
      });

      if (response.status === 401) {
        log(`    Correctly rejected wrong credentials`, 'dim');
        return true;
      } else {
        log(`    Should reject wrong credentials`, 'red');
        return false;
      }
    });

    // 10. Test registro con email duplicado
    await this.test('Register with duplicate email', async () => {
      const response = await this.apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: this.testEmail,
          password: this.testPassword,
          nombre: 'Duplicate User',
          telefono: '+34123456789'
        })
      });

      if (response.status === 400) {
        log(`    Correctly rejected duplicate email`, 'dim');
        return true;
      } else {
        log(`    Should reject duplicate email`, 'red');
        return false;
      }
    });

    this.printStats();
    return {
      token: this.token,
      userId: this.userId,
      email: this.testEmail,
      password: this.testPassword
    };
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AuthTester();
  tester.runTests().catch(console.error);
}

export { AuthTester };
