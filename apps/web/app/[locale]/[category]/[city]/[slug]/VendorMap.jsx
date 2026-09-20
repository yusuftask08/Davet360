'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet'in varsayılan marker ikonu webpack/Next bundling ile path sorunu yaşar (klasik gotcha) —
// bunun yerine CSS ile çizilen basit bir divIcon kullanıyoruz, harici görsel dosyasına gerek yok.
const markerIcon = L.divIcon({
  className: '',
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#B8355F;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function VendorMap({ lat, lng, name }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: 260, width: '100%', borderRadius: 'var(--radius-lg)' }}
    >
      {/* OpenStreetMap — ücretsiz, API key gerektirmiyor (Google Maps'in aksine). */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={markerIcon}>
        <Popup>{name}</Popup>
      </Marker>
    </MapContainer>
  );
}
