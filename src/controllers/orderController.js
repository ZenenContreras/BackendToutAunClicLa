const { supabaseAdmin } = require('../config/supabase');
const stripe = require('../config/stripe');

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(name, price, images)
        ),
        addresses(*)
      `, { count: 'exact' })
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
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
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(name, price, images)
        ),
        addresses(*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
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
      .from('cart_items')
      .select(`
        *,
        products(id, name, price, stock, is_active)
      `)
      .eq('user_id', userId);

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
      const product = item.products;
      
      if (!product.is_active) {
        return res.status(400).json({
          error: 'Product unavailable',
          message: `Product ${product.name} is no longer available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          message: `Only ${product.stock} units of ${product.name} available`
        });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Verify address belongs to user
    const { data: address, error: addressError } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', userId)
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
      .from('orders')
      .insert([{
        user_id: userId,
        address_id: addressId,
        total_amount: total,
        status: 'pending',
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
      order_id: order.id
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      throw itemsError;
    }

    // Update product stock
    for (const item of cartItems) {
      await supabaseAdmin
        .from('products')
        .update({ 
          stock: item.products.stock - item.quantity 
        })
        .eq('id', item.products.id);
    }

    // Clear cart
    await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    // Update order status to completed
    await supabaseAdmin
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', order.id);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...order,
        status: 'completed'
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
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }

    if (order.status !== 'pending') {
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
      .from('orders')
      .update({ status: 'cancelled' })
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
      sortBy = 'created_at', 
      sortOrder = 'desc' 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        users(first_name, last_name, email),
        order_items(
          *,
          products(name, price)
        ),
        addresses(*)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
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

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: ' + validStatuses.join(', ')
      });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
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

module.exports = {
  getUserOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
};
