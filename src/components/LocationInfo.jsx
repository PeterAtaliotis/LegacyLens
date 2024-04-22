import React from 'react';

const LocationInfo = ({ locationDetails, handleNavigate }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden"> 
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">{locationDetails.properties?.Address}</h2>
      </div>
      <div className="p-4">
        <p><strong>Currently Used As:</strong> {locationDetails.properties?.CurrentUse}</p>
        <p><strong>Former Use:</strong> {locationDetails.properties?.FormerUse}</p>
        <p><strong>Construction Date:</strong> {locationDetails.properties?.Date_Const}</p>
        <p><strong>Extent of The Building That Remains Historical :</strong> {locationDetails.properties?.Extent}</p>
      </div>
    </div>
  );
};

export default LocationInfo;
