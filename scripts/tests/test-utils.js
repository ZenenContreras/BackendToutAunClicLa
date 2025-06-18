// ========================================
// UTILIDADES COMUNES PARA TESTING
// ========================================

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5500/api/v1';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Clase base para tests
class BaseAPITester {
  constructor(moduleName = 'generic') {
    this.moduleName = moduleName;
    this.token = null;
    this.testEmail = `test_${moduleName.toLowerCase()}_${Date.now()}@test.com`;
    this.testPassword = 'TestPassword123!';
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0
    };
    
    // Propiedades que se pueden sobrescribir después del constructor
    this.routeName = moduleName.toUpperCase();
    this.routeEndpoint = '/unknown';
    this.routeEmoji = '🧪';
    this.testData = {
      products: [],
      favorites: [],
      reviews: [],
      addresses: [],
      cartItems: [],
      orders: []
    };
  }

  async apiCall(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { message: 'No JSON response' };
      }

      return {
        ok: response.ok,
        status: response.status,
        data,
        response
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message,
        data: null
      };
    }
  }

  async test(description, testFunction) {
    this.stats.total++;
    process.stdout.write(`${colors.dim}  ${description}... ${colors.reset}`);

    try {
      const result = await testFunction();
      if (result === false) {
        log('❌ FAIL', 'red');
        this.stats.failed++;
        return false;
      } else {
        log('✅ PASS', 'green');
        this.stats.passed++;
        return true;
      }
    } catch (error) {
      log(`❌ ERROR: ${error.message}`, 'red');
      this.stats.failed++;
      return false;
    }
  }

  async setupAuth() {
    // 1. Registrar usuario
    const registerResponse = await this.apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: this.testEmail,
        password: this.testPassword,
        nombre: `Test User ${this.moduleName}`,
        telefono: '+34123456789'
      })
    });

    if (!registerResponse.ok) {
      throw new Error(`Failed to register: ${registerResponse.data?.error || 'Unknown error'}`);
    }

    // 2. Obtener código de verificación desde la base de datos
    // Importar supabase client si está disponible, sino usar un código fijo para testing
    let verificationCode = '123456'; // Código por defecto

    try {
      // Intentar importar supabase para obtener el código real
      const { supabaseAdmin } = await import('../../src/config/supabase.js');
      const { data: user } = await supabaseAdmin
        .from('usuarios')
        .select('token_verificacion_email')
        .eq('correo_electronico', this.testEmail)
        .single();

      if (user?.token_verificacion_email) {
        verificationCode = user.token_verificacion_email;
      }
    } catch (error) {
      // Si no se puede acceder a la BD, usar código por defecto
      log(`⚠️  Using default verification code: ${verificationCode}`, 'yellow');
    }

    // 3. Verificar email
    const verifyResponse = await this.apiCall('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        code: verificationCode
      })
    });

    if (!verifyResponse.ok) {
      throw new Error(`Failed to verify email: ${verifyResponse.data?.error || 'Unknown error'}`);
    }

    // 4. Login para obtener token
    const loginResponse = await this.apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: this.testEmail,
        password: this.testPassword
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Failed to login: ${loginResponse.data?.error || 'Unknown error'}`);
    }

    this.token = loginResponse.data.token;
    this.userId = loginResponse.data.user?.id;
    
    log(`🔑 Auth setup complete for ${this.testEmail}`, 'cyan');
    return true;
  }

  printStats() {
    const successRate = this.stats.total > 0 ? ((this.stats.passed / this.stats.total) * 100).toFixed(1) : 0;
    
    log(`\n📊 ${this.moduleName.toUpperCase()} TEST SUMMARY`, 'bold');
    log('='.repeat(40), 'dim');
    log(`✅ Passed: ${this.stats.passed}`, 'green');
    log(`❌ Failed: ${this.stats.failed}`, 'red');
    log(`📊 Total: ${this.stats.total}`, 'cyan');
    log(`🎯 Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
    
    return this.stats.failed === 0;
  }

  getStats() {
    return {
      total: this.stats.total,
      passed: this.stats.passed,
      failed: this.stats.failed,
      skipped: 0 // Podemos agregar esta funcionalidad después
    };
  }

  log(message, color = 'reset') {
    log(message, color);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export { BaseAPITester, API_BASE, colors, log };
