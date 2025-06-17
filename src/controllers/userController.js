import { supabaseAdmin } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, telefono, avatarUrl } = req.body;

    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .update({
        nombre: nombre,
        telefono: telefono,
        url_avatar: avatarUrl
      })
      .eq('id', userId)
      .select('id, correo_electronico, nombre, telefono, verificado, fecha_creacion, url_avatar')
      .single();

    if (error) {
      throw error;
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.correo_electronico,
        nombre: user.nombre,
        telefono: user.telefono,
        verified: user.verificado,
        createdAt: user.fecha_creacion,
        avatarUrl: user.url_avatar
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Use Supabase Auth to update password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      if (error.message.includes('New password should be different')) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'New password must be different from current password'
        });
      }
      throw error;
    }

    // Update password change timestamp in our table
    await supabaseAdmin
      .from('usuarios')
      .update({ 
        fecha_cambio_contrasena: new Date().toISOString(),
        requiere_cambio_contrasena: false
      })
      .eq('id', userId);

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Verify password with Supabase Auth before deletion
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: req.user.correo_electronico,
      password
    });

    if (authError) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password is incorrect'
      });
    }

    // Delete from Supabase Auth
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteAuthError) {
      throw deleteAuthError;
    }

    // The user record in our custom table will be cascade deleted or we can mark as deleted
    // For now, we'll just delete the auth user which should be sufficient
    
    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      message: error.message
    });
  }
};

// Admin functions
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      verified,
      sortBy = 'fecha_creacion', 
      sortOrder = 'desc' 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('usuarios')
      .select('id, correo_electronico, nombre, telefono, verificado, fecha_creacion, fecha_ultimo_login, cuenta_bloqueada, url_avatar', { count: 'exact' });

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,correo_electronico.ilike.%${search}%`);
    }

    if (verified !== undefined) {
      query = query.eq('verificado', verified === 'true');
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      throw error;
    }

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.correo_electronico,
      nombre: user.nombre,
      telefono: user.telefono,
      verified: user.verificado,
      isBlocked: user.cuenta_bloqueada,
      lastLogin: user.fecha_ultimo_login,
      createdAt: user.fecha_creacion,
      avatarUrl: user.url_avatar
    }));

    res.json({
      users: formattedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      message: error.message
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked, reason } = req.body;

    // Update user block status
    const updateData = {
      cuenta_bloqueada: blocked
    };

    if (blocked && reason) {
      updateData.razon_bloqueo = reason;
      updateData.fecha_bloqueo = new Date().toISOString();
    } else if (!blocked) {
      updateData.razon_bloqueo = null;
      updateData.fecha_bloqueo = null;
    }

    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select('id, correo_electronico, nombre, telefono, verificado, fecha_creacion, cuenta_bloqueada, razon_bloqueo')
      .single();

    if (error) {
      throw error;
    }

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    res.json({
      message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        id: user.id,
        email: user.correo_electronico,
        nombre: user.nombre,
        telefono: user.telefono,
        verified: user.verificado,
        isBlocked: user.cuenta_bloqueada,
        blockReason: user.razon_bloqueo,
        createdAt: user.fecha_creacion
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      message: error.message
    });
  }
};

export {
  updateProfile,
  changePassword,
  deleteAccount,
  getAllUsers,
  updateUserStatus
};
