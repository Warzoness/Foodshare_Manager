'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet icons
interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
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
  mode?: 'create' | 'edit';
}

/* ✅ Tự động recenter map khi props lat/lng thay đổi */
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, map]);

  return null;
}

/* ✅ Click map → cập nhật vị trí */
function MapEventHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    }
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
                                         mode = 'edit'
                                       }: InteractiveMapProps) {

  /* ✅ Chỉ chặn map trong mode CREATE khi chưa có GPS */
  const shouldRenderMap =
      mode === 'edit' || (mode === 'create' && latitude !== 0 && longitude !== 0);

  if (!shouldRenderMap) {
    return (
        <div
            style={{
              height,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#fff'
            }}
        >
          Đang tải vị trí…
        </div>
    );
  }

  return (
      <div className={className} style={{ position: 'relative' }}>
        <div style={{ height, borderRadius: '8px', overflow: 'hidden' }}>
          <MapContainer
              center={[latitude, longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
          >
            {/* ✅ Key để reload tile khi lat/lng đổi */}
            <TileLayer
                key={`${latitude}-${longitude}`}
                attribution=""
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            />

            {/* ✅ Marker luôn sync theo props */}
            <Marker
                position={[latitude, longitude]}
                draggable={true}
                eventHandlers={{
                  dragend(e) {
                    const pos = e.target.getLatLng();
                    onLocationChange(pos.lat, pos.lng, address);
                  }
                }}
            />

            <MapRecenter lat={latitude} lng={longitude} />
            <MapEventHandler
                onLocationChange={(lat, lng) => onLocationChange(lat, lng, address)}
            />
          </MapContainer>
        </div>

        {/* Guide text */}
        <div
            style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: '#fef3c7',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#92400e'
            }}
        >
          💡 <strong>Hướng dẫn:</strong> Click bản đồ hoặc kéo marker để chọn vị trí.
        </div>
      </div>
  );
}