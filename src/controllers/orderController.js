import { supabaseAdmin } from '../config/supabase.js';
import stripe from '../config/stripe.js';

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('pedidos')
      .select(`
        *,
        detalles_pedido(
          *,
          productos(nombre, precio, imagen_principal)
        ),
        direcciones_envio(*)
      `, { count: 'exact' })
      .eq('usuario_id', userId);

    if (status) {
      query = query.eq('estado', status);
    }

    query = query
      .order('fecha_pedido', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to get orders',
      message: error.message
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: order, error } = await supabaseAdmin
      .from('pedidos')
      .select(`
        *,
        detalles_pedido(
          *,
          productos(nombre, precio, imagen_principal)
        ),
        direcciones_envio(*)
      `)
      .eq('id', id)
      .eq('usuario_id', userId)
      .single();

    if (error || !order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Failed to get order',
      message: error.message
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId, paymentMethodId } = req.body;

    // Get cart items
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('carrito')
      .select(`
        *,
        productos(id, nombre, precio, stock)
      `)
      .eq('usuario_id', userId);

    if (cartError) {
      throw cartError;
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        error: 'Empty cart',
        message: 'Your cart is empty'
      });
    }

    // Validate stock and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = item.productos;
      
      // No hay campo 'activo', así que eliminamos esa validación

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          message: `Only ${product.stock} units of ${product.nombre} available`
        });
      }

      const itemTotal = product.precio * item.quantity;
      total += itemTotal;

      orderItems.push({
        producto_id: product.id,
        quantity: item.quantity,
        price: product.precio
      });
    }

    // Verify address belongs to user
    const { data: address, error: addressError } = await supabaseAdmin
      .from('direcciones_envio')
      .select('*')
      .eq('id', addressId)
      .eq('usuario_id', userId)
      .single();

    if (addressError || !address) {
      return res.status(400).json({
        error: 'Invalid address',
        message: 'The selected address does not exist'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/order-confirmation`
    });

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment failed',
        message: 'Payment could not be processed'
      });
    }

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('pedidos')
      .insert([{
        usuario_id: userId,
        direccion_envio_id: addressId,
        total: total,
        estado: 'pendiente',
        stripe_payment_intent_id: paymentIntent.id
      }])
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      pedido_id: order.id
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('detalles_pedido')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      throw itemsError;
    }

    // Update product stock
    for (const item of cartItems) {
      await supabaseAdmin
        .from('productos')
        .update({ 
          stock: item.productos.stock - item.quantity 
        })
        .eq('id', item.productos.id);
    }

    // Clear cart
    await supabaseAdmin
      .from('carrito')
      .delete()
      .eq('usuario_id', userId);

    // Update order status to completed
    await supabaseAdmin
      .from('pedidos')
      .update({ estado: 'completado' })
      .eq('id', order.id);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...order,
        estado: 'completado'
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', userId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }

    if (order.estado !== 'pendiente') {
      return res.status(400).json({
        error: 'Cannot cancel order',
        message: 'Only pending orders can be cancelled'
      });
    }

    // Cancel Stripe payment intent if exists
    if (order.stripe_payment_intent_id) {
      await stripe.paymentIntents.cancel(order.stripe_payment_intent_id);
    }

    // Update order status
    const { error } = await supabaseAdmin
      .from('pedidos')
      .update({ estado: 'cancelado' })
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      error: 'Failed to cancel order',
      message: error.message
    });
  }
};

// Admin functions
const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      sortBy = 'fecha_creacion', 
      sortOrder = 'desc' 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('pedidos')
      .select(`
        *,
        usuarios(nombre, correo_electronico),
        detalles_pedido(
          *,
          productos(nombre, precio)
        ),
        direcciones_envio(*)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('estado', status);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      error: 'Failed to get orders',
      message: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: ' + validStatuses.join(', ')
      });
    }

    const { data: order, error } = await supabaseAdmin
      .from('pedidos')
      .update({ estado: status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: error.message
    });
  }
};

export {
  getUserOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
};
