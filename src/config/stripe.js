import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from './env.js';

if (!STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = Stripe(STRIPE_SECRET_KEY);

export default stripe;
