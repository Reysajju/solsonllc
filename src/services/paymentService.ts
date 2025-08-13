import { supabase } from '../lib/supabase';

// Generate Stripe payment link via Netlify Function or external backend
async function generateStripePaymentLink(amount: number, currency: string = 'usd', description: string = '', method: 'netlify' | 'external' = 'netlify'): Promise<string> {
  let endpoint = '';
  if (method === 'netlify') {
    endpoint = '/.netlify/functions/create-payment-link';
  } else {
    endpoint = 'https://your-backend-url.com/api/create-payment-link'; // Replace with your deployed backend URL
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, description }),
  });
  const data = await response.json();
  if (data.url) return data.url;
  throw new Error(data.error || 'Failed to generate payment link');
}

export const paymentService = {
  // Generate Stripe payment link
  generateStripePaymentLink,
  // Process payment (simulation for demo)
  async processPayment(invoiceId: string, paymentData: any): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: invoiceId,
          gateway: paymentData.gateway || 'demo',
          amount: paymentData.amount,
          status: 'pending',
          payment_data: paymentData,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate 90% success rate
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        // Update payment status
        await supabase
          .from('payments')
          .update({
            status: 'completed',
            gateway_transaction_id: `txn_${Date.now()}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id);

        // Update invoice status
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoiceId);

        return { success: true, transactionId: `txn_${Date.now()}` };
      } else {
        // Update payment status to failed
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id);

        // Update invoice status
        await supabase
          .from('invoices')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoiceId);

        return { success: false, error: 'Payment processing failed. Please try again.' };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false, error: 'An unexpected error occurred during payment processing.' };
    }
  },

  // Get payment history for invoice
  async getInvoicePayments(invoiceId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};