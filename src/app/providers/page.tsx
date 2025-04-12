"use client";
import { useEffect, useState } from 'react';
import {
  ArrowPathIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('../components/ProvidersMap'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
});

interface Provider {
  _id: string;
  name: string;
  email: string;
  phone: string;
  fssai: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  organizationName?: string;
  isOnline: boolean;
  lastSeen: string;
  role: string;
}

export default function ProvidersList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        console.log('Fetching providers from API...');
        const res = await fetch('/api/providers');
        const data = await res.json();

        if (!res.ok) {
          console.error('API Error:', data);
          throw new Error(data.error || data.message || 'Failed to fetch providers');
        }

        if (!data.success) {
          throw new Error(data.message || 'Failed to load provider data');
        }

        console.log('Providers data received:', data.providers);
        setProviders(data.providers);
        setError('');
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load providers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
    } catch {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-500" />
        <span className="ml-3 text-lg">Loading providers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <ExclamationCircleIcon className="h-12 w-12 mx-auto text-red-500" />
          <h2 className="text-xl font-bold mt-4">Error Loading Providers</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-3"
            >
              Try Again
            </button>
            <button
              onClick={() => setError('')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Food Providers Directory</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Providers List */}
        <div className="lg:col-span-1 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700">
              {providers.length} {providers.length === 1 ? 'Provider' : 'Providers'} Available
            </h2>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {providers.length > 0 ? (
              providers.map((provider) => (
                <div
                  key={provider._id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${selectedProvider?._id === provider._id ? 'bg-blue-50' : ''
                    }`}
                  onClick={() => setSelectedProvider(provider)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`h-3 w-3 rounded-full mt-2 flex-shrink-0 ${provider.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {provider.organizationName || provider.name}
                      </h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{provider.address}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {provider.phone}
                        </span>
                        {provider.fssai && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            FSSAI
                          </span>
                        )}
                      </div>
                      {/* Add this contact button section */}
                      <div className="mt-3">
                        <a
                          href={`tel:${provider.phone}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()} // Prevent triggering the parent onClick
                        >
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          Call Now
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-4" />
                <p>No providers found</p>
              </div>
            )}
          </div>
        </div>

        {/* Provider Details and Map */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProvider ? (
            <>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedProvider.organizationName || selectedProvider.name}
                      </h2>
                      {selectedProvider.organizationName && (
                        <p className="text-gray-600">{selectedProvider.name}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedProvider.isOnline
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {selectedProvider.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-900">{selectedProvider.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-sm font-medium text-gray-900">{selectedProvider.phone}</p>
                          </div>
                        </div>
                        {selectedProvider.fssai && (
                          <div className="flex items-start">
                            <ShieldCheckIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">FSSAI License</p>
                              <p className="text-sm font-medium text-gray-900 font-mono">{selectedProvider.fssai}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Location Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="text-sm font-medium text-gray-900">{selectedProvider.address}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <GlobeAltIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Coordinates</p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedProvider.coordinates.lat.toFixed(6)}, {selectedProvider.coordinates.lng.toFixed(6)}
                            </p>
                          </div>
                        </div>
                        {!selectedProvider.isOnline && (
                          <div className="flex items-start">
                            <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Last Seen</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(selectedProvider.lastSeen)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg overflow-hidden h-96">
                <MapWithNoSSR
                  providers={providers}
                  selectedProvider={selectedProvider}
                  onSelectProvider={setSelectedProvider}
                />
              </div>
            </>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden h-full flex items-center justify-center">
              <div className="text-center p-8">
                <BuildingOfficeIcon className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Select a Provider</h3>
                <p className="mt-1 text-gray-500">
                  {providers.length > 0
                    ? "Click on a provider from the list to view details"
                    : "No providers available to display"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}