import React from 'react';
import Map from 'react-map-gl'; // Import the Map component

function MapComponent() {
  return (
    <Map
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN} // Replace with your token
      initialViewState={{
        longitude: -7.1737665982538505,
        latitude: 55.02713651149884,
        zoom: 14
      }}
      style={{ width: 600, height: 400 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    />
  );
}

export default MapComponent;

