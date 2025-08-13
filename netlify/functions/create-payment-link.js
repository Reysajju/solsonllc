const Stripe = require('stripe');

exports.handler = async function(event, context) {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
  try {
    const { amount, currency = 'usd', description = '' } = JSON.parse(event.body);
    const product = await stripe.products.create({ name: description || 'Invoice Payment' });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency,
    });
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ url: paymentLink.url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Stripe error', details: err.message })
    };
  }
};
