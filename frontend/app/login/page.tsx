'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const response = await authAPI.login(formData.username, formData.password);

      login(
        response.data.access,
        response.data.refresh,
        {
          id: response.data.user?.id || 0,
          username: formData.username,
          email: response.data.user?.email || '',
          is_staff: response.data.user?.is_staff || false,
        }
      );

      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-light tracking-tight text-primary-900 mb-2">
            Welcome back
          </h2>
          <p className="text-primary-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary-900 hover:text-accent-600 transition-colors underline">
              Sign up
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-accent-50 border border-accent-200 text-accent-700 px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-primary-900 mb-2 uppercase tracking-wider">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-900 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center pt-4 border-t border-primary-200">
            <p className="text-xs text-primary-500 mb-1 uppercase tracking-wider">Demo credentials</p>
            <p className="font-mono text-sm text-primary-900">admin / admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
