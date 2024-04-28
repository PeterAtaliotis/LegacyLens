import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";

const ImageUpload = () => {
    const { id } = useParams();  
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [altText, setAltText] = useState('');
    const [images, setImages] = useState([]);
    const navigate = useNavigate();  // Instantiate navigate function

    const goToLocationDetails = () => {
        navigate(`/location/${id}`);
    };

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/photos/location/${id}`);
                const photos = await response.json();
                if (response.ok && photos.length > 0) {
                    setImages(photos.map(photo => ({
                        ...photo,
                        user_id: photo.uploaded_by  // Ensure each photo includes the user_id
                    })));
                } else if (photos.length === 0) {
                    console.log("No photos found for this location.");
                } else {
                    throw new Error("Failed to fetch photos.");
                }
            } catch (error) {
                console.error("Error fetching photos:", error);
            }
        };

        if (id) fetchPhotos();
    }, [id]);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!isAuthenticated) {
            alert("You must be logged in to upload images.");
            return;
        }
        if (!file || !description || !altText) {
            alert("All fields must be filled out before uploading");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', user.sub);
        formData.append('location_id', id);
        formData.append('description', description);
        formData.append('alt_text', altText);

        try {
            const token = await getAccessTokenSilently();
            const response = await fetch('http://localhost:8080/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                setImages(prev => [...prev, {
                    ...result,
                    file_path: result.file_url,  // Ensure to map the correct properties
                    user_id: user.sub
                }]);
                alert("Upload successful!");
            } else {
                throw new Error(result.error || "Failed to upload image.");
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeletePhoto = async (photoId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this photo?");
        if (!confirmDelete) return;

        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`http://localhost:8080/api/photos/${photoId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: user.sub }),
            });

            if (response.ok) {
                setImages(prevImages => prevImages.filter(image => image._id !== photoId));
                alert("Photo deleted successfully.");
            } else {
                const result = await response.json();
                throw new Error(result.error || "Failed to delete photo.");
            }
        } catch (error) {
            console.error("Error deleting photo:", error);
            alert(error.message);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Select your image</span>
                </label>
                <input type="file" className="file-input file-input-bordered file-input-secondary w-full max-w-xs" onChange={handleFileChange} />
                <input type="text" placeholder="Description" className="input input-bordered mt-2" value={description} onChange={(e) => setDescription(e.target.value)} />
                <input type="text" placeholder="Alt Text" className="input input-bordered mt-2" value={altText} onChange={(e) => setAltText(e.target.value)} />
                <button className="btn btn-secondary mt-4" onClick={handleUpload}>Upload</button>
                <button onClick={() => window.history.back()} className="btn btn-primary btn-outline mt-2 mr-2">Go Back</button>
                <button className="btn btn-accent mt-2" onClick={goToLocationDetails}>View Location Details</button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-5">
                {images.map((photo, index) => (
                    <div key={index} className="p-2">
                        <img src={photo.file_path} alt={photo.alt} className="rounded-lg" />
                        <div>{photo.description}</div>
                        {isAuthenticated && user.sub === photo.user_id && (
                            <button className="btn btn-error" onClick={() => handleDeletePhoto(photo._id)}>Delete</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageUpload;
