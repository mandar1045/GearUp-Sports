import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, QrCode, Copy, Check, AlertCircle, Loader, CreditCard, Wallet, Shield } from 'lucide-react';
import { 
  loadRazorpayScript, 
  createRazorpayOrder, 
  verifyPaymentSignature,
  getPaymentDetails,
  RAZORPAY_CONFIG 
} from '../utils/razorpayConfig';
import { PaymentResponse } from '../types/Payment';
import { formatCurrency } from '../utils/currency';

interface RazorpayUPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess: (response: PaymentResponse) => void;
  onPaymentFailure: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayUPIModal: React.FC<RazorpayUPIModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderId,
  customerInfo,
  onPaymentSuccess,
  onPaymentFailure
}) => {
  const [paymentStep, setPaymentStep] = useState<'loading' | 'ready' | 'processing' | 'success' | 'failed'>('loading');
  const [razorpayOrder, setRazorpayOrder] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializePayment();
    }
  }, [isOpen]);

  const initializePayment = async () => {
    setPaymentStep('loading');
    setError('');

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order
      const order = await createRazorpayOrder(amount, orderId);
      setRazorpayOrder(order);
      setPaymentStep('ready');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(errorMessage);
      setPaymentStep('failed');
    }
  };

  const handleUPIPayment = () => {
    if (!razorpayOrder || !window.Razorpay) {
      setError('Payment system not ready');
      return;
    }

    setPaymentStep('processing');

    const options = {
      key: RAZORPAY_CONFIG.key_id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: RAZORPAY_CONFIG.name,
      description: `Order ${orderId}`,
      image: RAZORPAY_CONFIG.image,
      order_id: razorpayOrder.id,
      method: {
        upi: true,
        card: false,
        netbanking: false,
        wallet: false,
        emi: false,
        paylater: false
      },
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone
      },
      theme: RAZORPAY_CONFIG.theme,
      modal: {
        ondismiss: () => {
          setPaymentStep('ready');
        }
      },
      handler: async (response: any) => {
        try {
          // Verify payment signature
          const isVerified = await verifyPaymentSignature(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );

          if (isVerified) {
            // Get payment details
            const paymentDetails = await getPaymentDetails(response.razorpay_payment_id);
            
            const successResponse: PaymentResponse = {
              success: true,
              transactionId: response.razorpay_payment_id,
              paymentId: response.razorpay_payment_id,
              orderId: orderId,
              amount: amount,
              status: 'success',
              method: 'UPI via Razorpay',
              timestamp: new Date().toISOString()
            };

            setPaymentResponse(successResponse);
            setPaymentStep('success');
            onPaymentSuccess(successResponse);
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Payment verification failed';
          setError(errorMessage);
          setPaymentStep('failed');
          onPaymentFailure(errorMessage);
        }
      }
    };

    const razorpayInstance = new window.Razorpay(options);
    
    razorpayInstance.on('payment.failed', (response: any) => {
      const errorMessage = response.error?.description || 'Payment failed';
      setError(errorMessage);
      setPaymentStep('failed');
      onPaymentFailure(errorMessage);
    });

    razorpayInstance.open();
  };

  const handleRetry = () => {
    setError('');
    initializePayment();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div 
          className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-premium-lg rounded-2xl relative z-10"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Secure UPI Payment</h2>
                <p className="text-white/80 text-sm">Powered by Razorpay</p>
              </div>
            </div>

            {/* Amount Display */}
            <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">Total Amount:</span>
                <div className="text-right">
                  <div className="text-xl font-bold">{formatCurrency(amount)}</div>
                  <div className="text-xs text-white/60">Order: {orderId}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Loading State */}
              {paymentStep === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Initializing Payment</h3>
                  <p className="text-gray-600">Setting up secure payment gateway...</p>
                </motion.div>
              )}

              {/* Ready State */}
              {paymentStep === 'ready' && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <Smartphone className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">UPI Payment Ready</h3>
                    <p className="text-gray-600 mb-4">
                      Click below to open UPI payment options. You can pay using any UPI app like GPay, PhonePe, Paytm, etc.
                    </p>
                  </div>

                  {/* Security Features */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Secure Payment</span>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 256-bit SSL encryption</li>
                      <li>• PCI DSS compliant</li>
                      <li>• Real-time transaction verification</li>
                      <li>• Instant payment confirmation</li>
                    </ul>
                  </div>

                  <motion.button
                    onClick={handleUPIPayment}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Smartphone className="h-5 w-5" />
                    <span>Pay with UPI</span>
                  </motion.button>

                  <p className="text-xs text-gray-500 text-center">
                    By proceeding, you agree to Razorpay's terms and conditions
                  </p>
                </motion.div>
              )}

              {/* Processing State */}
              {paymentStep === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h3>
                  <p className="text-gray-600 mb-4">Please complete the payment in your UPI app</p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Don't close this window. We're verifying your transaction...
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Success State */}
              {paymentStep === 'success' && paymentResponse && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="h-8 w-8 text-green-600" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 mb-6">Your payment has been verified and processed successfully.</p>
                  
                  <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Transaction ID:</span>
                        <p className="font-semibold text-green-800 font-mono text-xs">
                          {paymentResponse.transactionId}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <p className="font-semibold text-green-800">{formatCurrency(paymentResponse.amount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Method:</span>
                        <p className="font-semibold text-green-800">{paymentResponse.method}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <p className="font-semibold text-green-800 capitalize">{paymentResponse.status}</p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={onClose}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue Shopping
                  </motion.button>
                </motion.div>
              )}

              {/* Failed State */}
              {paymentStep === 'failed' && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h3>
                  <p className="text-gray-600 mb-6">{error || 'Something went wrong. Please try again.'}</p>
                  
                  <div className="flex space-x-3">
                    <motion.button
                      onClick={handleRetry}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Try Again
                    </motion.button>
                    <motion.button
                      onClick={onClose}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RazorpayUPIModal;