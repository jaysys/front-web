"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/MarkedImages.module.css";

export default function MarkedImages() {
  const [images, setImages] = useState([]);

  // Function to fetch the image list from FastAPI
  const fetchImages = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/marked_images"); // Call FastAPI endpoint to get image URLs
      const data = await response.json();
      setImages(data.images); // Set image URLs to state
    } catch (error) {
      console.error("Failed to load images:", error);
    }
  };

  // Initial load of images when the component mounts
  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className={styles.container}>
      <h1>Marked Images</h1>

      {/* Refresh Button */}
      <button onClick={fetchImages} className={styles.refreshButton}>
        Refresh Images
      </button>

      {/* Image Grid */}
      <div className={styles.imageGrid}>
        {images.length > 0 ? (
          images.map((image, index) => (
            <div key={index} className={styles.imageContainer}>
              <img
                src={image} // Use the image URL directly
                alt={`Marked image ${index}`}
                className={styles.image}
              />
            </div>
          ))
        ) : (
          <p>No images found</p>
        )}
      </div>
    </div>
  );
}
