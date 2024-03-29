import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const LocationDetails = () => {
  const { id } = useParams();
  const [locationDetails, setLocationDetails] = useState(null);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/locations/${id}`);
        if (!response.ok) throw new Error('Failed to fetch location details');
        const data = await response.json();
        setLocationDetails(data);
      } catch (error) {
        console.error("Error fetching location details:", error);
      }
    };

    fetchLocationDetails();
  }, [id]);

  if (!locationDetails) return <div>Loading...</div>;

  return (
    <div>
      <h2>{locationDetails.properties.Address}</h2>
      {/* Display other details as needed */}
    </div>
  );
};

export default LocationDetails;
