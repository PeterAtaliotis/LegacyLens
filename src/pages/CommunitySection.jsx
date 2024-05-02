import React from 'react';
import { useParams } from 'react-router-dom';
import MessageBoard from '../components/MessageBoard'; 

const LocationPage = () => {
  const { id } = useParams(); 

  return (
    <div className="container mx-auto p-4">
      <MessageBoard locationId={id} />
    </div>
  );
};

export default LocationPage;
