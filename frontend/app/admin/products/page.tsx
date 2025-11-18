'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { productAPI, categoryAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface Category {
  id: number;
  name: string;
  slug: string;
}

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
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!user?.is_staff) {
      router.push('/');
      return;
    }
    loadData();
  }, [isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll(),
      ]);

      const productsData = Array.isArray(productsRes.data)
        ? productsRes.data
        : productsRes.data?.results || [];

      const categoriesData = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data?.results || [];

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('stock', formData.stock || '0');
      data.append('category', formData.category);

      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingProduct) {
        await productAPI.update(editingProduct.slug, data);
      } else {
        await productAPI.create(data);
      }

      await loadData();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock.toString(),
      category: product.category.toString(),
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(slug);
      await loadData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
    });
    setImageFile(null);
    setEditingProduct(null);
  };

  const cancelForm = () => {
    setShowForm(false);
    resetForm();
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-light tracking-tight text-primary-900">
            Product Management
          </h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              + Add Product
            </button>
          )}
        </div>

        {/* Product Form */}
        {showForm && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-light text-primary-900 mb-6 uppercase tracking-wider">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input"
                />
                {editingProduct && !imageFile && editingProduct.image && (
                  <p className="text-xs text-primary-500 mt-2">
                    Current image will be kept if no new image is uploaded
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="btn bg-white text-primary-900 border border-primary-300 hover:bg-primary-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-100 border-b border-primary-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-primary-700 font-medium">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-primary-700 font-medium">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-primary-700 font-medium">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-primary-700 font-medium">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-primary-700 font-medium">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-primary-700 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-primary-600">
                      No products found. Add your first product to get started.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const imageUrl = product.image?.startsWith('http')
                      ? product.image
                      : product.image
                      ? `http://localhost:8000${product.image}`
                      : '/placeholder.png';

                    const price =
                      typeof product.price === 'string'
                        ? parseFloat(product.price)
                        : product.price;

                    return (
                      <tr key={product.id} className="hover:bg-primary-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-16 h-16 relative bg-primary-100 rounded-sm overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-light text-primary-900">{product.name}</div>
                          <div className="text-xs text-primary-500 mt-1">{product.slug}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-primary-700">
                          {product.category_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-primary-900 font-medium">
                          ${price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-primary-700">{product.stock}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-xs uppercase tracking-wider text-primary-700 hover:text-accent-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.slug)}
                              className="text-xs uppercase tracking-wider text-accent-600 hover:text-accent-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
