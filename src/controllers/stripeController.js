const stripe = require('../config/stripe');
const { supabaseAdmin } = require('../config/supabase');

const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        user_id: userId
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error.message
    });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId
    });

    res.json({
      status: paymentIntent.status,
      paymentIntent
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      message: error.message
    });
  }
};

const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's Stripe customer ID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!user || !user.stripe_customer_id) {
      return res.json({ paymentMethods: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripe_customer_id,
      type: 'card'
    });

    res.json({
      paymentMethods: paymentMethods.data
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      error: 'Failed to get payment methods',
      message: error.message
    });
  }
};

const savePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethodId } = req.body;

    // Get or create Stripe customer
    let { data: user } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: userId
        }
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });

    res.json({
      message: 'Payment method saved successfully'
    });
  } catch (error) {
    console.error('Save payment method error:', error);
    res.status(500).json({
      error: 'Failed to save payment method',
      message: error.message
    });
  }
};

const deletePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;

    await stripe.paymentMethods.detach(paymentMethodId);

    res.json({
      message: 'Payment method removed successfully'
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      error: 'Failed to remove payment method',
      message: error.message
    });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update order status if this is related to an order
        if (paymentIntent.metadata.order_id) {
          await supabaseAdmin
            .from('orders')
            .update({ 
              status: 'completed',
              stripe_payment_intent_id: paymentIntent.id
            })
            .eq('id', paymentIntent.metadata.order_id);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        // Update order status if this is related to an order
        if (failedPayment.metadata.order_id) {
          await supabaseAdmin
            .from('orders')
            .update({ status: 'payment_failed' })
            .eq('id', failedPayment.metadata.order_id);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      error: 'Webhook handler failed',
      message: error.message
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  savePaymentMethod,
  deletePaymentMethod,
  handleWebhook
};
