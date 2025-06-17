import { sendVerificationEmail, sendWelcomeEmail } from '../src/config/resend.js';

// Test de envío de emails
async function testEmails() {
  console.log('🧪 Iniciando pruebas de email...\n');

  // Test 1: Email de verificación
  console.log('📧 Probando email de verificación...');
  try {
    const result1 = await sendVerificationEmail(
      'test@example.com',
      '123456',
      'Usuario de Prueba'
    );
    console.log('✅ Email de verificación enviado:', result1);
  } catch (error) {
    console.log('❌ Error enviando email de verificación:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Email de bienvenida
  console.log('🎉 Probando email de bienvenida...');
  try {
    const result2 = await sendWelcomeEmail(
      'test@example.com',
      'Usuario de Prueba'
    );
    console.log('✅ Email de bienvenida enviado:', result2);
  } catch (error) {
    console.log('❌ Error enviando email de bienvenida:', error.message);
  }

  console.log('\n🏁 Pruebas completadas');
}

// Ejecutar si el script se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmails();
}

export { testEmails };
