import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const LocationDetails = () => {
  const { id } = useParams();
  const [locationDetails, setLocationDetails] = useState(null);
  const [wikiInfo, setWikiInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/locations/${id}`);
        if (!response.ok) throw new Error('Failed to fetch location details');
        const data = await response.json();
        setLocationDetails(data[0]); // Assuming the API returns an array

        const coords = data[0].geometry.coordinates; // Assuming coordinates are stored in geometry.coordinates
        const wikiResponse = await fetch(`http://localhost:8080/api/locations/geosearch?latitude=${coords[1]}&longitude=${coords[0]}`);
        if (!wikiResponse.ok) throw new Error('Failed to fetch Wikipedia info');
        const wikiData = await wikiResponse.json();
        setWikiInfo(wikiData);
      } catch (error) {
        console.error("Error fetching location details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationDetails();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div></div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;
  if (!locationDetails) return <div>Location not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-5">
      <div className="bg-white shadow-md rounded-lg overflow-hidden"> 
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{locationDetails.properties.Address}</h2>
        </div>
        <div className="p-4">
          <p><strong>Currently Used As:</strong> {locationDetails.properties.CurrentUse}</p>
          <p><strong>Former Use:</strong> {locationDetails.properties.FormerUse}</p>
          <p><strong>Construction Date:</strong> {locationDetails.properties.Date_Const}</p>
          <p><strong>Extent of The Building That Remains Historical :</strong> {locationDetails.properties.Extent}</p>
          <button
            onClick={() => window.history.back()}
            className="btn btn-primary btn-outline"
          >
            Go Back
          </button>
          {/* Display other details as needed */}
        </div>
        <div className='p-4'>
          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div className="collapse-title text-xl font-medium">
              Learn More
            </div>
            <div className="collapse-content"> 
            <h1><strong>Title:</strong> {wikiInfo?.title}</h1>
            <p><strong>Summary:</strong> {wikiInfo?.content}</p>
            {wikiInfo?.image_url && <img src={wikiInfo?.image_url} alt="Wikipedia Image" className="max-w-xs mt-2" />}
            <p>
              Read more on 
              <a href={wikiInfo?.url} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-wavy decoration-2 hover:decoration-4 transition-all ease-in-out duration-300 ml-2">
                Wikipedia
              </a>.
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;
