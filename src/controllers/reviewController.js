import { supabaseAdmin } from '../config/supabase.js';

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { data: reviews, error, count } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        usuarios(nombre, apellido)
      `, { count: 'exact' })
      .eq('producto_id', productId)
      .order('fecha_creacion', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      error: 'Failed to get reviews',
      message: error.message
    });
  }
};

const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

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

    // Check if user has already reviewed this product
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('usuario_id', userId)
      .eq('producto_id', productId)
      .single();

    if (existingReview) {
      return res.status(409).json({
        error: 'Review already exists',
        message: 'You have already reviewed this product'
      });
    }

    // Check if user has purchased this product
    const { data: purchase } = await supabaseAdmin
      .from('order_items')
      .select(`
        id,
        orders(user_id, status)
      `)
      .eq('producto_id', productId)
      .eq('orders.user_id', userId)
      .eq('orders.status', 'completed')
      .single();

    if (!purchase) {
      return res.status(403).json({
        error: 'Purchase required',
        message: 'You can only review products you have purchased'
      });
    }

    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .insert([{
        usuario_id: userId,
        producto_id: productId,
        estrellas: rating,
        comentario: comment
      }])
      .select(`
        *,
        usuarios(nombre, apellido)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      error: 'Failed to create review',
      message: error.message
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .update({ estrellas: rating, comentario: comment })
      .eq('id', id)
      .eq('usuario_id', userId)
      .select(`
        *,
        usuarios(nombre, apellido)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      error: 'Failed to update review',
      message: error.message
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId);

    if (error) {
      throw error;
    }

    res.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      error: 'Failed to delete review',
      message: error.message
    });
  }
};

export {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
};
