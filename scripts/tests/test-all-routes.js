#!/usr/bin/env node

/**
 * SCRIPT MAESTRO PARA EJECUTAR TODOS LOS TESTS
 * =============================================
 * 
 * Ejecuta todos los scripts de testing de forma secuencial:
 * - Authentication (register, login, verify)
 * - Products (get, search, admin operations)
 * - Cart (add items, coupons, management)
 * - Favorites (add, remove, status checks)
 * - Reviews (create, update, delete)
 * - Addresses (CRUD operations)
 * - Users (profile, password, management)
 * - Orders (create, cancel, admin views)
 * 
 * Uso: node scripts/tests/test-all-routes.js
 */

import { AuthTester } from './test-auth.js';
import { ProductsTester } from './test-products.js';
import { CartTester } from './test-cart.js';
import { FavoritesTester } from './test-favorites.js';
import { ReviewsTester } from './test-reviews.js';
import { AddressesTester } from './test-addresses.js';
import { UsersTester } from './test-users.js';
import { OrdersTester } from './test-orders.js';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class MasterTester {
  constructor() {
    this.overallStats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      modules: 0,
      successfulModules: 0
    };
    this.moduleResults = [];
    this.startTime = Date.now();
  }

  async runModule(TesterClass, moduleName) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`🧪 EJECUTANDO: ${moduleName}`, 'bright');
    log(`${'='.repeat(60)}`, 'cyan');
    
    const tester = new TesterClass();
    const moduleStartTime = Date.now();
    
    try {
      const success = await tester.runTests();
      const moduleEndTime = Date.now();
      const duration = ((moduleEndTime - moduleStartTime) / 1000).toFixed(1);
      
      // Obtener estadísticas del módulo
      const moduleStats = tester.getStats();
      
      // Actualizar estadísticas generales
      this.overallStats.total += moduleStats.total;
      this.overallStats.passed += moduleStats.passed;
      this.overallStats.failed += moduleStats.failed;
      this.overallStats.skipped += moduleStats.skipped;
      this.overallStats.modules++;
      
      if (success) {
        this.overallStats.successfulModules++;
      }
      
      // Guardar resultado del módulo
      this.moduleResults.push({
        name: moduleName,
        success,
        stats: moduleStats,
        duration: duration
      });
      
      // Mostrar resultado del módulo
      const status = success ? '✅ EXITOSO' : '❌ FALLÓ';
      const statusColor = success ? 'green' : 'red';
      
      log(`\n📊 ${moduleName} - ${status} (${duration}s)`, statusColor);
      log(`   Tests: ${moduleStats.passed}✅ ${moduleStats.failed}❌ ${moduleStats.skipped}⏭️ `, 'white');
      
      return success;
    } catch (error) {
      const moduleEndTime = Date.now();
      const duration = ((moduleEndTime - moduleStartTime) / 1000).toFixed(1);
      
      this.overallStats.modules++;
      this.moduleResults.push({
        name: moduleName,
        success: false,
        error: error.message,
        duration: duration
      });
      
      log(`\n💥 ${moduleName} - ERROR FATAL (${duration}s)`, 'red');
      log(`   ${error.message}`, 'red');
      return false;
    }
  }

  async runAllTests() {
    log('🚀 INICIANDO SUITE COMPLETA DE TESTING', 'bright');
    log('=====================================', 'bright');
    log(`🕐 Hora de inicio: ${new Date().toLocaleString('es-ES')}`, 'cyan');
    
    // Información del entorno
    log('\n📋 CONFIGURACIÓN:', 'yellow');
    log('   API Base: http://localhost:5500/api/v1', 'white');
    log('   Puerto esperado: 5500', 'white');
    log('   Usuario de prueba: Se creará automáticamente', 'white');
    
    // Verificar que el servidor esté funcionando
    log('\n🔍 Verificando servidor...', 'yellow');
    try {
      const response = await fetch('http://localhost:5500/health');
      if (response.ok) {
        log('✅ Servidor respondiendo correctamente', 'green');
      } else {
        log('⚠️  Servidor responde pero con estado no OK', 'yellow');
      }
    } catch (error) {
      log('❌ Servidor no responde - Asegúrate de que esté ejecutándose en puerto 5500', 'red');
      log('   Comando: npm start', 'white');
      return false;
    }

    // Ejecutar todos los módulos de testing
    const modules = [
      { class: AuthTester, name: 'AUTENTICACIÓN' },
      { class: ProductsTester, name: 'PRODUCTOS' },
      { class: CartTester, name: 'CARRITO' },
      { class: FavoritesTester, name: 'FAVORITOS' },
      { class: ReviewsTester, name: 'RESEÑAS' },
      { class: AddressesTester, name: 'DIRECCIONES' },
      { class: UsersTester, name: 'USUARIOS' },
      { class: OrdersTester, name: 'PEDIDOS' }
    ];

    for (const module of modules) {
      await this.runModule(module.class, module.name);
      
      // Pequeña pausa entre módulos
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Mostrar resumen final
    this.showFinalSummary();
    
    // Retornar si todos los módulos fueron exitosos
    return this.overallStats.successfulModules === this.overallStats.modules;
  }

  showFinalSummary() {
    const endTime = Date.now();
    const totalDuration = ((endTime - this.startTime) / 1000).toFixed(1);
    
    log('\n' + '='.repeat(80), 'bright');
    log('📊 RESUMEN FINAL DE TESTING', 'bright');
    log('='.repeat(80), 'bright');
    
    // Estadísticas por módulo
    log('\n📋 RESULTADOS POR MÓDULO:', 'cyan');
    this.moduleResults.forEach(module => {
      const status = module.success ? '✅' : '❌';
      const color = module.success ? 'green' : 'red';
      
      if (module.stats) {
        log(`${status} ${module.name.padEnd(15)} - ${module.stats.passed}✅ ${module.stats.failed}❌ ${module.stats.skipped}⏭️ (${module.duration}s)`, color);
      } else {
        log(`${status} ${module.name.padEnd(15)} - ERROR: ${module.error} (${module.duration}s)`, color);
      }
    });
    
    // Estadísticas generales
    log('\n📈 ESTADÍSTICAS GENERALES:', 'yellow');
    log(`   Módulos ejecutados: ${this.overallStats.modules}`, 'white');
    log(`   Módulos exitosos: ${this.overallStats.successfulModules}`, 'green');
    log(`   Módulos fallidos: ${this.overallStats.modules - this.overallStats.successfulModules}`, 'red');
    
    log('\n🧪 ESTADÍSTICAS DE TESTS:', 'yellow');
    log(`   Total de tests: ${this.overallStats.total}`, 'white');
    log(`   Tests exitosos: ${this.overallStats.passed}`, 'green');
    log(`   Tests fallidos: ${this.overallStats.failed}`, 'red');
    log(`   Tests omitidos: ${this.overallStats.skipped}`, 'yellow');
    
    // Tasa de éxito
    const moduleSuccessRate = ((this.overallStats.successfulModules / this.overallStats.modules) * 100).toFixed(1);
    const testSuccessRate = this.overallStats.total > 0 ? 
      ((this.overallStats.passed / (this.overallStats.total - this.overallStats.skipped)) * 100).toFixed(1) : 0;
    
    log('\n🎯 TASAS DE ÉXITO:', 'magenta');
    log(`   Módulos: ${moduleSuccessRate}%`, moduleSuccessRate >= 90 ? 'green' : moduleSuccessRate >= 70 ? 'yellow' : 'red');
    log(`   Tests: ${testSuccessRate}%`, testSuccessRate >= 90 ? 'green' : testSuccessRate >= 70 ? 'yellow' : 'red');
    
    // Tiempo total
    log(`\n⏱️  Tiempo total: ${totalDuration}s`, 'cyan');
    log(`🕐 Finalizado: ${new Date().toLocaleString('es-ES')}`, 'cyan');
    
    // Mensaje final
    const allSuccess = this.overallStats.successfulModules === this.overallStats.modules;
    if (allSuccess) {
      log('\n🎉 ¡TODOS LOS TESTS COMPLETADOS EXITOSAMENTE!', 'green');
    } else {
      log('\n⚠️  ALGUNOS TESTS FALLARON - Revisar logs arriba', 'yellow');
    }
    
    // Información de limpieza
    log('\n🧹 LIMPIEZA:', 'yellow');
    log('   Los datos de prueba se crean con emails únicos usando timestamp', 'white');
    log('   Considera ejecutar un script de limpieza si hay muchos datos de prueba', 'white');
    
    log('\n' + '='.repeat(80), 'bright');
  }
}

// Función principal
async function main() {
  const masterTester = new MasterTester();
  
  try {
    const success = await masterTester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log('\n💥 ERROR FATAL EN EL SUITE DE TESTING:', 'red');
    log(error.message, 'red');
    log(error.stack, 'red');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
