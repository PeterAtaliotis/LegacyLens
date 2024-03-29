import React, { useState, useEffect, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl, ViewStateChangeEvent } from 'react-map-gl';
import Pin from '../components/Pin';
import ControlPanel from '../components/ControlPanel';
import 'mapbox-gl/dist/mapbox-gl.css';
  

const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  // Adding viewState for managing map view
  const [viewState, setViewState] = useState({
    latitude: 54.597286,
    longitude: -5.930120,
    zoom: 10,
  });

  const fetchLocations = async (viewState) => {
    try {
      // Calculate bounds more dynamically based on zoom level
      const scale = 1 / viewState.zoom; // Simple scaling factor based on zoom
      const neLat = viewState.latitude + (0.1 * scale);
      const neLng = viewState.longitude + (0.1 * scale);
      const swLat = viewState.latitude - (0.1 * scale);
      const swLng = viewState.longitude - (0.1 * scale);
  
      const response = await fetch(
        `http://localhost:8080/api/locations/viewport?ne_lat=${neLat}&ne_lng=${neLng}&sw_lat=${swLat}&sw_lng=${swLng}`
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      // Only keep up to 100 locations
      setLocations(data.slice(0, 300));
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };
  

  // Update useEffect to include viewState dependencies
  useEffect(() => {
    fetchLocations(viewState);
  }, [viewState]);

  const pins = useMemo(
    () => locations.map((location, index) => (
      <Marker
        key={`marker-${index}`}
        longitude={location.geometry.coordinates[0]}
        latitude={location.geometry.coordinates[1]}
        anchor="bottom"
        onClick={e => {	
          e.originalEvent.stopPropagation();
          setPopupInfo(location);
        }}
      >
        <Pin />
      </Marker>
    )),
    [locations]
  );

  return (
    <>
      <Map
        className="full-screen-map"
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100vw', height: '100vh' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}	
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

        {pins}

        {popupInfo && (
          <Popup
            latitude={popupInfo.geometry.coordinates[1]}
            longitude={popupInfo.geometry.coordinates[0]}
            onClose={() => setPopupInfo(null)}
            anchor="top"
          >
            <div>
              <h3>{popupInfo.properties.Address}</h3>
              {/* Render other popupInfo details as needed */}
            </div>
          </Popup>
        )}
      </Map>
      <ControlPanel />
    </>
  );
};

export default MapComponent;
