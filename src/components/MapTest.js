import React, { useState, useEffect } from 'react';
import ReactMapGL from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

function Map() {
  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '400px', // Adjust height as needed
    latitude: 40.78343, // Replace with your desired initial center coordinates
    longitude: -73.96625,
    zoom: 11
  });

  // Optional: Fetch initial location from geolocation (consider user privacy implications)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setViewport({
          ...viewport,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => console.error(error)
    );
  }, []); // Empty dependency array to run only once on component mount

  return (
    <ReactMapGL
      {...viewport}
      onViewportChange={setViewport}
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/streets-v10"
    />
  );
}

export default Map;
