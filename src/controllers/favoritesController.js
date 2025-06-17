import { supabaseAdmin } from '../config/supabase.js';

const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { data: favorites, error, count } = await supabaseAdmin
      .from('favoritos')
      .select(`
        *,
        productos(
          id,
          nombre,
          precio,
          imagen_principal,
          stock,
          categorias(nombre)
        )
      `, { count: 'exact' })
      .eq('usuario_id', userId)
      .order('fecha_agregado', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      favorites,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      error: 'Failed to get favorites',
      message: error.message
    });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Check if product exists
    const { data: product, error: productError } = await supabaseAdmin
      .from('productos')
      .select('id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    // Check if already in favorites
    const { data: existingFavorite } = await supabaseAdmin
      .from('favoritos')
      .select('id')
      .eq('usuario_id', userId)
      .eq('producto_id', productId)
      .single();

    if (existingFavorite) {
      return res.status(409).json({
        error: 'Already in favorites',
        message: 'Product is already in your favorites'
      });
    }

    // Add to favorites
    const { data: favorite, error } = await supabaseAdmin
      .from('favoritos')
      .insert([{
        usuario_id: userId,
        producto_id: productId
      }])
      .select(`
        *,
        productos(
          id,
          nombre,
          precio,
          imagen_principal,
          stock
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: 'Product added to favorites successfully',
      favorite
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      error: 'Failed to add to favorites',
      message: error.message
    });
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const { error } = await supabaseAdmin
      .from('favoritos')
      .delete()
      .eq('usuario_id', userId)
      .eq('producto_id', productId);

    if (error) {
      throw error;
    }

    res.json({
      message: 'Product removed from favorites successfully'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      error: 'Failed to remove from favorites',
      message: error.message
    });
  }
};

const checkFavoriteStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const { data: favorite, error } = await supabaseAdmin
      .from('favoritos')
      .select('id')
      .eq('usuario_id', userId)
      .eq('producto_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error;
    }

    res.json({
      isFavorite: !!favorite,
      favoriteId: favorite?.id || null
    });
  } catch (error) {
    console.error('Check favorite status error:', error);
    res.status(500).json({
      error: 'Failed to check favorite status',
      message: error.message
    });
  }
};

export {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus
};
