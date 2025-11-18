'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface OrderItem {
  id: number;
  product_detail: {
    name: string;
  };
  quantity: number;
  price: string;
  subtotal: number;
}

interface Order {
  id: number;
  status: string;
  total_amount: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  payment_method: string;
  paid: boolean;
  items: OrderItem[];
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }
    loadOrders();
  }, [isAuthenticated, router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      const ordersData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-light tracking-tight text-primary-900 mb-8">
          Order History
        </h1>

        {orders.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-primary-600 mb-6">You haven't placed any orders yet.</p>
            <a href="/products" className="btn-primary inline-block">
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="card p-6">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-primary-200">
                  <div>
                    <h3 className="text-lg font-light text-primary-900 mb-1">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-primary-600">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-block px-3 py-1 rounded-sm text-xs uppercase tracking-wider font-medium mb-2 ${
                        STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </div>
                    <p className="text-lg font-medium text-primary-900">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="text-xs uppercase tracking-wider text-primary-600 mb-4">
                    Items
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <p className="text-primary-900 font-light">
                            {item.product_detail?.name || 'Product'}
                          </p>
                          <p className="text-sm text-primary-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="text-primary-900 font-medium">
                          ${parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="pt-4 border-t border-primary-200">
                  <h4 className="text-xs uppercase tracking-wider text-primary-600 mb-3">
                    Shipping To
                  </h4>
                  <div className="text-sm text-primary-700">
                    <p className="font-light">{order.shipping_name}</p>
                    <p>{order.shipping_address}</p>
                    <p>
                      {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                    </p>
                  </div>
                </div>

                {/* Delivery Status */}
                {order.status === 'delivered' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-sm">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ This order has been delivered
                    </p>
                  </div>
                )}
                {order.status === 'shipped' && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-sm">
                    <p className="text-sm text-purple-800 font-medium">
                      📦 Your order is on the way
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
