"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/MarkedImages.module.css";

export default function MarkedImages() {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]); // State to track selected images

  // Fetch the image list from FastAPI
  const fetchImages = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/images");
      const data = await response.json();
      setImages(data.images); // Set image URLs to state
    } catch (error) {
      console.error("Failed to load images:", error);
    }
  };

  // Handle image selection (single or multi-select)
  const toggleImageSelection = (image) => {
    setSelectedImages((prevSelectedImages) => {
      if (prevSelectedImages.includes(image)) {
        // If the image is already selected, unselect it
        return prevSelectedImages.filter((img) => img !== image);
      } else {
        // Otherwise, add it to the selected images
        return [...prevSelectedImages, image];
      }
    });
  };

  // Delete selected images
  const deleteSelectedImages = async () => {
    try {
      // Send delete requests to the FastAPI server for each selected image
      await Promise.all(
        selectedImages.map((image) => {
          // Extract the image name from URL if needed
          const imageName = new URL(image).pathname.split("/").pop();
          return fetch(`http://127.0.0.1:8000/images/${imageName}`, {
            method: "DELETE",
          });
        })
      );

      // Remove the deleted images from the displayed list
      setImages((prevImages) =>
        prevImages.filter((image) => !selectedImages.includes(image))
      );

      // Clear the selected images
      setSelectedImages([]);
    } catch (error) {
      console.error("Failed to delete images:", error);
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

      {/* Delete Button */}
      {selectedImages.length > 0 && (
        <button onClick={deleteSelectedImages} className={styles.deleteButton}>
          Delete Selected Images ({selectedImages.length})
        </button>
      )}

      {/* Image Grid */}
      <div className={styles.imageGrid}>
        {images.length > 0 ? (
          images.map((image, index) => (
            <div
              key={index}
              className={`${styles.imageContainer} ${
                selectedImages.includes(image) ? styles.selected : ""
              }`}
              onClick={() => toggleImageSelection(image)}
            >
              <img
                src={image}
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
