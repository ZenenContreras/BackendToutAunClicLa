import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '../src/config/env.js';
import { sendVerificationEmail } from '../src/config/resend.js';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Generar código de verificación de 6 dígitos
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Función para registrar un usuario de prueba
const createTestUser = async (email, nombre) => {
  try {
    console.log('🔄 Creando usuario de prueba...');
    
    const verificationCode = generateVerificationCode();
    const tokenExpiration = new Date();
    tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 15);

    // Insertar usuario en la base de datos
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .insert({
        correo_electronico: email,
        nombre: nombre,
        telefono: '+1234567890',
        verificado: false,
        token_verificacion_email: verificationCode,
        fecha_expiracion_token: tokenExpiration.toISOString(),
        fecha_creacion: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Duplicate key error
        console.log('❌ Usuario ya existe. Eliminando y creando nuevo...');
        await deleteTestUser(email);
        return createTestUser(email, nombre);
      }
      throw error;
    }

    console.log('✅ Usuario creado:', {
      id: user.id,
      email: user.correo_electronico,
      verified: user.verificado
    });

    // Enviar email de verificación
    console.log('📧 Enviando email de verificación...');
    try {
      await sendVerificationEmail(email, verificationCode, nombre);
      console.log('✅ Email enviado exitosamente');
    } catch (emailError) {
      console.log('⚠️  Error enviando email (continuando):', emailError.message);
    }

    return {
      user,
      verificationCode,
      expiresAt: tokenExpiration
    };
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    throw error;
  }
};

