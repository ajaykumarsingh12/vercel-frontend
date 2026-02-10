import { useState, useEffect, useRef } from 'react';
import './AddressAutocomplete.css';

const AddressAutocomplete = ({ onLocationSelect, initialValue = '' }) => {
  const [address, setAddress] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const debounceTimer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Get API key from environment variable
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Validate API key
    const isValidApiKey = GOOGLE_MAPS_API_KEY && 
                          GOOGLE_MAPS_API_KEY !== 'your_api_key_here' && 
                          GOOGLE_MAPS_API_KEY !== 'your_new_api_key_here' &&
                          GOOGLE_MAPS_API_KEY.startsWith('AIza');
    
    // Check if we should use Google Maps or OpenStreetMap
    if (isValidApiKey) {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initializeGoogleServices();
        setUseGoogleMaps(true);
      } else if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Only load if not already loading/loaded
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initializeGoogleServices();
          setUseGoogleMaps(true);
        };
        script.onerror = () => {
          console.error('Failed to load Google Maps. Falling back to OpenStreetMap.');
          setUseGoogleMaps(false);
        };
        document.head.appendChild(script);
      }
    } else {
      // Use OpenStreetMap if no valid API key
      if (!isValidApiKey && GOOGLE_MAPS_API_KEY) {
        console.warn('Invalid Google Maps API key. Using OpenStreetMap instead.');
      }
      setUseGoogleMaps(false);
    }
  }, [GOOGLE_MAPS_API_KEY]);

  const initializeGoogleServices = () => {
    try {
      if (window.google && window.google.maps && window.google.maps.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        const mapDiv = document.createElement('div');
        const map = new window.google.maps.Map(mapDiv);
        placesService.current = new window.google.maps.places.PlacesService(map);
        setUseGoogleMaps(true);
      } else {
        // Google Maps services not available, using OpenStreetMap
        setUseGoogleMaps(false);
      }
    } catch (error) {
      console.error(error);
      setUseGoogleMaps(false);
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce the API call
    debounceTimer.current = setTimeout(() => {
      if (value.length > 2) {
        if (useGoogleMaps && autocompleteService.current) {
          fetchGoogleSuggestions(value);
        } else {
          fetchOpenStreetMapSuggestions(value);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);
  };

  const fetchGoogleSuggestions = (query) => {
    setIsLoading(true);
    autocompleteService.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'in' },
      },
      (predictions, status) => {
        setIsLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.map(p => ({ ...p, source: 'google' })));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      }
    );
  };

  const fetchOpenStreetMapSuggestions = async (query) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `countrycodes=in&` +
        `limit=5`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'BookMyHall/1.0 (Hall Booking Application)'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setSuggestions(data.map(d => ({ ...d, source: 'osm' })));
          setShowSuggestions(true);
        } else {
          console.warn('OpenStreetMap returned no results for:', query);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        console.error('OpenStreetMap API Error:', response.status, response.statusText);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('OpenStreetMap API Error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuggestionClick = (suggestion) => {
    setAddress(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);

    if (placesService.current) {
      placesService.current.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ['geometry', 'formatted_address', 'address_components', 'name'],
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const location = {
              address: place.formatted_address,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              name: place.name,
            };

            const addressComponents = place.address_components;
            let city = '';
            let state = '';
            let pincode = '';

            addressComponents.forEach((component) => {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
              if (component.types.includes('postal_code')) {
                pincode = component.long_name;
              }
            });

            location.city = city;
            location.state = state;
            location.pincode = pincode;
            location.source = 'google';

            setSelectedLocation(location);
            onLocationSelect(location);
          }
        }
      );
    }
  };

  const handleOSMSuggestionClick = (suggestion) => {
    const location = {
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      name: suggestion.name || suggestion.display_name.split(',')[0],
      city: suggestion.address?.city || 
            suggestion.address?.town || 
            suggestion.address?.village || 
            suggestion.address?.municipality || '',
      state: suggestion.address?.state || '',
      pincode: suggestion.address?.postcode || '',
      source: 'osm',
    };

    setAddress(suggestion.display_name);
    setSelectedLocation(location);
    setMarkerPosition({ lat: location.lat, lng: location.lng });
    setShowSuggestions(false);
    setSuggestions([]);
    onLocationSelect(location);
  };

  const handleMarkerDragEnd = async (newLat, newLng) => {
    setMarkerPosition({ lat: newLat, lng: newLng });
    
    // Reverse geocode to get address for new position
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `lat=${newLat}&` +
        `lon=${newLng}&` +
        `format=json&` +
        `addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'BookMyHall/1.0 (Hall Booking Application)',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const updatedLocation = {
          address: data.display_name,
          lat: newLat,
          lng: newLng,
          name: data.name || data.display_name.split(',')[0],
          city: data.address?.city || 
                data.address?.town || 
                data.address?.village || 
                data.address?.municipality || 
                selectedLocation?.city || '',
          state: data.address?.state || selectedLocation?.state || '',
          pincode: data.address?.postcode || selectedLocation?.pincode || '',
          source: 'osm',
        };

        setAddress(data.display_name);
        setSelectedLocation(updatedLocation);
        onLocationSelect(updatedLocation);
      }
    } catch (error) {
      console.error(error);
      // Update coordinates even if reverse geocoding fails
      const updatedLocation = {
        ...selectedLocation,
        lat: newLat,
        lng: newLng,
      };
      setSelectedLocation(updatedLocation);
      onLocationSelect(updatedLocation);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.source === 'google') {
      handleGoogleSuggestionClick(suggestion);
    } else {
      handleOSMSuggestionClick(suggestion);
    }
  };

  const handleClickOutside = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      // Don't close if clicking on backdrop on mobile
      if (!e.target.classList.contains('suggestions-backdrop')) {
        setShowSuggestions(false);
      }
    }
  };

  const handleBackdropClick = () => {
    setShowSuggestions(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    
    // Prevent body scroll when mobile dropdown is open
    if (isMobile && showSuggestions) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobile, showSuggestions]);

  // Initialize interactive map when location is selected
  useEffect(() => {
    if (selectedLocation && markerPosition) {
      initializeInteractiveMap();
    }
  }, [selectedLocation, markerPosition]);

  const initializeInteractiveMap = () => {
    // Load Leaflet dynamically
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => createMap();
      document.head.appendChild(script);
    } else {
      createMap();
    }
  };

  const createMap = () => {
    if (!mapRef.current || !markerPosition) return;

    // Clear existing map
    if (window.mapInstance) {
      window.mapInstance.remove();
    }

    // Create new map
    const map = window.L.map(mapRef.current).setView(
      [markerPosition.lat, markerPosition.lng],
      15
    );

    window.mapInstance = map;

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add draggable marker
    const marker = window.L.marker([markerPosition.lat, markerPosition.lng], {
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;

    // Handle marker drag
    marker.on('dragend', function(e) {
      const position = e.target.getLatLng();
      handleMarkerDragEnd(position.lat, position.lng);
    });

    // Add popup
    marker.bindPopup('📍 Drag me to adjust location!').openPopup();
  };

  return (
    <div className="address-autocomplete-container">
      <div className="address-input-wrapper" ref={inputRef}>
        <div className="address-input-group">
          <span className="address-icon">📍</span>
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Start typing your hall address..."
            className="address-input"
          />
          {isLoading && (
            <div className="loading-spinner">
              <svg className="spinner-icon" viewBox="0 0 50 50">
                <circle className="spinner-path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
              </svg>
            </div>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <>
            {isMobile && (
              <div 
                className="suggestions-backdrop" 
                onClick={handleBackdropClick}
              />
            )}
            <div className="suggestions-dropdown">
              {isMobile && (
                <div className="suggestions-header">
                  <span className="suggestions-title">Select Location</span>
                  <button 
                    className="suggestions-close"
                    onClick={() => setShowSuggestions(false)}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="suggestion-icon">📍</span>
                  <div className="suggestion-content">
                    <div className="suggestion-main">
                      {suggestion.source === 'google' 
                        ? suggestion.structured_formatting?.main_text 
                        : (suggestion.name || suggestion.display_name.split(',')[0])}
                    </div>
                    <div className="suggestion-secondary">
                      {suggestion.source === 'google'
                        ? suggestion.structured_formatting?.secondary_text
                        : suggestion.display_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedLocation && (
        <div className="location-preview">
          <div className="location-info">
            <div className="location-info-header">
              <span className="location-check">✅</span>
              <span className="location-title">Location Selected</span>
            </div>
            <div className="location-details">
              <div className="location-detail-item">
                <strong>Address:</strong> {selectedLocation.address}
              </div>
              {selectedLocation.city && (
                <div className="location-detail-item">
                  <strong>City:</strong> {selectedLocation.city}
                </div>
              )}
              {selectedLocation.state && (
                <div className="location-detail-item">
                  <strong>State:</strong> {selectedLocation.state}
                </div>
              )}
              {selectedLocation.pincode && (
                <div className="location-detail-item">
                  <strong>Pincode:</strong> {selectedLocation.pincode}
                </div>
              )}
              <div className="location-detail-item">
                <strong>Coordinates:</strong> {markerPosition?.lat.toFixed(6) || selectedLocation.lat.toFixed(6)}, {markerPosition?.lng.toFixed(6) || selectedLocation.lng.toFixed(6)}
              </div>
            </div>
          </div>

          <div className="map-preview">
            <div className="map-instructions">
              <span className="map-instruction-icon">💡</span>
              <span>Drag the pin to adjust your exact location</span>
            </div>
            <div 
              ref={mapRef} 
              id="interactive-map" 
              className="interactive-map"
            ></div>
            <div className="map-attribution">
              <small>
                Map data © <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
