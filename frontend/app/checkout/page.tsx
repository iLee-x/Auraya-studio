'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/lib/store';
import { orderAPI, addressAPI, authAPI } from '@/lib/api';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

interface Address {
  id: number;
  label: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'demo'>('demo');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_email: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: '',
  });

  const hasPayPalConfig = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'your_paypal_client_id_here';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    } else if (items.length === 0) {
      router.push('/cart');
    } else {
      loadUserData();
    }
  }, [isAuthenticated, items.length, router]);

  const loadUserData = async () => {
    try {
      const [addressResponse, userResponse] = await Promise.all([
        addressAPI.getAll(),
        authAPI.getCurrentUser(),
      ]);

      const addressData = Array.isArray(addressResponse.data)
        ? addressResponse.data
        : addressResponse.data?.results || [];

      setAddresses(addressData);
      setUserEmail(userResponse.data.email || '');

      // Auto-fill with default address
      const defaultAddress = addressData.find((addr: Address) => addr.is_default);
      if (defaultAddress) {
        fillFormWithAddress(defaultAddress);
        setSelectedAddressId(defaultAddress.id);
      } else if (addressData.length > 0) {
        // If no default, use the first address
        fillFormWithAddress(addressData[0]);
        setSelectedAddressId(addressData[0].id);
      } else {
        // No saved addresses, just fill email
        setFormData(prev => ({
          ...prev,
          shipping_email: userResponse.data.email || '',
        }));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const fillFormWithAddress = (address: Address) => {
    setFormData({
      shipping_name: address.full_name,
      shipping_email: userEmail,
      shipping_address: `${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}`,
      shipping_city: address.city,
      shipping_state: address.state,
      shipping_zip: address.zip_code,
      shipping_country: address.country,
    });
  };

  const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addressId = parseInt(e.target.value);
    setSelectedAddressId(addressId);

    if (addressId === 0) {
      // New address selected
      setFormData({
        shipping_name: '',
        shipping_email: userEmail,
        shipping_address: '',
        shipping_city: '',
        shipping_state: '',
        shipping_zip: '',
        shipping_country: '',
      });
    } else {
      const address = addresses.find(addr => addr.id === addressId);
      if (address) {
        fillFormWithAddress(address);
      }
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-gold-500"></div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      const orderData = {
        ...formData,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await orderAPI.create(orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to create order', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCheckout = async () => {
    if (!formData.shipping_name || !formData.shipping_email || !formData.shipping_address) {
      alert('Please fill in all required shipping information');
      return;
    }

    try {
      const order = await createOrder();
      clearCart();
      alert(`Order #${order.id} placed successfully! (Demo mode - no payment processed)`);
      router.push('/');
    } catch (error) {
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-light tracking-tight text-primary-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <div className="card p-6">
          <h2 className="text-xl font-light text-primary-900 mb-6 uppercase tracking-wider">
            Shipping Information
          </h2>

          {/* Address Selector */}
          {addresses.length > 0 && (
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                Select Saved Address
              </label>
              <select
                value={selectedAddressId || 0}
                onChange={handleAddressSelect}
                className="input"
              >
                <option value={0}>Enter new address</option>
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label} - {addr.full_name}
                    {addr.is_default && ' (Default)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">Full Name</label>
              <input
                type="text"
                name="shipping_name"
                value={formData.shipping_name}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">Email</label>
              <input
                type="email"
                name="shipping_email"
                value={formData.shipping_email}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">Address</label>
              <input
                type="text"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">City</label>
                <input
                  type="text"
                  name="shipping_city"
                  value={formData.shipping_city}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">State</label>
                <input
                  type="text"
                  name="shipping_state"
                  value={formData.shipping_state}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="shipping_zip"
                  value={formData.shipping_zip}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">Country</label>
                <input
                  type="text"
                  name="shipping_country"
                  value={formData.shipping_country}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Payment */}
        <div>
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-light text-primary-900 mb-6 uppercase tracking-wider">Order Summary</h2>

            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${total().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="luxury-card">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Payment Method</h2>

            {/* Payment Method Selection */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setPaymentMethod('demo')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  paymentMethod === 'demo'
                    ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-pink-50 shadow-lg'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">Demo Payment</div>
                    <div className="text-sm text-gray-600">Complete order instantly (no actual payment)</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    paymentMethod === 'demo' ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'demo' && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>

              {hasPayPalConfig && (
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    paymentMethod === 'paypal'
                      ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-pink-50 shadow-lg'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">PayPal</div>
                      <div className="text-sm text-gray-600">Pay securely with PayPal</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      paymentMethod === 'paypal' ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'paypal' && (
                        <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Payment Content */}
            {paymentMethod === 'demo' ? (
              <button
                onClick={handleDemoCheckout}
                disabled={loading}
                className="btn-primary w-full text-lg"
              >
                {loading ? 'Processing...' : `Complete Order - $${total().toFixed(2)}`}
              </button>
            ) : hasPayPalConfig ? (
              <PayPalScriptProvider
                options={{
                  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                  currency: 'USD',
                }}
              >
                <PayPalButtons
                  createOrder={async (data, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            currency_code: 'USD',
                            value: total().toFixed(2),
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={async (data, actions) => {
                    const order = await createOrder();
                    await orderAPI.confirmPayment(order.id, data.orderID || '');
                    clearCart();
                    router.push('/');
                  }}
                  onError={(err) => {
                    console.error('PayPal error:', err);
                    alert('Payment failed. Please try again.');
                  }}
                />
              </PayPalScriptProvider>
            ) : null}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
