import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '../src/config/env.js';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Colores para output en consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Función para crear datos de prueba
const createTestData = async () => {
  try {
    log('cyan', '🎬 Creando datos de prueba...\n');

    // 1. Crear usuario de prueba
    log('blue', '👤 Creando usuario de prueba...');
    const testUserData = {
      correo_electronico: 'test@toutaunclicla.com',
      nombre: 'Usuario Test',
      verificado: true,
      autenticacion_social: false,
      intentos_login_fallidos: 0,
      cuenta_bloqueada: false,
      requiere_cambio_contrasena: false
    };

    const { data: usuario, error: userError } = await supabaseAdmin
      .from('usuarios')
      .upsert(testUserData, { onConflict: 'correo_electronico' })
      .select()
      .single();

    if (userError) {
      console.error('Error creando usuario:', userError);
      return;
    }
    log('green', `✅ Usuario de prueba creado: ${usuario.correo_electronico} (ID: ${usuario.id})`);

    // 2. Crear categoría de prueba
    log('blue', '📁 Creando categoría...');
    const { data: categoria, error: catError } = await supabaseAdmin
      .from('categorias')
      .upsert({
        nombre: 'Electrónicos Test',
        descripcion: 'Categoría de prueba para testing'
      }, { onConflict: 'nombre' })
      .select()
      .single();

    if (catError) {
      console.error('Error creando categoría:', catError);
      return;
    }
    log('green', `✅ Categoría creada: ${categoria.nombre} (ID: ${categoria.id})`);

    // 3. Crear productos de prueba
    log('blue', '📦 Creando productos...');
    const productos = [
      {
        nombre: 'iPhone Test',
        descripcion: 'Smartphone de prueba',
        precio: 999.99,
        categoria_id: categoria.id,
        stock: 50,
        imagen_principal: 'https://via.placeholder.com/300x300?text=iPhone'
      },
      {
        nombre: 'MacBook Test',
        descripcion: 'Laptop de prueba',
        precio: 1299.99,
        categoria_id: categoria.id,
        stock: 25,
        imagen_principal: 'https://via.placeholder.com/300x300?text=MacBook'
      },
      {
        nombre: 'AirPods Test',
        descripcion: 'Audífonos de prueba',
        precio: 199.99,
        categoria_id: categoria.id,
        stock: 100,
        imagen_principal: 'https://via.placeholder.com/300x300?text=AirPods'
      }
    ];

    const { data: productosCreados, error: prodError } = await supabaseAdmin
      .from('productos')
      .insert(productos)
      .select();

    if (prodError) {
      console.error('Error creando productos:', prodError);
      return;
    }
    
    productosCreados.forEach(prod => {
      log('green', `✅ Producto creado: ${prod.nombre} (ID: ${prod.id})`);
    });

    // 3. Crear cupones de prueba
    log('blue', '🎫 Creando cupones...');
    const cupones = [
      {
        codigo: 'DESCUENTO10',
        descuento: 10.00,
        fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      },
      {
        codigo: 'DESCUENTO20',
        descuento: 20.00,
        fecha_expiracion: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 días
      },
      {
        codigo: 'EXPIRADO',
        descuento: 50.00,
        fecha_expiracion: new Date(Date.now() - 24 * 60 * 60 * 1000) // Ayer (expirado)
      }
    ];

    for (const cupon of cupones) {
      const { data: cuponCreado, error: cuponError } = await supabaseAdmin
        .from('cupones')
        .upsert(cupon, { onConflict: 'codigo' })
        .select()
        .single();

      if (cuponError) {
        console.error(`Error creando cupón ${cupon.codigo}:`, cuponError);
      } else {
        const estado = cupon.codigo === 'EXPIRADO' ? '❌ EXPIRADO' : '✅ VÁLIDO';
        log('green', `✅ Cupón creado: ${cuponCreado.codigo} (${cuponCreado.descuento}% - ${estado})`);
      }
    }

    log('cyan', '\n🎉 Datos de prueba creados exitosamente!');
    log('yellow', '\n📋 Resumen:');
    log('yellow', `- Usuario: ${usuario.correo_electronico} (ID: ${usuario.id})`);
    log('yellow', `- Categoría: ${categoria.nombre} (ID: ${categoria.id})`);
    log('yellow', `- Productos: ${productosCreados.length} creados`);
    log('yellow', `- Cupones: ${cupones.length} creados`);
    log('yellow', '\n💡 Ahora puedes usar estos datos para probar el carrito, favoritos y cupones');

    return {
      usuario,
      categoria,
      productos: productosCreados,
      cupones
    };

  } catch (error) {
    log('red', '❌ Error creando datos de prueba:');
    console.error(error);
  }
};

