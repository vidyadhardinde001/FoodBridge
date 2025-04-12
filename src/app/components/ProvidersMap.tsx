// components/ProvidersMap.tsx
"use client";
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const activeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function ProvidersMap({ 
  providers, 
  selectedProvider,
  onSelectProvider 
}: { 
  providers: any[],
  selectedProvider: any,
  onSelectProvider: (provider: any) => void 
}) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    const validProviders = providers.filter(p => 
      p.coordinates && 
      typeof p.coordinates.lat === 'number' && 
      typeof p.coordinates.lng === 'number'
    );

    if (typeof window !== 'undefined' && validProviders.length > 0) {
      // Initialize map
      if (!mapRef.current) {
        mapRef.current = L.map('map').setView(
          [validProviders[0].coordinates.lat, validProviders[0].coordinates.lng], 
          12
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);
      }

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      validProviders.forEach(provider => {
        const marker = L.marker(
          [provider.coordinates.lat, provider.coordinates.lng], 
          { 
            icon: selectedProvider?._id === provider._id ? activeIcon : defaultIcon 
          }
        )
        .addTo(mapRef.current!)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">${provider.organizationName || provider.name}</h3>
            <p class="text-sm">${provider.address}</p>
            <button 
              class="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 w-full"
              onclick="window.dispatchEvent(new CustomEvent('selectProvider', { detail: '${provider._id}' }))"
            >
              View Details
            </button>
          </div>
        `);

        marker.on('click', () => {
          const providerToSelect = validProviders.find(p => p._id === provider._id);
          if (providerToSelect) {
            onSelectProvider(providerToSelect);
          }
        });

        markersRef.current.push(marker);
      });

      // Center map on selected provider
      if (
        selectedProvider && 
        selectedProvider.coordinates && 
        typeof selectedProvider.coordinates.lat === 'number' &&
        typeof selectedProvider.coordinates.lng === 'number'
      ) {
        mapRef.current.setView(
          [selectedProvider.coordinates.lat, selectedProvider.coordinates.lng],
          14
        );
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [providers, selectedProvider]);

  return <div id="map" className="h-full w-full rounded-lg" />;
}
