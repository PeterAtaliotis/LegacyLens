import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LocationInfo from '../components/LocationInfo';




const LocationDetails = () => {
  const { id } = useParams();
  const [locationDetails, setLocationDetails] = useState(null);
  const [wikiInfo, setWikiInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voice, setVoice] = useState(null);

  
const infoToSpeak = useMemo(() => {
  return wikiInfo && wikiInfo.title && wikiInfo.content
    ? `${wikiInfo.title}. ${wikiInfo.content}`
    : "No additional information available.";
}, [wikiInfo]);


  const navigate = useNavigate();

  const handleNavigate = (locationId) => {
    navigate(`/location/community/${locationId}`);
  };

  const handleNavigateToUpload = () => {
    navigate(`/location/${id}/upload`);
  };


  useEffect(() => {
    const populateVoiceList = () => {
      const voices = window.speechSynthesis.getVoices();
      const localVoice = voices.find(voice => voice.localService);
      setVoice(localVoice || null);
      console.log('Available voices:', voices.map(v => `${v.name} - Local: ${v.localService}`)); 
    };

    populateVoiceList();
    speechSynthesis.onvoiceschanged = populateVoiceList;
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const speech = new SpeechSynthesisUtterance(infoToSpeak);
      speech.voice = voice; 

      speech.onend = () => {
        console.log('Speech has finished.');
      };
      speech.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
      };
      window.speechSynthesis.speak(speech);
    } else {
      alert("Text-to-Speech is not supported in your browser.");
    }
  };
  

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
      <LocationInfo locationDetails={locationDetails} handleNavigate={handleNavigate} />
      <button
          onClick={() => window.history.back()}
          className="btn btn-primary btn-outline"
        >
          Go Back
        </button>
        <button className="btn btn-neutral mt-2 ml-2"
          onClick={() => handleNavigate(locationDetails._id)} 
          >
            Go to community section
        </button>
        <button onClick={handleNavigateToUpload} className="btn btn-accent mt-2 ml-2">
           Upload Image
        </button>
      <div className='p-0 mt-3'>
        <div className="collapse collapse-arrow bg-base-200">
          <input type="checkbox" /> 
          <div className="collapse-title text-xl font-medium">
            Learn More About The Area
          </div>
          <div className="collapse-content"> 
          <h1><strong>Title:</strong> {wikiInfo?.title}</h1>
          <p><strong>Summary:</strong> {wikiInfo?.content}</p>
          {wikiInfo?.image_url && <img src={wikiInfo?.image_url} alt="Wikipedia Image" className="max-w-xs mt-2" />}
          <p>
            <button
              className="btn btn-secondary mr-2"
              onClick={() => window.open(wikiInfo?.url, '_blank', 'noopener,noreferrer')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-6" >
                <path d="M640 51.2l-.3 12.2c-28.1 .8-45 15.8-55.8 40.3-25 57.8-103.3 240-155.3 358.6H415l-81.9-193.1c-32.5 63.6-68.3 130-99.2 193.1-.3 .3-15 0-15-.3C172 352.3 122.8 243.4 75.8 133.4 64.4 106.7 26.4 63.4 .2 63.7c0-3.1-.3-10-.3-14.2h161.9v13.9c-19.2 1.1-52.8 13.3-43.3 34.2 21.9 49.7 103.6 240.3 125.6 288.6 15-29.7 57.8-109.2 75.3-142.8-13.9-28.3-58.6-133.9-72.8-160-9.7-17.8-36.1-19.4-55.8-19.7V49.8l142.5 .3v13.1c-19.4 .6-38.1 7.8-29.4 26.1 18.9 40 30.6 68.1 48.1 104.7 5.6-10.8 34.7-69.4 48.1-100.8 8.9-20.6-3.9-28.6-38.6-29.4 .3-3.6 0-10.3 .3-13.6 44.4-.3 111.1-.3 123.1-.6v13.6c-22.5 .8-45.8 12.8-58.1 31.7l-59.2 122.8c6.4 16.1 63.3 142.8 69.2 156.7L559.2 91.8c-8.6-23.1-36.4-28.1-47.2-28.3V49.6l127.8 1.1 .2 .5z"/></svg>
               Read More On Wikipedia
            </button>
            <button className="btn btn-info mt-2" onClick={speak}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-6">
              <path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg>             Listen To This Information</button>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;
