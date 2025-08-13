
import dotenv from 'dotenv';
import Stripe from 'stripe';
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });

const amount = 1000; // $10.00
const currency = 'usd';
const description = 'Test Invoice';

async function runStripeTest() {
  try {
    const product = await stripe.products.create({ name: description });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency,
    });
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
    });
    console.log('Stripe Payment Link:', paymentLink.url);
  } catch (err) {
    console.error('Stripe error:', err);
  }
}

runStripeTest();
