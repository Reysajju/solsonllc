import { supabase } from '../lib/supabase';

export const paymentService = {
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