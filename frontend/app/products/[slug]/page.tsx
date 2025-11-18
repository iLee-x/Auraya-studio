'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { productAPI } from '@/lib/api';
import { useCartStore } from '@/lib/store';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  category: number;
  category_name: string;
  image: string | null;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getBySlug(slug);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    setAdding(true);
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

    addItem({
      id: product.id,
      name: product.name,
      price,
      quantity,
      image: product.image,
    });

    setTimeout(() => {
      setAdding(false);
      router.push('/cart');
    }, 500);
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-primary-600">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-primary-900 mb-4">Product not found</h1>
          <Link href="/products" className="nav-link">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : product.image
    ? `http://localhost:8000${product.image}`
    : '/placeholder.png';

  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-primary-600">
            <Link href="/" className="hover:text-primary-900">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary-900">
              Shop
            </Link>
            <span>/</span>
            <Link
              href={`/products?category=${product.category_name.toLowerCase()}`}
              className="hover:text-primary-900"
            >
              {product.category_name}
            </Link>
            <span>/</span>
            <span className="text-primary-900">{product.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square relative bg-white rounded-sm overflow-hidden border border-primary-200">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-wider text-primary-500 mb-3">
                {product.category_name}
              </p>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-primary-900 mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-light text-primary-900 mb-6">
                ${price.toFixed(2)}
              </p>
              <p className="text-primary-700 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {/* Stock Info */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <p className="text-sm text-primary-600">
                  {product.stock} {product.stock === 1 ? 'item' : 'items'} in stock
                </p>
              ) : (
                <p className="text-sm text-accent-600 font-medium">Out of stock</p>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-8">
                <label className="block text-xs uppercase tracking-wider text-primary-600 mb-3">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={decrementQuantity}
                    className="w-10 h-10 border border-primary-300 rounded-sm hover:bg-primary-100 transition-colors flex items-center justify-center"
                    disabled={quantity <= 1}
                  >
                    <span className="text-xl text-primary-900">−</span>
                  </button>
                  <span className="text-lg font-light text-primary-900 w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="w-10 h-10 border border-primary-300 rounded-sm hover:bg-primary-100 transition-colors flex items-center justify-center"
                    disabled={quantity >= product.stock}
                  >
                    <span className="text-xl text-primary-900">+</span>
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            {product.stock > 0 ? (
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary w-full md:w-auto md:px-12"
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            ) : (
              <button
                disabled
                className="btn bg-primary-200 text-primary-500 cursor-not-allowed w-full md:w-auto md:px-12"
              >
                Out of Stock
              </button>
            )}

            {/* Additional Info */}
            <div className="mt-12 pt-8 border-t border-primary-200">
              <h3 className="text-xs uppercase tracking-wider text-primary-900 mb-4">
                Product Details
              </h3>
              <dl className="space-y-2">
                <div className="flex justify-between text-sm">
                  <dt className="text-primary-600">SKU</dt>
                  <dd className="text-primary-900 font-light">{product.slug.toUpperCase()}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-primary-600">Category</dt>
                  <dd className="text-primary-900 font-light">{product.category_name}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-primary-600">Availability</dt>
                  <dd className="text-primary-900 font-light">
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Back to Shop */}
        <div className="mt-16 text-center">
          <Link
            href="/products"
            className="text-sm uppercase tracking-wider text-primary-700 hover:text-primary-900 transition-colors inline-flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
