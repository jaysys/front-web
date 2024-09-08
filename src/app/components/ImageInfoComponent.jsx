"use client";

import { useState } from "react";

export default function ImageInfoComponent() {
  const [image, setImage] = useState(null);
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleXChange = (e) => setX(e.target.value);
  const handleYChange = (e) => setY(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError("Please select an image first.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(image.type)) {
      setError("Only JPEG and PNG images are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("ImageInfo", image);

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

  const handleMarkSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError("Please select an image first.");
      return;
    }

    // Use default values if x or y are empty
    const xCoord = x || "150";
    const yCoord = y || "150";

    if (isNaN(xCoord) || isNaN(yCoord)) {
      setError("Please enter valid numeric values for coordinates.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("x", xCoord);
    formData.append("y", yCoord);

    try {
      const res = await fetch("http://127.0.0.1:8000/putmarkonimage/", {
        method: "POST",
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
      <h1>Get Image Info & Manipulate (JPEG/PNG)</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/jpeg, image/png"
          onChange={handleFileChange}
        />
        <button type="submit">Get Image Info</button>
      </form>

      <form onSubmit={handleMarkSubmit}>
        <input
          type="number"
          value={x}
          onChange={handleXChange}
          placeholder="X coordinate"
        />
        <input
          type="number"
          value={y}
          onChange={handleYChange}
          placeholder="Y coordinate"
        />
        <button type="submit">Put Mark on Image</button>
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
          {response.url && (
            <div>
              <h2>Marked Image:</h2>
              <a href={response.url} download={response.filename}>
                Download Marked Image
              </a>
              <img
                src={response.url}
                alt="Marked"
                style={{ maxWidth: "500px", marginTop: "10px" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
