import { useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation } from "lucide-react";

// Fix for default Leaflet marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PropertyMapProps {
  property: {
    name: string;
    location: string;
    coordinates?: { lat: number; lng: number };
    nearbyPlaces?: {
      name: string;
      type: string;
      distance: string;
      coordinates: { lat: number; lng: number };
    }[];
  };
}

// Sub-component to fly to selected marker
function MapController({ center }: { center: { lat: number, lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14);
  }, [center, map]);
  return null;
}

export default function PropertyMap({ property }: PropertyMapProps) {
  // Default to a central location if no coords (fallback)
  const position = property.coordinates || { lat: 18.9220, lng: 72.8347 };
  const nearby = property.nearbyPlaces || [];

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-border shadow-lg relative bg-muted z-0">
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapController center={position} />

        {/* Property Marker */}
        <Marker position={position}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-sm mb-1">{property.name}</h3>
              <p className="text-xs text-muted-foreground">{property.location}</p>
            </div>
          </Popup>
        </Marker>

        {/* Nearby Markers */}
        {nearby.map((place, idx) => (
          <Marker key={idx} position={place.coordinates} opacity={0.7}>
            <Popup>
              <div className="p-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{place.type}</span>
                <h4 className="font-semibold text-xs mb-0.5">{place.name}</h4>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Navigation className="w-3 h-3" /> {place.distance} away
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay List for Nearby Places */}
      <div className="absolute top-4 right-4 z-[400] bg-card/90 backdrop-blur-md p-4 rounded-xl shadow-xl w-64 max-h-[80%] overflow-y-auto border border-border/50 hidden md:block">
        <h4 className="font-serif text-sm font-bold mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> Nearby Highlights
        </h4>
        <div className="space-y-3">
          {nearby.length > 0 ? nearby.map((place, idx) => (
            <div key={idx} className="flex flex-col border-b border-border/30 last:border-0 pb-2 last:pb-0">
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-xs">{place.name}</span>
                <span className="text-[10px] text-muted-foreground">{place.distance}</span>
              </div>
              <span className="text-[10px] text-primary mt-0.5">{place.type}</span>
            </div>
          )) : (
            <p className="text-xs text-muted-foreground"> Explore the vibrant neighborhood around {property.name}.</p>
          )}
        </div>
      </div>
    </div>
  );
}
