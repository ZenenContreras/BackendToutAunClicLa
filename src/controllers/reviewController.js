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
        usuarios(nombre)
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
    const { 
      productId, 
      estrellas, 
      comentario
      
    } = req.body;

    // Normalizar los campos
    const finalRating = estrellas ;
    const finalComment = comentario;

    if (!finalRating) {
      return res.status(400).json({
        error: 'Missing rating',
        message: 'Rating (estrellas) is required'
      });
    }

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

    // Para desarrollo: hacer la verificación de compra opcional
    // Cambiar REQUIRE_PURCHASE a true para requerir compra en producción
    const REQUIRE_PURCHASE = false; // Set to true in production
    
    if (REQUIRE_PURCHASE) {
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
    }

    console.log('⭐ Creando reseña para producto:', productId, 'usuario:', userId);

    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .insert([{
        usuario_id: userId,
        producto_id: productId,
        estrellas: finalRating,
        comentario: finalComment || null
      }])
      .select(`
        *,
        usuarios(nombre)
      `)
      .single();

    if (error) {
      console.error('❌ Error al crear reseña:', error);
      throw error;
    }

    console.log('✅ Reseña creada exitosamente:', review.id);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('❌ Create review error:', error);
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
    const { 
      estrellas, 
      comentario
    } = req.body;

    // Normalizar los campos
    const finalRating = estrellas;
    const finalComment = comentario ;

    if (!finalRating) {
      return res.status(400).json({
        error: 'Missing rating',
        message: 'Rating (estrellas) is required'
      });
    }

    console.log('⭐ Actualizando reseña:', id, 'para usuario:', userId);

    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .update({ 
        estrellas: finalRating, 
        comentario: finalComment || null 
      })
      .eq('id', id)
      .eq('usuario_id', userId)
      .select(`
        *,
        usuarios(nombre)
      `)
      .single();

    if (error) {
      console.error('❌ Error al actualizar reseña:', error);
      throw error;
    }

    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist or does not belong to user'
      });
    }

    console.log('✅ Reseña actualizada exitosamente:', id);

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('❌ Update review error:', error);
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

    console.log('⭐ Eliminando reseña:', id, 'para usuario:', userId);

    // Verificar que la reseña existe y pertenece al usuario antes de eliminar
    const { data: existingReview, error: checkError } = await supabaseAdmin
      .from('reviews')
      .select('id, producto_id, estrellas')
      .eq('id', id)
      .eq('usuario_id', userId)
      .single();

    if (checkError || !existingReview) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'Review not found or does not belong to user'
      });
    }

    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId);

    if (error) {
      console.error('❌ Error al eliminar reseña:', error);
      throw error;
    }

    console.log('✅ Reseña eliminada exitosamente:', id);

    res.json({
      message: 'Review deleted successfully',
      deletedReview: {
        id: id,
        producto_id: existingReview.producto_id,
        estrellas: existingReview.estrellas
      }
    });
  } catch (error) {
    console.error('❌ Delete review error:', error);
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
