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
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('../components/ProvidersMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">
    <div className="animate-pulse flex space-x-4">
      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
    </div>
  </div>
});

interface Provider {
  _id: string;
  name: string;
  email: string;
  phone: string;
  fssai: string;
  address: string;
  coordinates: { lat: number; lng: number };
  organizationName?: string;
  isOnline: boolean;
  lastSeen: string;
  role: string;
}

export default function ProvidersList() {
  const [state, setState] = useState({
    providers: [] as Provider[],
    isLoading: true,
    error: '',
    selectedProvider: null as Provider | null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/providers');
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || data.message || 'Failed to fetch');
        if (!data.success) throw new Error(data.message || 'Invalid data format');

        setState(prev => ({
          ...prev,
          providers: data.providers,
          isLoading: false,
          error: '',
          selectedProvider: data.providers[0] || null
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to load providers',
          isLoading: false
        }));
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Unknown' : new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const { providers, isLoading, error, selectedProvider } = state;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Food Providers Network</h1>
            <p className="mt-2 text-gray-600">Discover and connect with local food providers</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {providers.length} {providers.length === 1 ? 'Provider' : 'Providers'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProviderListSection 
            providers={providers} 
            selectedProvider={selectedProvider}
            onSelect={(provider) => setState(prev => ({...prev, selectedProvider: provider}))}
          />
          
          <div className="lg:col-span-2 space-y-6">
            {selectedProvider ? (
              <>
                <ProviderDetails provider={selectedProvider} formatDate={formatDate} />
                <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[400px] border border-gray-200">
                  <MapWithNoSSR
                    providers={providers}
                    selectedProvider={selectedProvider}
                    onSelectProvider={(provider) => setState(prev => ({...prev, selectedProvider: provider}))}
                  />
                </div>
              </>
            ) : (
              <EmptyState hasProviders={providers.length > 0} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="p-6 max-w-sm w-full bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col items-center">
        <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Loading Providers</h2>
        <p className="mt-2 text-gray-500 text-center">We're gathering the latest provider information for you</p>
      </div>
    </div>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="p-6 max-w-sm w-full bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col items-center text-center">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Connection Error</h2>
        <p className="mt-2 text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Retry Connection
        </button>
      </div>
    </div>
  </div>
);

const ProviderListSection = ({ providers, selectedProvider, onSelect }: {
  providers: Provider[];
  selectedProvider: Provider | null;
  onSelect: (provider: Provider) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Provider Directory</h2>

      </div>
    </div>
    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
      {providers.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {providers.map((provider) => (
            <ProviderListItem 
              key={provider._id} 
              provider={provider} 
              isSelected={selectedProvider?._id === provider._id}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : (
        <EmptyListState />
      )}
    </div>
  </div>
);

const ProviderListItem = ({ provider, isSelected, onSelect }: {
  provider: Provider;
  isSelected: boolean;
  onSelect: (provider: Provider) => void;
}) => (
  <li
    className={`p-4 cursor-pointer transition-colors ${
      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
    }`}
    onClick={() => onSelect(provider)}
  >
    <div className="flex items-start space-x-3">
      <div className={`h-2.5 w-2.5 rounded-full mt-2.5 flex-shrink-0 ${
        provider.isOnline ? 'bg-green-500' : 'bg-gray-300'
      }`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {provider.organizationName || provider.name}
          </h3>
          <ChevronRightIcon className={`h-5 w-5 text-gray-400 flex-shrink-0 ${
            isSelected ? 'text-blue-500' : ''
          }`} />
        </div>
        <div className="flex items-center mt-1 text-sm text-gray-500">
          <MapPinIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{provider.address}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ContactBadge icon={PhoneIcon} text={provider.phone} />
          {provider.fssai && <FSSAIBadge />}
        </div>
        <CallButton phone={provider.phone} />
      </div>
    </div>
  </li>
);

const ContactBadge = ({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>, text: string }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
    <Icon className="h-3 w-3 mr-1.5" />
    {text}
  </span>
);

const FSSAIBadge = () => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
    <ShieldCheckIcon className="h-3 w-3 mr-1.5" />
    FSSAI Certified
  </span>
);

const CallButton = ({ phone }: { phone: string }) => (
  <div className="mt-3">
    <a
      href={`tel:${phone}`}
      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <PhoneIcon className="h-3 w-3 mr-1.5" />
      Call Now
    </a>
  </div>
);

const ProviderDetails = ({ provider, formatDate }: {
  provider: Provider;
  formatDate: (date: string) => string;
}) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {provider.organizationName || provider.name}
          </h2>
          {provider.organizationName && (
            <p className="text-gray-600 mt-1">{provider.name}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge isOnline={provider.isOnline} />
            {provider.fssai && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                <ShieldCheckIcon className="h-3 w-3 mr-1.5" />
                FSSAI Verified
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <a
            href={`mailto:${provider.email}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            Email Provider
          </a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <ContactInfo provider={provider} />
        <LocationInfo provider={provider} formatDate={formatDate} />
      </div>
    </div>
  </div>
);

const StatusBadge = ({ isOnline }: { isOnline: boolean }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    isOnline ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-200'
  }`}>
    <span className={`h-2 w-2 rounded-full mr-1.5 ${
      isOnline ? 'bg-green-500' : 'bg-gray-400'
    }`}></span>
    {isOnline ? 'Currently Online' : 'Offline'}
  </span>
);

const ContactInfo = ({ provider }: { provider: Provider }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Information</h3>
    <div className="space-y-4">
      <InfoRow icon={EnvelopeIcon} label="Email" value={provider.email} isLink />
      <InfoRow icon={PhoneIcon} label="Phone" value={provider.phone} isLink />
      {provider.fssai && (
        <InfoRow icon={ShieldCheckIcon} label="FSSAI License" value={provider.fssai} isMono />
      )}
    </div>
  </div>
);

const LocationInfo = ({ provider, formatDate }: {
  provider: Provider;
  formatDate: (date: string) => string;
}) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Location Details</h3>
    <div className="space-y-4">
      <InfoRow icon={MapPinIcon} label="Address" value={provider.address} />
      <InfoRow 
        icon={GlobeAltIcon} 
        label="Coordinates" 
        value={`${provider.coordinates.lat.toFixed(6)}, ${provider.coordinates.lng.toFixed(6)}`} 
      />
      {!provider.isOnline && (
        <InfoRow 
          icon={ClockIcon} 
          label="Last Active" 
          value={formatDate(provider.lastSeen)} 
        />
      )}
    </div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value, isMono = false, isLink = false }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  isMono?: boolean;
  isLink?: boolean;
}) => (
  <div className="flex items-start">
    <div className={`p-2 rounded-lg mr-3 ${
      isLink ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
    }`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {isLink ? (
        <a 
          href={isLink ? (label === 'Email' ? `mailto:${value}` : `tel:${value}`) : '#'}
          className={`text-sm font-medium ${
            isMono ? 'font-mono' : ''
          } ${
            isLink ? 'text-blue-600 hover:text-blue-800' : 'text-gray-900'
          }`}
        >
          {value}
        </a>
      ) : (
        <p className={`text-sm font-medium text-gray-900 ${isMono ? 'font-mono' : ''}`}>
          {value}
        </p>
      )}
    </div>
  </div>
);

const EmptyListState = () => (
  <div className="p-8 text-center">
    <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
      <BuildingOfficeIcon className="h-full w-full" />
    </div>
    <h3 className="text-lg font-medium text-gray-900">No Providers Found</h3>
    <p className="mt-1 text-gray-500">There are currently no providers available in your area</p>
  </div>
);

const EmptyState = ({ hasProviders }: { hasProviders: boolean }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex items-center justify-center border border-gray-200">
    <div className="p-8 text-center">
      <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
        <BuildingOfficeIcon className="h-full w-full" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">
        {hasProviders ? 'Select a Provider' : 'No Providers Available'}
      </h3>
      <p className="mt-1 text-gray-500">
        {hasProviders
          ? "Choose a provider from the list to view details"
          : "Check back later for available providers"}
      </p>
    </div>
  </div>
);