// Función para limpiar datos de prueba
const cleanTestData = async () => {
  try {
    log('cyan', '🧹 Limpiando datos de prueba...\n');

    // Eliminar usuario de prueba
    log('blue', '👤 Eliminando usuario de prueba...');
    const { error: userError } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('correo_electronico', 'test@toutaunclicla.com');

    if (userError) {
      console.error('Error eliminando usuario:', userError);
    } else {
      log('green', '✅ Usuario de prueba eliminado');
    }

    // Eliminar productos de prueba
    log('blue', '📦 Eliminando productos de prueba...');
    const { error: prodError } = await supabaseAdmin
      .from('productos')
      .delete()
      .like('nombre', '%Test%');

    if (prodError) {
      console.error('Error eliminando productos:', prodError);
    } else {
      log('green', '✅ Productos de prueba eliminados');
    }

    // Eliminar categoría de prueba
    log('blue', '📁 Eliminando categoría de prueba...');
    const { error: catError } = await supabaseAdmin
      .from('categorias')
      .delete()
      .eq('nombre', 'Electrónicos Test');

    if (catError) {
      console.error('Error eliminando categoría:', catError);
    } else {
      log('green', '✅ Categoría de prueba eliminada');
    }

    // Eliminar cupones de prueba
    log('blue', '🎫 Eliminando cupones de prueba...');
    const { error: cuponError } = await supabaseAdmin
      .from('cupones')
      .delete()
      .in('codigo', ['DESCUENTO10', 'DESCUENTO20', 'EXPIRADO']);

    if (cuponError) {
      console.error('Error eliminando cupones:', cuponError);
    } else {
      log('green', '✅ Cupones de prueba eliminados');
    }

    log('cyan', '\n🎉 Datos de prueba limpiados exitosamente!');

  } catch (error) {
    log('red', '❌ Error limpiando datos de prueba:');
    console.error(error);
  }
};

// Función para mostrar estadísticas
const showStats = async () => {
  try {
    log('cyan', '📊 Estadísticas de la base de datos...\n');

    // Contar productos
    const { count: productCount } = await supabaseAdmin
      .from('productos')
      .select('*', { count: 'exact', head: true });

    // Contar categorías
    const { count: categoryCount } = await supabaseAdmin
      .from('categorias')
      .select('*', { count: 'exact', head: true });

    // Contar cupones
    const { count: couponCount } = await supabaseAdmin
      .from('cupones')
      .select('*', { count: 'exact', head: true });

    // Contar usuarios
    const { count: userCount } = await supabaseAdmin
      .from('usuarios')
      .select('*', { count: 'exact', head: true });

    // Contar favoritos
    const { count: favoritesCount } = await supabaseAdmin
      .from('favoritos')
      .select('*', { count: 'exact', head: true });

    // Contar items en carrito
    const { count: cartCount } = await supabaseAdmin
      .from('carrito')
      .select('*', { count: 'exact', head: true });

    log('blue', '📈 Totales en base de datos:');
    log('yellow', `  👥 Usuarios: ${userCount}`);
    log('yellow', `  📁 Categorías: ${categoryCount}`);
    log('yellow', `  📦 Productos: ${productCount}`);
    log('yellow', `  🎫 Cupones: ${couponCount}`);
    log('yellow', `  ❤️  Favoritos: ${favoritesCount}`);
    log('yellow', `  🛒 Items en carrito: ${cartCount}`);

  } catch (error) {
    log('red', '❌ Error obteniendo estadísticas:');
    console.error(error);
  }
};

// Función principal
const main = async () => {
  const command = process.argv[2];

  log('cyan', '🛒 Testing de Carrito, Favoritos y Cupones - ToutAunClicLa\n');

  try {
    switch (command) {
      case 'create':
        await createTestData();
        break;

      case 'clean':
        await cleanTestData();
        break;

      case 'stats':
        await showStats();
        break;

      case 'reset':
        log('cyan', '🔄 Reiniciando datos de prueba...\n');
        await cleanTestData();
        console.log(''); // Línea en blanco
        await createTestData();
        break;

      default:
        log('blue', '📖 Comandos disponibles:');
        log('yellow', '');
        log('yellow', '  create  - Crear datos de prueba (categorías, productos, cupones)');
        log('yellow', '  clean   - Limpiar todos los datos de prueba');
        log('yellow', '  stats   - Mostrar estadísticas de la base de datos');
        log('yellow', '  reset   - Limpiar y crear datos de prueba nuevamente');
        log('yellow', '');
        log('blue', '📝 Ejemplos:');
        log('yellow', '  npm run test:data create');
        log('yellow', '  npm run test:data stats');
        log('yellow', '  npm run test:data clean');
        log('yellow', '  npm run test:data reset');
        log('yellow', '');
        log('magenta', '💡 Usa estos datos para probar:');
        log('yellow', '  - Endpoints del carrito con productos reales');
        log('yellow', '  - Sistema de favoritos');
        log('yellow', '  - Aplicación de cupones de descuento');
        log('yellow', '  - Flujos completos de e-commerce');
        break;
    }
  } catch (error) {
    log('red', '💥 Error fatal:');
    console.error(error);
    process.exit(1);
  }
};

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
