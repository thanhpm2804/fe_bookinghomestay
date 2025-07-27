import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './HomestayMap.module.css';

// Fix marker icons cho Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const HomestayMap = ({ homestayName, latitude, longitude }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Validate tọa độ
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    const isValidLat = !isNaN(lat) && lat >= -90 && lat <= 90;
    const isValidLng = !isNaN(lng) && lng >= -180 && lng <= 180;
    
    // Tọa độ hiển thị (mặc định: Đà Nẵng)
    const displayLat = isValidLat ? lat : 16.0471;
    const displayLng = isValidLng ? lng : 108.2194;

    // Tạo map nếu chưa có
    if (mapRef.current && !mapInstanceRef.current) {
      // Khởi tạo map
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [displayLat, displayLng],
        zoom: 14,
        zoomControl: true,
        attributionControl: true
      });

      // Thêm tile layer OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Tạo custom marker icon
      const customIcon = L.divIcon({
        html: `<div class="${styles.customMarker}">🏠</div>`,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Thêm marker
      markerRef.current = L.marker([displayLat, displayLng], { 
        icon: customIcon 
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="${styles.popupContent}">
            <div class="${styles.popupTitle}">📍 ${homestayName || 'Homestay Location'}</div>
            <div class="${styles.popupCoords}">Lat: ${displayLat.toFixed(6)}</div>
            <div class="${styles.popupCoords}">Lng: ${displayLng.toFixed(6)}</div>
          </div>
        `)
        .openPopup();
    }

    // Cleanup khi component unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [latitude, longitude, homestayName]);

  const isInvalidCoords = isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude));

  return (
    <div className={styles.mapContainer}>
      <div ref={mapRef} className={styles.mapElement} />
      
      {isInvalidCoords && (
        <div className={styles.warningBadge}>
          ⚠️ Tọa độ mặc định: Đà Nẵng
        </div>
      )}
    </div>
  );
};

export default HomestayMap;