// Función para verificar un usuario con código
const verifyTestUser = async (code) => {
  try {
    console.log('🔄 Verificando código:', code);

    // Buscar usuario con este código
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('token_verificacion_email', code)
      .single();

    if (error || !user) {
      console.log('❌ Código no encontrado o inválido');
      return { success: false, message: 'Código inválido' };
    }

    // Verificar expiración
    const tokenExpiration = new Date(user.fecha_expiracion_token);
    if (new Date() > tokenExpiration) {
      console.log('❌ Código expirado');
      return { success: false, message: 'Código expirado' };
    }

    // Verificar usuario
    const { error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update({
        verificado: true,
        token_verificacion_email: null,
        fecha_expiracion_token: null
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    console.log('✅ Usuario verificado exitosamente');
    return { 
      success: true, 
      message: 'Usuario verificado',
      user: {
        id: user.id,
        email: user.correo_electronico,
        verified: true
      }
    };
  } catch (error) {
    console.error('❌ Error verificando usuario:', error);
    return { success: false, message: error.message };
  }
};

// Función para obtener el estado de verificación
const getVerificationStatus = async (email) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('correo_electronico, verificado, token_verificacion_email, fecha_expiracion_token, fecha_creacion')
      .eq('correo_electronico', email)
      .single();

    if (error || !user) {
      return { found: false };
    }

    const hasCode = !!user.token_verificacion_email;
    const codeExpired = user.fecha_expiracion_token ? 
      new Date() > new Date(user.fecha_expiracion_token) : false;

    return {
      found: true,
      email: user.correo_electronico,
      verified: user.verificado,
      hasCode,
      codeExpired,
      code: user.token_verificacion_email, // Solo para testing
      expiresAt: user.fecha_expiracion_token,
      createdAt: user.fecha_creacion
    };
  } catch (error) {
    console.error('❌ Error obteniendo estado:', error);
    return { found: false, error: error.message };
  }
};

// Función para eliminar usuario de prueba
const deleteTestUser = async (email) => {
  try {
    const { error } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('correo_electronico', email);

    if (error) {
      throw error;
    }

    console.log('🗑️  Usuario eliminado:', email);
  } catch (error) {
    console.error('❌ Error eliminando usuario:', error);
  }
};

// Función para generar un nuevo código para usuario existente
const resendCode = async (email) => {
  try {
    console.log('🔄 Generando nuevo código para:', email);

    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('correo_electronico', email)
      .single();

    if (error || !user) {
      console.log('❌ Usuario no encontrado');
      return { success: false, message: 'Usuario no encontrado' };
    }

    if (user.verificado) {
      console.log('❌ Usuario ya está verificado');
      return { success: false, message: 'Usuario ya verificado' };
    }

    const verificationCode = generateVerificationCode();
    const tokenExpiration = new Date();
    tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 15);

    // Actualizar código
    const { error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update({
        token_verificacion_email: verificationCode,
        fecha_expiracion_token: tokenExpiration.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Enviar nuevo email
    try {
      await sendVerificationEmail(email, verificationCode, user.nombre);
      console.log('✅ Nuevo código enviado por email');
    } catch (emailError) {
      console.log('⚠️  Error enviando email (código generado):', emailError.message);
    }

    return {
      success: true,
      verificationCode,
      expiresAt: tokenExpiration
    };
  } catch (error) {
    console.error('❌ Error reenviando código:', error);
    return { success: false, message: error.message };
  }
};

// Función principal para manejar argumentos de línea de comandos
const main = async () => {
  const command = process.argv[2];
  const email = process.argv[3] || 'test@toutaunclicla.com';
  const nombre = process.argv[4] || 'Usuario Test';
  const code = process.argv[3]; // Para verify comando

  console.log('🧪 Test de Verificación de Email - ToutAunClicLa\n');

  try {
    switch (command) {
      case 'create':
        console.log(`📝 Creando usuario de prueba: ${email}`);
        const result = await createTestUser(email, nombre);
        console.log('\n🎯 RESULTADO:');
        console.log('- Email:', email);
        console.log('- Código de verificación:', result.verificationCode);
        console.log('- Expira en:', result.expiresAt.toLocaleString());
        console.log('\n💡 Para verificar, usa:');
        console.log(`npm run test:verification verify ${result.verificationCode}`);
        break;

      case 'verify':
        if (!code) {
          console.log('❌ Falta el código de verificación');
          console.log('Uso: npm run test:verification verify [CODIGO]');
          return;
        }
        console.log(`🔍 Verificando código: ${code}`);
        const verifyResult = await verifyTestUser(code);
        console.log('\n🎯 RESULTADO:', verifyResult);
        break;

      case 'status':
        console.log(`📊 Obteniendo estado de: ${email}`);
        const status = await getVerificationStatus(email);
        console.log('\n🎯 ESTADO:');
        console.log(JSON.stringify(status, null, 2));
        break;

      case 'resend':
        console.log(`🔄 Reenviando código para: ${email}`);
        const resendResult = await resendCode(email);
        if (resendResult.success) {
          console.log('\n🎯 NUEVO CÓDIGO:');
          console.log('- Código:', resendResult.verificationCode);
          console.log('- Expira en:', resendResult.expiresAt.toLocaleString());
        } else {
          console.log('\n❌ Error:', resendResult.message);
        }
        break;

      case 'delete':
        console.log(`🗑️  Eliminando usuario: ${email}`);
        await deleteTestUser(email);
        break;

      case 'demo':
        console.log('🎬 Ejecutando demo completo...\n');
        
        // 1. Crear usuario
        console.log('📝 PASO 1: Crear usuario');
        const demoUser = await createTestUser(email, nombre);
        console.log('✅ Usuario creado con código:', demoUser.verificationCode);
        
        // 2. Verificar estado
        console.log('\n📊 PASO 2: Verificar estado');
        const demoStatus = await getVerificationStatus(email);
        console.log('Estado:', { verified: demoStatus.verified, hasCode: demoStatus.hasCode });
        
        // 3. Verificar con código
        console.log('\n🔍 PASO 3: Verificar con código');
        const demoVerify = await verifyTestUser(demoUser.verificationCode);
        console.log('Verificación:', demoVerify.success ? '✅ Exitosa' : '❌ Falló');
        
        // 4. Verificar estado final
        console.log('\n📊 PASO 4: Estado final');
        const finalStatus = await getVerificationStatus(email);
        console.log('Estado final:', { verified: finalStatus.verified, hasCode: finalStatus.hasCode });
        
        console.log('\n🎉 Demo completado!');
        break;

      default:
        console.log('📖 Comandos disponibles:');
        console.log('');
        console.log('  create [email] [nombre]  - Crear usuario de prueba');
        console.log('  verify [codigo]          - Verificar con código');
        console.log('  status [email]           - Ver estado de verificación');
        console.log('  resend [email]           - Reenviar código');
        console.log('  delete [email]           - Eliminar usuario de prueba');
        console.log('  demo [email] [nombre]    - Ejecutar demo completo');
        console.log('');
        console.log('📝 Ejemplos:');
        console.log('  npm run test:verification create test@example.com "Juan Pérez"');
        console.log('  npm run test:verification verify 123456');
        console.log('  npm run test:verification status test@example.com');
        console.log('  npm run test:verification demo');
        break;
    }
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
};

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  createTestUser,
  verifyTestUser,
  getVerificationStatus,
  resendCode,
  deleteTestUser
};
