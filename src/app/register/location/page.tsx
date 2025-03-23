// app/register/location/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";

export default function LocationPicker() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");

  const mapContainerStyle = {
    width: '100%',
    height: '100vh'
  };

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat()!;
    const lng = e.latLng?.lng()!;
    setSelectedLocation({ lat, lng });

    // Reverse geocode
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setAddress(results[0].formatted_address);
      }
    });
  };

  const confirmLocation = () => {
    if (selectedLocation && address) {
      localStorage.setItem('tempLocation', JSON.stringify({
        coordinates: selectedLocation,
        address
      }));
      router.back();
    }
  };

  return (
    <div className="relative h-screen w-full">
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat: 19.0760, lng: 72.8777 }}
          zoom={13}
          onClick={handleMapClick}
        >
          {selectedLocation && <Marker position={selectedLocation} />}
        </GoogleMap>
      </LoadScript>

      <div className="absolute top-4 left-4 right-4 bg-white p-4 rounded-lg shadow-md flex gap-4">
        <div className="flex-1">
          <p className="font-semibold">Selected Address:</p>
          <p>{address || "Click on the map to select location"}</p>
        </div>
        <button
          onClick={confirmLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}