import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ARSceneComponent = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationPermission, setLocationPermission] = useState(false);
  const [markers, setMarkers] = useState([]);

  const imagePositions = [
    { x: -3, y: 0, z: -5 },
    { x: -1.5, y: 0, z: -5 },
    { x: 0, y: 0, z: -5 },
    { x: 1.5, y: 0, z: -5 },
    { x: 3, y: 0, z: -5 },
  ];

  const navigate = useNavigate();

  const handleNavigate = (locationId) => {
    navigate(`/location/${locationId}`);
  };
  

  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', 
    // headers: {
    //   'ngrok-skip-browser-warning': 'true',
    // }
  });

  const handleLocationRequest = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationPermission(true);
          await fetchNearbyLocations(position.coords);
        },
        (error) => {
          console.error("Error fetching location: ", error);
          setLocationPermission(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };

  const fetchNearbyLocations = async (coords) => {
    try {
      const response = await axiosInstance.get(`/api/locations/nearby?lat=${coords.latitude}&lng=${coords.longitude}`);
      console.log("Nearby locations data:", response.data);
      for (const location of response.data) {
        await fetchWikiData(location);
      }
    } catch (error) {
      console.error("Failed to fetch nearby locations:", error);
    }
  };

  const fetchWikiData = async (location) => {
    try {
      const wikiResponse = await axiosInstance.get(`/api/locations/geosearch?latitude=${location.geometry.coordinates[1]}&longitude=${location.geometry.coordinates[0]}`);
      console.log("Wikipedia data:", wikiResponse.data);
      if (wikiResponse.data.image_url) {
        setMarkers(prevMarkers => {
          const isDuplicate = prevMarkers.some(marker => marker.imageUrl === wikiResponse.data.image_url);
          if (!isDuplicate) {
            return [...prevMarkers, {
              imageUrl: wikiResponse.data.image_url,
              position: imagePositions[prevMarkers.length % imagePositions.length],
              id: location._id,
            }];
          } else {
            return prevMarkers;
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch Wikipedia data:", error);
    }
  };
  

  if (!locationPermission) {
    return <button onClick={handleLocationRequest}>Get My Location</button>;
  }

  return (
    <a-scene vr-mode-ui='enabled: false' arjs='sourceType: webcam; videoTexture: true; debugUIEnabled: false' renderer='antialias: true; alpha: true'>
      <a-camera gps-new-camera='gpsMinDistance: 5' rotation-reader></a-camera>
      {markers.map((marker, index) => (
        <a-image
            key={index}
            position={`${imagePositions[index % imagePositions.length].x} ${imagePositions[index % imagePositions.length].y} ${imagePositions[index % imagePositions.length].z}`}
            src={marker.imageUrl}
            scale="2 2 2"
            onClick={() => handleNavigate(marker._id.$oid)}
        ></a-image> 
      ))}
    </a-scene>
  );
};

export default ARSceneComponent;
