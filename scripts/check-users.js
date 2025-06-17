import { supabaseAdmin } from '../src/config/supabase.js';

const checkUsersTable = async () => {
  try {
    // Intentar obtener un usuario para ver la estructura
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error con tabla usuarios:', error.message);
    } else {
      console.log('Estructura de la tabla usuarios:');
      if (data && data.length > 0) {
        console.log('Campos disponibles:', Object.keys(data[0]));
        console.log('Usuario ejemplo:', data[0]);
      } else {
        console.log('Tabla existe pero está vacía');
        
        // Intentar insertar un usuario mínimo para ver qué campos se requieren
        const { error: insertError } = await supabaseAdmin
          .from('usuarios')
          .insert({ email: 'test@example.com' })
          .select();
        
        if (insertError) {
          console.log('Error al insertar usuario de prueba:', insertError.message);
        }
      }
    }
  } catch (err) {
    console.log('Error general:', err.message);
  }
};

checkUsersTable();
