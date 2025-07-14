import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, CheckCircle, DollarSign, Gift, AlertOctagon, Loader } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// You would replace this with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51Rihe2ProE9pnqDm18L6nTZD0fJb8K851Zzjq7IPN3okNOuMsmKPDjejJkUfgWBxf2J0kF7Zq51kb2qygrPjt3C700AMCjGrHV');

interface PaymentModalProps {
  onClose: () => void;
  onPaymentComplete: () => void;
  templateId: string;
}

const PaymentForm: React.FC<{
  onPaymentComplete: () => void;
  templateId: string;
  onClose: () => void;
}> = ({ onPaymentComplete, templateId, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [succeeded, setSucceeded] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [promoCodeApplied, setPromoCodeApplied] = useState<boolean>(false);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [checkingPromo, setCheckingPromo] = useState<boolean>(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(22); // Initial price in USD

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      setProcessing(true);
      try {
        console.log('Creating payment intent for amount:', total * 100);
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: total * 100, // Convert to cents
            currency: 'usd',
            metadata: {
              templateId: templateId,
              type: 'template_export'
            }
          }),
        });

        if (!response.ok) { 
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        
        if (!data.clientSecret) {
          throw new Error('No client secret returned from payment intent creation');
        }
        
        setPaymentIntentId(data.paymentIntentId);
        setClientSecret(data.clientSecret);
        console.log('Payment intent created successfully');
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(`Failed to initialize payment: ${err.message || 'Unknown error'}`);
      } finally {
        setProcessing(false);
      }
    };

    createPaymentIntent();
  }, [total, templateId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      console.error('Missing required payment elements:', {
        hasStripe: !!stripe,
        hasElements: !!elements,
        hasClientSecret: !!clientSecret
      });
      setError('Payment form not properly initialized');
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Payment form not properly initialized');
      setProcessing(false);
      return;
    }

    try {
      if (!clientSecret.includes('_secret_')) {
        throw new Error('Invalid client secret format');
      }
      
      console.log('Confirming card payment with client secret');
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { 
          card: cardElement, 
        }
      });

      if (error) {
        setError(error.message || 'An error occurred during payment.');
        setProcessing(false);
        console.error('Error creating payment intent:', error);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        setProcessing(false);
        
        try {
          // Record payment in database
          await supabase.from('stripe_orders').insert({
            checkout_session_id: paymentIntent.id,
            payment_intent_id: paymentIntent.id,
            customer_id: 'anonymous', // You'd use the actual customer ID here if available
            amount_subtotal: Math.round(total * 100), 
            amount_total: Math.round(total * 100), 
            currency: 'usd',
            payment_status: 'paid',
            status: 'completed'
          });
        } catch (dbError) {
          console.error('Error recording payment in database:', dbError);
          // Don't fail the process if DB recording fails - user has already paid
        }
        
        // Notify parent component that payment is complete
        setTimeout(() => {
          onPaymentComplete();
        }, 2000);
      } else {
        setError('Payment processing error. Please try again.');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      try {
        setError(`Payment processing failed: ${err.message || 'Unknown error'}`);
      } finally {
        setProcessing(false); 
      }
    }
  };

  const handlePromoCodeApply = async () => {
    if (!promoCode.trim()) return;
    
    setCheckingPromo(true);
    setError(null);
    
    try {
      // Call Supabase function to validate promo code
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-promo-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promoCode: promoCode.trim(),
          productType: 'template_export'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate promo code');
      }

      const data = await response.json();
      
      if (data.valid) {
        setPromoCodeApplied(true);
        setPromoDiscount(data.discount); // Percentage discount
        
        // Calculate new total
        const newTotal = Math.max(0, 22 * (1 - data.discount / 100));
        setTotal(parseFloat(newTotal.toFixed(2)));
        
        // Update payment intent with new amount
        if (paymentIntentId) {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-payment-intent`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId,
              amount: newTotal * 100 // Convert to cents
            }),
          });
        }
      } else {
        setError('Invalid promo code. Please try another.');
      }
    } catch (err) {
      console.error('Error validating promo code:', err);
      setError('Failed to validate promo code. Please try again.');
    } finally {
      setCheckingPromo(false);
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    },
    hidePostalCode: true
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {succeeded ? (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center bg-green-600/20 rounded-full w-20 h-20 mx-auto">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-white">Payment Successful!</h3>
          <p className="text-gray-400">Your template export is being prepared...</p>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Card Details
            </label>
            <div className="p-4 border border-gray-600 rounded-lg bg-gray-800/50">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-white">Promo Code</label>
              {promoCodeApplied && (
                <span className="text-sm text-green-400 flex items-center gap-1">
                  <CheckCircle size={14} />
                  {promoDiscount}% off applied
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={promoCodeApplied || processing}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white w-full focus:border-purple-500 focus:outline-none"
                placeholder="Enter promo code"
              />
              
              {!promoCodeApplied ? (
                <button
                  type="button"
                  onClick={handlePromoCodeApply}
                  disabled={!promoCode.trim() || checkingPromo || processing}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50 transition-colors"
                >
                  {checkingPromo ? (
                    <Loader className="animate-spin h-5 w-5" />
                  ) : (
                    'Apply'
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPromoCodeApplied(false);
                    setPromoDiscount(0);
                    setPromoCode('');
                    setTotal(22);
                  }}
                  className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center text-white mb-4">
              <span>Template Export</span>
              <span>$22.00</span>
            </div>
            
            {promoCodeApplied && (
              <div className="flex justify-between items-center text-green-400 mb-4">
                <span>Discount ({promoDiscount}%)</span>
                <span>-${(22 * promoDiscount / 100).toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center text-lg font-semibold text-white mb-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-400 text-sm">
              <div className="flex items-center gap-2">
                <AlertOctagon size={16} />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex-1"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!stripe || processing || succeeded}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>Pay ${total.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onPaymentComplete, templateId }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pt-24"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <DollarSign size={24} className="text-purple-500" />
            <h2 className="text-xl font-semibold text-white">Template Export Payment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300">
            Export this template as a high-resolution PDF or image for just <span className="font-semibold text-white">$22</span>.
          </p>
          <div className="mt-4 bg-gray-700/50 p-3 rounded-lg flex items-start gap-3 text-gray-300">
            <Gift className="text-purple-400 mt-1 flex-shrink-0" size={18} />
            <div className="text-sm">
              <p>Use a promo code for a discount on your export.</p>
              <p className="text-gray-400 mt-1">Get high-quality files perfect for printing or digital sharing.</p>
            </div>
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm 
            onPaymentComplete={onPaymentComplete} 
            templateId={templateId}
            onClose={onClose}
          />
        </Elements>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal;