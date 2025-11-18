'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { useToastStore } from './Toast';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  image?: string;
  category_name?: string;
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const addToast = useToastStore((state) => state.addToast);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image: product.image,
    });
    addToast(`${product.name} added to cart!`, 'success');
  };

  const imageUrl = product.image
    ? product.image.startsWith('http')
      ? product.image
      : `http://localhost:8000${product.image}`
    : '/placeholder-product.jpg';

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  return (
    <Link href={`/products/${product.slug}`} className="card group">
      <div className="aspect-square relative overflow-hidden bg-primary-100">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:opacity-90 transition-opacity duration-200"
        />
      </div>

      <div className="p-4">
        <div className="mb-3">
          {product.category_name && (
            <p className="text-xs uppercase tracking-wider text-primary-500 mb-1 font-medium">{product.category_name}</p>
          )}
          <h3 className="font-light text-lg text-primary-900 line-clamp-2">{product.name}</h3>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-primary-900">
            ${price.toFixed(2)}
          </span>

          <button
            onClick={handleAddToCart}
            className="text-xs uppercase tracking-wider text-primary-900 hover:text-accent-600 transition-colors font-medium"
          >
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
