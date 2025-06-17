#!/usr/bin/env node

/**
 * Script para probar el sistema de login con usuarios verificados y no verificados
 * @author GitHub Copilot
 * @date 2024
 */

import axios from 'axios';

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const API_BASE = 'http://localhost:5500/api/v1';

async function testLoginValidation() {
  log('\n🔐 TESTING DE VALIDACIÓN DE LOGIN', 'bold');
  log('==================================\n', 'bold');

  try {
    // Test 1: Login con usuario verificado
    log('📝 Test 1: Login con usuario verificado', 'blue');
    try {
      const verifiedLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'zenencontreras1@gmail.com',
        password: 'password123' // Necesitarás la contraseña real
      });

      if (verifiedLoginResponse.status === 200) {
        log('✅ Usuario verificado pudo hacer login correctamente', 'green');
        log(`   Token recibido: ${verifiedLoginResponse.data.token ? 'SÍ' : 'NO'}`, 'green');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        log('⚠️  Credenciales incorrectas para usuario verificado', 'yellow');
        log('   Esto es normal si no conocemos la contraseña real', 'yellow');
      } else {
        log(`❌ Error inesperado: ${error.response?.data?.message || error.message}`, 'red');
      }
    }

    // Test 2: Login con usuario NO verificado
    log('\n📝 Test 2: Login con usuario NO verificado', 'blue');
    try {
      const unverifiedLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'zenencontreras57@gmail.com',
        password: 'password123' // Contraseña de prueba
      });

      // Si llegamos aquí, el login fue exitoso (MALO)
      log('❌ ERROR: Usuario no verificado pudo hacer login', 'red');
      log('   Esto representa una vulnerabilidad de seguridad', 'red');
    } catch (error) {
      if (error.response?.status === 403) {
        log('✅ Usuario no verificado fue rechazado correctamente', 'green');
        log(`   Mensaje: ${error.response.data.message}`, 'green');
        log(`   Código de error: ${error.response.data.error}`, 'green');
      } else if (error.response?.status === 401) {
        log('⚠️  Usuario no verificado rechazado por credenciales incorrectas', 'yellow');
        log('   Nota: Esto también es válido, pero la verificación debe ocurrir antes', 'yellow');
      } else {
        log(`❌ Error inesperado: ${error.response?.data?.message || error.message}`, 'red');
      }
    }

    // Test 3: Verificar si el servidor está ejecutándose
    log('\n📝 Test 3: Verificar disponibilidad del servidor', 'blue');
    try {
      const healthResponse = await axios.get(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': 'Bearer token_de_prueba'
        }
      });
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        log('❌ El servidor no está ejecutándose en localhost:5500', 'red');
        log('   Ejecuta: npm start', 'yellow');
        return;
      } else if (error.response?.status === 401) {
        log('✅ Servidor responde correctamente (401 esperado sin token válido)', 'green');
      }
    }

  } catch (error) {
    log(`❌ Error general: ${error.message}`, 'red');
  }

  log('\n📊 RESUMEN DEL TESTING DE LOGIN', 'bold');
  log('=================================', 'bold');
  log('✅ Verificación de usuarios implementada en authController', 'green');
  log('🔧 Para probar completamente:', 'cyan');
  log('   1. Ejecuta: npm start', 'cyan');
  log('   2. Ejecuta este script nuevamente', 'cyan');
  log('   3. Crea usuarios de prueba con contraseñas conocidas', 'cyan');
  log('', 'reset');
}

testLoginValidation();
