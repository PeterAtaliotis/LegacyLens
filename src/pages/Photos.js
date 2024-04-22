import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";

const ImageUpload = () => {
    const { id } = useParams();  // Assuming `id` is the locationId
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [altText, setAltText] = useState('');
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/photos/location/${id}`);
                const photos = await response.json();
                if (response.ok && photos.length > 0) {
                    setImages(photos.map(photo => photo.file_path));  // Assuming the photo URL is stored in `file_path`
                } else if (photos.length === 0) {
                    console.log("No photos found for this location.");  // Handle the case where no photos exist
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
        if (!file) {
            alert("Please select a file first!");
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
                setImages(prev => [...prev, result.file_url]);
                alert("Upload successful!");
            } else {
                throw new Error(result.error || "Failed to upload image.");
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Select your image</span>
                </label>
                <input type="file" className="input input-bordered" onChange={handleFileChange} />
                <input type="text" placeholder="Description" className="input input-bordered mt-2" value={description} onChange={(e) => setDescription(e.target.value)} />
                <input type="text" placeholder="Alt Text" className="input input-bordered mt-2" value={altText} onChange={(e) => setAltText(e.target.value)} />
                <button className="btn btn-secondary mt-4" onClick={handleUpload}>Upload</button>
                <button
                    onClick={() => window.history.back()}
                    className="btn btn-primary btn-outline mt-2"
                    >
                    Go Back
                </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-5">
                {images.map((src, index) => (
                    <img key={index} src={src} alt={`Uploaded ${index}`} className="rounded-lg" />
                ))}
            </div>
        </div>
    );
};

export default ImageUpload;
