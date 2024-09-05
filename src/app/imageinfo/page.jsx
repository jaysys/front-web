"use client";

import { useState } from "react";

export default function ImageInfoPage() {
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Function to handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Function to handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError("Please select an image first.");
      return;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(image.type)) {
      setError("Only JPEG and PNG images are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("ImageInfo", image); // Append the selected image

    try {
      const res = await fetch("http://127.0.0.1:8000/getimageinfo/", {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        setError(null);
      } else {
        const errorData = await res.json();
        setError(`Error: ${errorData.detail || "Something went wrong"}`);
        setResponse(null);
      }
    } catch (err) {
      setError("Failed to send request. Please check your server.");
      setResponse(null);
    }
  };

  return (
    <div>
      <h1>Upload Image and Get Info (JPEG/PNG)</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/jpeg, image/png"
          onChange={handleFileChange}
        />
        <button type="submit">Get Image Info</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {response && (
        <div>
          <h2>Image Info:</h2>
          <p>
            <strong>Filename:</strong> {response.filename}
          </p>
          <p>
            <strong>Width:</strong> {response.width}px
          </p>
          <p>
            <strong>Height:</strong> {response.height}px
          </p>
        </div>
      )}
    </div>
  );
}
