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
  user_email: string;
  status: string;
  total_amount: string;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  payment_method: string;
  paid: boolean;
  items: OrderItem[];
  created_at: string;
}

const STATUS_CHOICES = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!user?.is_staff) {
      router.push('/');
      return;
    }
    loadOrders();
  }, [isAuthenticated, user, router]);

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

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(true);
      await orderAPI.updateStatus(orderId, newStatus);
      await loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-light tracking-tight text-primary-900 mb-8">
          Order Management
        </h1>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="card p-8 text-center text-primary-600">
              No orders found.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-light text-primary-900 mb-2">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-primary-600">
                      Customer: {order.shipping_name} ({order.user_email})
                    </p>
                    <p className="text-sm text-primary-600">
                      Placed: {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-block px-3 py-1 rounded-sm text-xs uppercase tracking-wider font-medium mb-2 ${
                        STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status}
                    </div>
                    <p className="text-lg font-medium text-primary-900">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </p>
                    {order.paid && (
                      <span className="text-xs text-green-600 uppercase tracking-wider">
                        Paid
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-primary-200 pt-4 mb-4">
                  <h4 className="text-xs uppercase tracking-wider text-primary-600 mb-3">
                    Items
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-primary-700">
                          {item.product_detail?.name || 'Deleted Product'} x {item.quantity}
                        </span>
                        <span className="text-primary-900">
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t border-primary-200 pt-4 mb-4">
                  <h4 className="text-xs uppercase tracking-wider text-primary-600 mb-3">
                    Shipping Address
                  </h4>
                  <div className="text-sm text-primary-700">
                    <p>{order.shipping_name}</p>
                    <p>{order.shipping_address}</p>
                    <p>
                      {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                    </p>
                    <p>{order.shipping_country}</p>
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t border-primary-200 pt-4">
                  <h4 className="text-xs uppercase tracking-wider text-primary-600 mb-3">
                    Update Status
                  </h4>
                  <div className="flex gap-2">
                    {STATUS_CHOICES.map((statusOption) => (
                      <button
                        key={statusOption.value}
                        onClick={() => handleStatusUpdate(order.id, statusOption.value)}
                        disabled={updating || order.status === statusOption.value}
                        className={`px-4 py-2 rounded-sm text-xs uppercase tracking-wider transition-colors ${
                          order.status === statusOption.value
                            ? 'bg-primary-900 text-white cursor-default'
                            : 'bg-white text-primary-700 border border-primary-300 hover:bg-primary-100'
                        }`}
                      >
                        {statusOption.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
