// Assuming you're using TypeScript, otherwise you can ignore the TypeScript specific parts
import React, { useState, useEffect, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl';
import Pin from '../components/Pin'; // Adjust the import path as needed
import ControlPanel from '../components/ControlPanel'; // Adjust the import path as needed
import 'mapbox-gl/dist/mapbox-gl.css'; // Necessary CSS for mapbox


// This is your App or Map component
const MapComponent = () => {
  const [locations, setLocations] = useState([]); // State to store fetched location data
  const [popupInfo, setPopupInfo] = useState(null); // State to manage popup information

  // Fetch locations from your Flask API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/locations'); // Adjust the API URL as needed
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    fetchLocations();
  }, []);

  const pins = useMemo(
    () =>
      locations.map((location, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={location.geometry.coordinates[0]}
          latitude={location.geometry.coordinates[1]}
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            setPopupInfo(location.properties); // Adjusted to use properties from your data structure
          }}
        >
          <Pin />
        </Marker>
      )),
    [locations] // This will recalculate the pins whenever locations state changes
  );
  
  return (
    <>
    <Map
    className="full-screen-map"
      initialViewState={{
        latitude: 54.597286, // Default latitude
        longitude: -5.930120, // Default longitude
        zoom: 3.5, // Default zoom
        bearing: 0,
        pitch: 0
      }}
      style={{ width: '100vw', height: '100vh' }} // Adjust the size as needed

      mapStyle="mapbox://styles/mapbox/streets-v11" // or any other map style
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
    >
      <GeolocateControl position="top-left" />
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" />
      <ScaleControl />

      {pins}

      {popupInfo && (
        <Popup
          latitude={Number(popupInfo.geometry.coordinates[1])}
          longitude={Number(popupInfo.geometry.coordinates[0])}
          onClose={() => setPopupInfo(null)}
          anchor="top"
        >
          <div>
            {/* Render popup content based on popupInfo */}
            <h3>{popupInfo.properties.name}</h3> {/* Example property */}
            {/* Add more popup details as needed */}
          </div>
        </Popup>
      )}
    </Map>
    <ControlPanel /> {/* Optional control panel for additional map interactions */}
    </>
  );
};

export default MapComponent;
