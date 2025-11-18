'use client';

import { useState, useEffect } from 'react';
import { authAPI, profileAPI, addressAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

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
  country_display: string;
  phone?: string;
  is_default: boolean;
}

interface Profile {
  phone?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'IN', name: 'India' },
];

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Address form
  const [addressForm, setAddressForm] = useState({
    label: '',
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    phone: '',
    is_default: false,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadUserData();
  }, [user, router]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userResponse, addressesResponse] = await Promise.all([
        authAPI.getCurrentUser(),
        addressAPI.getAll(),
      ]);

      const userData = userResponse.data;
      setFirstName(userData.first_name || '');
      setLastName(userData.last_name || '');
      setEmail(userData.email || '');
      setPhone(userData.profile?.phone || '');

      const addressData = Array.isArray(addressesResponse.data)
        ? addressesResponse.data
        : addressesResponse.data?.results || [];
      setAddresses(addressData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await profileAPI.update({
        first_name: firstName,
        last_name: lastName,
        phone,
      });
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingAddress) {
        await addressAPI.update(editingAddress.id, addressForm);
      } else {
        await addressAPI.create(addressForm);
      }
      await loadUserData();
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
    } catch (error) {
      console.error('Failed to save address:', error);
      alert('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await addressAPI.delete(id);
      await loadUserData();
    } catch (error) {
      console.error('Failed to delete address:', error);
      alert('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressAPI.setDefault(id);
      await loadUserData();
    } catch (error) {
      console.error('Failed to set default address:', error);
      alert('Failed to set default address');
    }
  };

  const startEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label,
      full_name: address.full_name,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      country: address.country,
      phone: address.phone || '',
      is_default: address.is_default,
    });
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: '',
      full_name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'US',
      phone: '',
      is_default: false,
    });
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    resetAddressForm();
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
          Profile
        </h1>

        {/* Profile Information */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-light text-primary-900 mb-6 uppercase tracking-wider">
            Personal Information
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                className="input bg-primary-100"
                disabled
              />
              <p className="text-xs text-primary-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Addresses */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-light text-primary-900 uppercase tracking-wider">
              Addresses
            </h2>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-sm uppercase tracking-wider text-primary-900 hover:text-accent-600 transition-colors"
              >
                + Add New
              </button>
            )}
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <form onSubmit={handleAddressSubmit} className="mb-8 p-6 bg-primary-50 rounded-sm">
              <h3 className="text-lg font-light text-primary-900 mb-4 uppercase tracking-wider">
                {editingAddress ? 'Edit Address' : 'New Address'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                    Label (e.g., Home, Work)
                  </label>
                  <input
                    type="text"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={addressForm.full_name}
                    onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={addressForm.address_line1}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressForm.address_line2}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                      Zip/Postal Code
                    </label>
                    <input
                      type="text"
                      value={addressForm.zip_code}
                      onChange={(e) => setAddressForm({ ...addressForm, zip_code: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                    Country
                  </label>
                  <select
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="input"
                    required
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-primary-600 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_default" className="text-sm text-primary-700">
                    Set as default address
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelAddressForm}
                    className="btn bg-white text-primary-900 border border-primary-300 hover:bg-primary-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Address List */}
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <p className="text-primary-600 text-center py-8">
                No addresses saved yet.
              </p>
            ) : (
              addresses.map((address) => (
                <div
                  key={address.id}
                  className="p-4 border border-primary-200 rounded-sm hover:border-primary-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs uppercase tracking-wider text-primary-900 font-medium">
                          {address.label}
                        </span>
                        {address.is_default && (
                          <span className="text-xs uppercase tracking-wider bg-accent-100 text-accent-700 px-2 py-1 rounded-sm">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-primary-900 font-light">{address.full_name}</p>
                      <p className="text-primary-700 text-sm">
                        {address.address_line1}
                        {address.address_line2 && `, ${address.address_line2}`}
                      </p>
                      <p className="text-primary-700 text-sm">
                        {address.city}, {address.state} {address.zip_code}
                      </p>
                      <p className="text-primary-700 text-sm">{address.country_display}</p>
                      {address.phone && (
                        <p className="text-primary-700 text-sm">{address.phone}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="text-xs uppercase tracking-wider text-primary-700 hover:text-accent-600 transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => startEditAddress(address)}
                        className="text-xs uppercase tracking-wider text-primary-700 hover:text-accent-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-xs uppercase tracking-wider text-accent-600 hover:text-accent-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
