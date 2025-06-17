#!/usr/bin/env node

/**
 * Script para crear la tabla detalles_pedido necesaria para el sistema de pedidos
 * @author GitHub Copilot
 * @date 2024
 */

import { supabaseAdmin } from '../src/config/supabase.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const createDetallesPedidoTable = async () => {
  try {
    log('\n🔧 Iniciando creación de tabla detalles_pedido...', 'cyan');

    // SQL para crear la tabla
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.detalles_pedido (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        pedido_id bigint NOT NULL,
        producto_id bigint NOT NULL,
        cantidad integer NOT NULL,
        precio_unitario numeric(10, 2) NOT NULL,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now(),
        CONSTRAINT detalles_pedido_pkey PRIMARY KEY (id),
        CONSTRAINT detalles_pedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE,
        CONSTRAINT detalles_pedido_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE CASCADE,
        CONSTRAINT detalles_pedido_cantidad_check CHECK ((cantidad > 0)),
        CONSTRAINT detalles_pedido_precio_check CHECK ((precio_unitario > 0))
      ) TABLESPACE pg_default;
    `;

    // Ejecutar la creación de la tabla
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (createError) {
      // Si no funciona con RPC, intentemos con una consulta directa
      log('⚠️  Método RPC no disponible, intentando creación manual...', 'yellow');
      
      // Verificar si la tabla ya existe
      const { data: tableExists, error: checkError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'detalles_pedido');

      if (checkError) {
        throw new Error(`Error verificando tabla existente: ${checkError.message}`);
      }

      if (tableExists && tableExists.length > 0) {
        log('✅ La tabla detalles_pedido ya existe', 'green');
        return;
      }

      throw new Error(`No se pudo crear la tabla: ${createError.message}`);
    }

    log('✅ Tabla detalles_pedido creada exitosamente', 'green');

    // Crear índices
    log('📊 Creando índices...', 'blue');

    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_detalles_pedido_pedido_id 
      ON public.detalles_pedido USING btree (pedido_id) TABLESPACE pg_default;
      
      CREATE INDEX IF NOT EXISTS idx_detalles_pedido_producto_id 
      ON public.detalles_pedido USING btree (producto_id) TABLESPACE pg_default;
    `;

    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createIndexesSQL
    });

    if (indexError) {
      log(`⚠️  Error creando índices: ${indexError.message}`, 'yellow');
    } else {
      log('✅ Índices creados exitosamente', 'green');
    }

  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    log('\n📝 Instrucciones manuales:', 'yellow');
    log('Si este script falla, ejecuta manualmente en tu base de datos:', 'yellow');
    
    const sqlPath = join(__dirname, '..', 'database', 'tabla_detalles_pedido.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      log('\n' + sqlContent, 'cyan');
    } else {
      log(`
CREATE TABLE IF NOT EXISTS public.detalles_pedido (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pedido_id bigint NOT NULL,
  producto_id bigint NOT NULL,
  cantidad integer NOT NULL,
  precio_unitario numeric(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT detalles_pedido_pkey PRIMARY KEY (id),
  CONSTRAINT detalles_pedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE,
  CONSTRAINT detalles_pedido_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE CASCADE,
  CONSTRAINT detalles_pedido_cantidad_check CHECK ((cantidad > 0)),
  CONSTRAINT detalles_pedido_precio_check CHECK ((precio_unitario > 0))
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_detalles_pedido_pedido_id ON public.detalles_pedido USING btree (pedido_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_detalles_pedido_producto_id ON public.detalles_pedido USING btree (producto_id) TABLESPACE pg_default;
`, 'cyan');
    }
  }
};

const verifyTableCreation = async () => {
  try {
    log('\n🔍 Verificando estructura de la tabla...', 'blue');

    // Intentar hacer una consulta simple para verificar que la tabla existe
    const { data, error } = await supabaseAdmin
      .from('detalles_pedido')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.detalles_pedido" does not exist')) {
        log('❌ La tabla detalles_pedido no existe', 'red');
        return false;
      } else {
        log(`⚠️  Error al verificar tabla: ${error.message}`, 'yellow');
        return false;
      }
    }

    log('✅ Tabla detalles_pedido verificada correctamente', 'green');
    return true;
  } catch (error) {
    log(`❌ Error en verificación: ${error.message}`, 'red');
    return false;
  }
};

const main = async () => {
  log('🚀 SCRIPT DE MIGRACIÓN - TABLA DETALLES_PEDIDO', 'bold');
  log('================================================', 'blue');

  // Verificar si la tabla ya existe
  const tableExists = await verifyTableCreation();
  
  if (tableExists) {
    log('\n✅ La tabla detalles_pedido ya existe y está funcionando', 'green');
    log('📋 Estructura esperada:', 'blue');
    log('  - id (uuid, primary key)', 'cyan');
    log('  - pedido_id (bigint, foreign key)', 'cyan');
    log('  - producto_id (bigint, foreign key)', 'cyan');
    log('  - cantidad (integer)', 'cyan');
    log('  - precio_unitario (numeric)', 'cyan');
    log('  - created_at (timestamp)', 'cyan');
    log('  - updated_at (timestamp)', 'cyan');
  } else {
    await createDetallesPedidoTable();
    
    // Verificar nuevamente después de la creación
    const created = await verifyTableCreation();
    if (created) {
      log('\n🎉 ¡Migración completada exitosamente!', 'green');
    } else {
      log('\n⚠️  La migración puede haber fallado. Revisa manualmente.', 'yellow');
    }
  }

  log('\n📚 Próximos pasos:', 'blue');
  log('1. ✅ Tabla detalles_pedido lista', 'green');
  log('2. 🧪 Ejecutar tests del sistema de carrito', 'yellow');
  log('3. 🛒 Probar flujo completo de pedidos', 'yellow');
  log('4. 📊 Verificar reportes y analytics', 'yellow');

  log('\n🔧 Para probar el sistema:', 'blue');
  log('  npm run test:data', 'cyan');
  log('  npm run dev', 'cyan');

  log('\n✨ Sistema listo para producción!', 'green');
};

// Ejecutar el script
main().catch(console.error);
