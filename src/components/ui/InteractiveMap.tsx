'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix cho default markers trong Leaflet
interface IconDefaultPrototype {
  _getIconUrl?: string;
}

delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  height?: number;
  className?: string;
  mode?: 'create' | 'edit'; // Thêm prop để phân biệt mode
}

// Component để xử lý events trên map
function MapEventHandler({
  onLocationChange,
  onMarkerDragEnd
}: {
  onLocationChange: (lat: number, lng: number) => void;
  onMarkerDragEnd: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      console.log('Map clicked at:', { lat, lng });
      onLocationChange(lat, lng);
    },
  });

  return null;
}

export default function InteractiveMap({
  latitude,
  longitude,
  address,
  onLocationChange,
  height = 300,
  className = '',
  mode
}: InteractiveMapProps) {

  const [position, setPosition] = useState<[number, number]>([0, 0]); // Default to Hanoi
  const [isLoading, setIsLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Key để force re-render map
  const markerRef = useRef<L.Marker>(null);

  // Khởi tạo position dựa trên mode
  useEffect(() => {
    if (mode === 'edit' && latitude && longitude) {
      // Mode edit: chỉ sử dụng tọa độ từ API, không lấy vị trí hiện tại
      console.log('Mode edit - Setting position from API:', latitude, longitude);
      const newPosition: [number, number] = [latitude, longitude];
      setPosition(newPosition);
      setMapKey(prev => prev + 1);
    } else if (mode === 'create' && latitude === 0 && longitude === 0) {
      // Mode create: lấy vị trí hiện tại
      console.log('Mode create - Getting current location');
      const getCurrentLocation = () => {
        if (navigator.geolocation) {
          setIsLoading(true);
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              const newPosition: [number, number] = [lat, lng];
              setPosition(newPosition);

              // Gọi callback để cập nhật parent component
              onLocationChange(lat, lng, '');

              setIsLoading(false);
            },
            (error) => {
              console.error('Error getting location:', error);
              setIsLoading(false);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            }
          );
        } else {
          console.log('Geolocation is not supported by this browser.');
        }
      };

      getCurrentLocation();
    }
  }, [mode]); // CHỈ chạy khi mode thay đổi, không chạy khi latitude/longitude thay đổi

  // Cập nhật position khi có tọa độ mới từ API
  useEffect(() => {
    if (latitude && longitude) {
      console.log('Updating position from props:', latitude, longitude);
      const newPosition: [number, number] = [latitude, longitude];
      setPosition(newPosition);
      setMapKey(prev => prev + 1);
    }
  }, [latitude, longitude]);

  const handleLocationChange = (lat: number, lng: number) => {
    console.log('InteractiveMap - handleLocationChange called:', { lat, lng, address });
    const newPosition: [number, number] = [lat, lng];
    setPosition(newPosition);
    // Truyền đúng lat, lng và địa chỉ (nếu có)
    onLocationChange(lat, lng, address);
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log('Map clicked at:', { lat, lng });

    // Cập nhật state trực tiếp
    const newPosition: [number, number] = [lat, lng];
    setPosition(newPosition);

    // Gọi callback để cập nhật parent
    onLocationChange(lat, lng, address);
  };

  const handleMarkerDragEnd = () => {
    if (markerRef.current) {
      const position = markerRef.current.getLatLng();
      console.log('Marker dragged to:', { lat: position.lat, lng: position.lng });

      // Cập nhật state và gọi callback
      const newPosition: [number, number] = [position.lat, position.lng];
      setPosition(newPosition);
      onLocationChange(position.lat, position.lng, address);
    }
  };

  return (
    <div className={`interactive-map-container ${className}`} style={{ position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div>Đang lấy vị trí hiện tại...</div>
          </div>
        </div>
      )}

      <div style={{ height: height, borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer
          key={mapKey}
          center={position}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution=""
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />

          <Marker
            ref={markerRef}
            position={position}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          />

          <MapEventHandler
            onLocationChange={handleMapClick}
            onMarkerDragEnd={handleMarkerDragEnd}
          />
        </MapContainer>
      </div>

      {/* Hướng dẫn sử dụng */}
      <div style={{
        marginTop: '8px',
        padding: '8px 12px',
        backgroundColor: '#fef3c7',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#92400e'
      }}>
        💡 <strong>Hướng dẫn:</strong> Click vào bản đồ hoặc kéo marker để thay đổi vị trí. Sử dụng nút &quot;Tìm vị trí&quot; ở trên để điều hướng từ địa chỉ.
      </div>
    </div>
  );
}
