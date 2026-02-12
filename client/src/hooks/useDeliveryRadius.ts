import { useState, useEffect } from 'react';

interface DeliveryConfig {
  center: { lat: number; lng: number }; // Hotel Location
  maxRadiusKm: number; // Max delivery radius
}

// Default to a placeholder location (e.g., Central Mumbai) if not provided
const DEFAULT_CENTER = { lat: 19.0760, lng: 72.8777 };
const DEFAULT_RADIUS = 10; // 10km

export const useDeliveryRadius = (config?: Partial<DeliveryConfig>) => {
  const [isWithinRadius, setIsWithinRadius] = useState<boolean | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const center = config?.center || DEFAULT_CENTER;
  const maxRadius = config?.maxRadiusKm || DEFAULT_RADIUS;

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const checkEligibility = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = calculateDistance(center.lat, center.lng, latitude, longitude);

        setDistanceKm(dist);
        setIsWithinRadius(dist <= maxRadius);
        setLoading(false);
      },
      (err) => {
        setError("Unable to retrieve your location");
        setLoading(false);
      }
    );
  };

  return { isWithinRadius, distanceKm, loading, error, checkEligibility };
};
