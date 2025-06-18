import { supabaseAdmin } from '../config/supabase.js';

const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search, 
      sortBy = 'fecha_creacion', 
      sortOrder = 'desc' 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('productos')
      .select(`
        *,
        reviews(estrellas),
        categorias(nombre)
      `, { count: 'exact' });

    // No filtrar por 'activo' ya que la columna no existe en la tabla actual

    // Filter by category
    if (category) {
      query = query.eq('categoria_id', category);
    }

    // Search functionality
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,descripcion.ilike.%${search}%`);
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      throw error;
    }

    // Calculate average rating for each product
    const productsWithRating = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.estrellas, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length
    }));

    res.json({
      products: productsWithRating,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to get products',
      message: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabaseAdmin
      .from('productos')
      .select(`
        *,
        categorias(nombre),
        reviews(
          id,
          estrellas,
          comentario,
          fecha_creacion,
          usuarios(nombre)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    // Calculate average rating
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.estrellas, 0) / product.reviews.length
      : 0;

    res.json({
      ...product,
      averageRating,
      reviewCount: product.reviews.length
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Failed to get product',
      message: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId, images, stock } = req.body;

    const { data: product, error } = await supabaseAdmin
      .from('productos')
      .insert([{
        nombre: name,
        descripcion: description,
        precio: price,
        categoria_id: categoryId,
        imagen_principal: images?.[0] || null, // Usar la primera imagen como principal
        stock: stock || 0
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      error: 'Failed to create product',
      message: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, images, stock } = req.body;

    // Map frontend fields to Spanish database fields
    const updateData = {};
    if (name !== undefined) updateData.nombre = name;
    if (description !== undefined) updateData.descripcion = description;
    if (price !== undefined) updateData.precio = price;
    if (categoryId !== undefined) updateData.categoria_id = categoryId;
    if (images !== undefined && images.length > 0) updateData.imagen_principal = images[0];
    if (stock !== undefined) updateData.stock = stock;

    const { data: product, error } = await supabaseAdmin
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      error: 'Failed to update product',
      message: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el producto existe antes de eliminarlo
    const { data: existingProduct, error: checkError } = await supabaseAdmin
      .from('productos')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    // Eliminar el producto (hard delete)
    const { error } = await supabaseAdmin
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      error: 'Failed to delete product',
      message: error.message
    });
  }
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
