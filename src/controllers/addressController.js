const { supabaseAdmin } = require('../config/supabase');

const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: addresses, error } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ addresses });
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
    const { street, city, state, zipCode, country, isDefault } = req.body;

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data: address, error } = await supabaseAdmin
      .from('addresses')
      .insert([{
        user_id: userId,
        street,
        city,
        state,
        zip_code: zipCode,
        country,
        is_default: isDefault || false
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: 'Address created successfully',
      address
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
    const updateData = req.body;

    // If this is set as default, remove default from other addresses
    if (updateData.isDefault) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data: address, error } = await supabaseAdmin
      .from('addresses')
      .update({
        street: updateData.street,
        city: updateData.city,
        state: updateData.state,
        zip_code: updateData.zipCode,
        country: updateData.country,
        is_default: updateData.isDefault || false
      })
      .eq('id', id)
      .eq('user_id', userId)
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

    res.json({
      message: 'Address updated successfully',
      address
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
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

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

module.exports = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
