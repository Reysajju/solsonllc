require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function createPaymentLink(amount, currency = 'usd', description = '') {
  try {
    const product = await stripe.products.create({ name: description || 'Invoice Payment' });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency,
    });
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
    });
    return paymentLink.url;
  } catch (err) {
    console.error('Stripe error:', err);
    throw err;
  }
}

module.exports = { createPaymentLink };
