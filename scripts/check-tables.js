#!/usr/bin/env node

import { supabaseAdmin } from '../src/config/supabase.js';

async function checkTables() {
  console.log('🔍 Verificando tablas de usuarios...');
  
  // Verificar auth.users
  try {
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    console.log('✅ Auth users:', authUsers?.users?.length || 0);
    if (authUsers?.users?.length > 0) {
      console.log('  Primeros usuarios auth:', authUsers.users.slice(0, 2).map(u => ({ id: u.id, email: u.email })));
    }
  } catch (error) {
    console.log('❌ Error auth users:', error.message);
  }
  
  // Verificar profiles
  try {
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(5);
    console.log('✅ Profiles:', profiles?.length || 0);
    if (profiles?.length > 0) {
      console.log('  Primeros profiles:', profiles.slice(0, 2));
    }
    if (profileError) console.log('  Error profiles:', profileError.message);
  } catch (error) {
    console.log('❌ Error profiles:', error.message);
  }
  
  // Verificar usuarios
  try {
    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .limit(5);
    console.log('✅ Usuarios:', usuarios?.length || 0);
    if (usuarios?.length > 0) {
      console.log('  Primeros usuarios:', usuarios.slice(0, 2));
    }
    if (usuariosError) console.log('  Error usuarios:', usuariosError.message);
  } catch (error) {
    console.log('❌ Error usuarios:', error.message);
  }

  // Verificar productos
  try {
    const { data: productos, error: productError } = await supabaseAdmin
      .from('productos')
      .select('id, nombre')
      .limit(3);
    console.log('✅ Productos:', productos?.length || 0);
    if (productos?.length > 0) {
      console.log('  Primeros productos:', productos);
    }
    if (productError) console.log('  Error productos:', productError.message);
  } catch (error) {
    console.log('❌ Error productos:', error.message);
  }
}

checkTables();
