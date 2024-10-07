import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface MapProps {
  googleMapsApiKey: string;
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

// for Harare, Zimbabwe
const center = {
  lat: -17.8292,
  lng: 31.0522,
};

const GoogleMapComponent: React.FC<MapProps> = ({
  googleMapsApiKey,
  onLocationSelect,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [position, setPosition] = useState(center);

  const onMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const coords = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setPosition(coords);
      onLocationSelect(coords);
    }
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={position}
      zoom={13}
      onClick={onMapClick}
      onLoad={(map) => setMap(map)}
    >
      <Marker position={position} />
    </GoogleMap>
  ) : (
    <div>Loading...</div>
  );
};

export default React.memo(GoogleMapComponent);
