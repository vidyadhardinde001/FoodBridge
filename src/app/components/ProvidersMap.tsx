"use client";
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Provider {
  _id: string;
  coordinates: { lat: number; lng: number };
  [key: string]: any;
}

interface ProvidersMapProps {
  providers: Provider[];
  selectedProvider: Provider | null;
  onSelectProvider: (provider: Provider) => void;
}

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function ProvidersMap({ providers, selectedProvider, onSelectProvider }: ProvidersMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        preferCanvas: true
      }).setView([20.5937, 78.9629], 5); // Default to India view

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Add zoom control after initialization
      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);
    }

    // Cleanup markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    providers.forEach(provider => {
      if (!mapRef.current) return;

      const marker = L.marker(
        [provider.coordinates.lat, provider.coordinates.lng],
        { icon: DefaultIcon }
      ).addTo(mapRef.current);

      marker.on('click', () => onSelectProvider(provider));
      markersRef.current.push(marker);
    });

    // Center on selected provider
    if (selectedProvider && mapRef.current) {
      mapRef.current.setView(
        [selectedProvider.coordinates.lat, selectedProvider.coordinates.lng],
        15
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [providers, selectedProvider, onSelectProvider]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}