import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation } from "lucide-react";

// Fix for default Leaflet marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- HELPER: Distance Calculator ---
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

// --- HELPER: Map Controller (Fixes the ReferenceError) ---
function MapController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (center?.lat != null && center?.lng != null) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
}

interface PropertyMapProps {
  property?: {
    name: string;
    location: string;
    coordinates?: { lat: number; lng: number } | null;
    nearbyPlaces?: any[];
  };
}

export default function PropertyMap({ property }: PropertyMapProps) {
  if (!property) return null;

  const validPosition = useMemo(() => {
    if (!property.coordinates) return null;
    const lat = Number(property.coordinates.lat);
    const lng = Number(property.coordinates.lng);
    return !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null;
  }, [property.coordinates]);

  const position = validPosition || { lat: 20.32, lng: 85.81 };

  // Calculate distances for the sidebar overlay
  const nearby = useMemo(() => {
    return (property.nearbyPlaces || [])
      .filter((place) => place.coordinates)
      .map((place) => ({
        ...place,
        distance: validPosition 
          ? `${getDistance(validPosition.lat, validPosition.lng, place.coordinates.lat, place.coordinates.lng)} km`
          : "Nearby"
      }));
  }, [property.nearbyPlaces, validPosition]);

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-border shadow-lg relative bg-muted z-0">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapController center={position} />

        {validPosition && (
          <Marker position={validPosition}>
            <Popup>
              <div className="p-1 font-sans">
                <h3 className="font-bold text-sm">{property.name}</h3>
                <p className="text-xs text-muted-foreground">{property.location}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {nearby.map((place, idx) => (
          <Marker 
            key={idx} 
            position={[place.coordinates.lat, place.coordinates.lng]}
            opacity={0.8}
          >
            <Popup>
              <div className="p-1">
                <span className="text-[10px] font-bold text-primary uppercase">{place.type}</span>
                <h4 className="font-semibold text-xs">{place.name}</h4>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Navigation className="w-3 h-3" /> {place.distance}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Nearby Overlay */}
      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl w-64 max-h-[80%] overflow-y-auto border border-border hidden md:block">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> Nearby Highlights
        </h4>
        <div className="space-y-3">
          {nearby.map((place, idx) => (
            <div key={idx} className="flex flex-col border-b border-border/30 pb-2 last:border-0">
               <div className="flex justify-between items-baseline">
                 <span className="font-medium text-xs truncate max-w-[120px]">{place.name}</span>
                 <span className="text-[10px] text-muted-foreground font-mono">{place.distance}</span>
               </div>
               <span className="text-[10px] text-primary capitalize">{place.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}