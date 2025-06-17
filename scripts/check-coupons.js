import { supabaseAdmin } from '../src/config/supabase.js';

const checkCoupons = async () => {
  try {
    const { data, error } = await supabaseAdmin.from('cupones').select('*').limit(1);
    if (error) {
      console.log('Error:', error.message);
    } else {
      console.log('Cupón ejemplo:', data[0]);
      console.log('Campos disponibles:', Object.keys(data[0] || {}));
    }
  } catch (err) {
    console.log('Error general:', err.message);
  }
};

checkCoupons();
