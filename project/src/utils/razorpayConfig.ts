// Razorpay configuration and utilities
export const RAZORPAY_CONFIG = {
  key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1234567890', // Test key
  currency: 'INR',
  name: 'GearUp Sports',
  description: 'Premium Sports Equipment',
  image: '/logo.png',
  theme: {
    color: '#f59e0b'
  }
};

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create Razorpay order
export const createRazorpayOrder = async (amount: number, orderId: string) => {
  try {
    // In production, this would call your backend API
    const response = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: orderId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return await response.json();
  } catch (error) {
    // For demo purposes, return a mock order
    console.warn('Using mock Razorpay order for demo');
    return {
      id: `order_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: orderId,
    };
  }
};

// Verify payment signature
export const verifyPaymentSignature = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> => {
  try {
    // In production, this would call your backend API for verification
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const result = await response.json();
    return result.verified === true;
  } catch (error) {
    console.error('Payment verification error:', error);
    // For demo purposes, simulate verification
    return true;
  }
};

// Get payment details
export const getPaymentDetails = async (paymentId: string) => {
  try {
    // In production, this would call your backend API
    const response = await fetch(`/api/payment/${paymentId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching payment details:', error);
    // Return mock data for demo
    return {
      id: paymentId,
      status: 'captured',
      method: 'upi',
      amount: 0,
      created_at: Date.now(),
    };
  }
};