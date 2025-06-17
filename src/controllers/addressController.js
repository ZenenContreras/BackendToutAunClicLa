import { supabaseAdmin } from '../config/supabase.js';

const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: addresses, error } = await supabaseAdmin
      .from('direcciones_envio')
      .select('*')
      .eq('usuario_id', userId)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      throw error;
    }

    // Format response to match frontend expectations
    const formattedAddresses = addresses.map(addr => ({
      id: addr.id,
      street: addr.direccion,
      city: addr.ciudad,
      state: addr.estado,
      zipCode: addr.codigo_postal,
      country: addr.pais,
      phone: addr.telefono,
      createdAt: addr.fecha_creacion
    }));

    res.json({ addresses: formattedAddresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      error: 'Failed to get addresses',
      message: error.message
    });
  }
};

const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { street, city, state, zipCode, country, phone } = req.body;

    const { data: address, error } = await supabaseAdmin
      .from('direcciones_envio')
      .insert([{
        usuario_id: userId,
        direccion: street,
        ciudad: city,
        estado: state,
        codigo_postal: zipCode,
        pais: country,
        telefono: phone
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Format response
    const formattedAddress = {
      id: address.id,
      street: address.direccion,
      city: address.ciudad,
      state: address.estado,
      zipCode: address.codigo_postal,
      country: address.pais,
      phone: address.telefono,
      createdAt: address.fecha_creacion
    };

    res.status(201).json({
      message: 'Address created successfully',
      address: formattedAddress
    });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({
      error: 'Failed to create address',
      message: error.message
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { street, city, state, zipCode, country, phone } = req.body;

    const { data: address, error } = await supabaseAdmin
      .from('direcciones_envio')
      .update({
        direccion: street,
        ciudad: city,
        estado: state,
        codigo_postal: zipCode,
        pais: country,
        telefono: phone
      })
      .eq('id', id)
      .eq('usuario_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!address) {
      return res.status(404).json({
        error: 'Address not found',
        message: 'The requested address does not exist'
      });
    }

    // Format response
    const formattedAddress = {
      id: address.id,
      street: address.direccion,
      city: address.ciudad,
      state: address.estado,
      zipCode: address.codigo_postal,
      country: address.pais,
      phone: address.telefono,
      createdAt: address.fecha_creacion
    };

    res.json({
      message: 'Address updated successfully',
      address: formattedAddress
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      error: 'Failed to update address',
      message: error.message
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from('direcciones_envio')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId);

    if (error) {
      throw error;
    }

    res.json({
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      error: 'Failed to delete address',
      message: error.message
    });
  }
};

export {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
