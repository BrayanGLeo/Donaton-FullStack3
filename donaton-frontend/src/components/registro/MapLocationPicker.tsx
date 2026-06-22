import React, { useState, useRef } from 'react';
import { Form, ListGroup, InputGroup, Button, Spinner } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search } from 'lucide-react';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

interface MapLocationPickerProps {
  onLocationSelect: (location: { lat: number, lng: number, addressDetails?: any }) => void;
  initialLocation?: { lat: number, lng: number };
  error?: string;
  disabled?: boolean;
}

const LocationMarker = ({ position, setPosition, onLocationSelect }: any) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ onLocationSelect, initialLocation, error, disabled }) => {
  const [position, setPosition] = useState<L.LatLng | null>(initialLocation ? new L.LatLng(initialLocation.lat, initialLocation.lng) : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=cl&format=json&addressdetails=1&limit=5`);
      const data = await response.json();
      setSuggestions(data);
      setShowDropdown(true);
    } catch (err) {
      console.error("Error fetching address:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      void fetchAddress(e.target.value);
    }, 500);
  };

  const handleSuggestionClick = (suggestion: any) => {
    const newPos = new L.LatLng(Number.parseFloat(suggestion.lat), Number.parseFloat(suggestion.lon));
    setPosition(newPos);
    setSearchQuery(suggestion.display_name);
    setShowDropdown(false);
    onLocationSelect({ lat: newPos.lat, lng: newPos.lng, addressDetails: suggestion.address });
  };

  const handleMapClick = async (latlng: L.LatLng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&accept-language=es`);
      const data = await response.json();
      if (data?.address) {
        onLocationSelect({ lat: latlng.lat, lng: latlng.lng, addressDetails: data.address });
        setSearchQuery(data.display_name);
      } else {
        onLocationSelect({ lat: latlng.lat, lng: latlng.lng });
      }
    } catch {
      onLocationSelect({ lat: latlng.lat, lng: latlng.lng });
    }
  };

  return (
    <div className="position-relative">
      <InputGroup className="mb-2">
        <Form.Control
          type="text"
          placeholder="Buscar dirección en el mapa..."
          value={searchQuery}
          onChange={onSearchChange}
          disabled={disabled}
          isInvalid={!!error}
        />
        <Button variant="outline-secondary" disabled>
          {isSearching ? <Spinner size="sm" animation="border" /> : <Search size={18} />}
        </Button>
      </InputGroup>

      {showDropdown && suggestions.length > 0 && (
        <ListGroup className="position-absolute w-100 z-3 shadow-sm" style={{ top: '100%', maxHeight: '200px', overflowY: 'auto' }}>
          {suggestions.map((suggestion) => (
            <ListGroup.Item action key={suggestion.place_id || suggestion.osm_id || Math.random().toString()} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion.display_name}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {error && <div className="text-danger small mb-2">{error}</div>}

      <div style={{ height: '300px', width: '100%', marginBottom: '1rem', borderRadius: '0.5rem', overflow: 'hidden', border: error ? '1px solid #dc3545' : '1px solid #dee2e6' }}>
        <MapContainer center={position || [-33.4489, -70.6693]} zoom={position ? 15 : 10} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          <LocationMarker position={position} setPosition={setPosition} onLocationSelect={handleMapClick} />
        </MapContainer>
      </div>
    </div>
  );
};
