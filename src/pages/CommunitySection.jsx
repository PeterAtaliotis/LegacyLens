import React from 'react';
import { useParams } from 'react-router-dom';
import MessageBoard from '../components/MessageBoard'; // Import the component

const LocationPage = () => {
  const { id } = useParams(); // Assuming your route is something like '/locations/:id'

  return (
    <div className="container mx-auto p-4">
      {/* Location info at the top */}
      <MessageBoard locationId={id} />
    </div>
  );
};

export default LocationPage;
