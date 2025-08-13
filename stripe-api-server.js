import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
dotenv.config();

const app = express();
app.use(express.json());
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });

app.post('/api/create-payment-link', async (req, res) => {
  const { amount, currency = 'usd', description = '' } = req.body;
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
    res.json({ url: paymentLink.url });
  } catch (err) {
    res.status(500).json({ error: 'Stripe error', details: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Stripe API server running on port ${PORT}`);
});
