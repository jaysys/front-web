"use client";

import React, { useState } from "react";
import axios from "axios";

export default function ImageDifferencePage() {
  const [originalImage, setOriginalImage] = useState(null);
  const [modifiedImage, setModifiedImage] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null); // State for error messages

  const handleFileChange = (event, setImage) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage(null); // Reset any previous error message

    if (!originalImage || !modifiedImage) {
      alert("두 이미지를 모두 선택하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("original", originalImage);
    formData.append("modified", modifiedImage);

    try {
      const response = await axios.post("/api/findimgdiff", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
      setCoordinates(response.data.differences || []);
    } catch (error) {
      if (error.response) {
        // Handle the error response from the server
        if (error.response.status === 400) {
          setErrorMessage(error.response.data.error); // Set error message from the backend
        } else {
          setErrorMessage("이미지 비교 중 오류가 발생했습니다."); // Generic error message
        }
      } else {
        setErrorMessage("네트워크 오류가 발생했습니다."); // Network error message
      }
      console.error("Error comparing images", error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>이미지 비교</h1>
      <form onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <label>오리지널 이미지:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setOriginalImage)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>변경된 이미지:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setModifiedImage)}
          />
        </div>
        <button type="submit" style={styles.button}>
          비교하기
        </button>
      </form>

      {/* Error message display */}
      {errorMessage && (
        <div style={styles.errorContainer}>
          <p style={styles.errorMessage}>{errorMessage}</p>
        </div>
      )}

      {result && !errorMessage && (
        <div style={styles.resultContainer}>
          <h2>비교 결과</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>원본 파일명</th>
                <th>변경 파일명</th>
                <th>차이점 좌표 (x, y)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{result.originalFileName}</td>
                <td>{result.modifiedFileName}</td>
                <td>
                  {coordinates.length > 0 ? (
                    coordinates.map((coord, index) => (
                      <span key={index}>
                        [{coord[0]}, {coord[1]}]{" "}
                      </span>
                    ))
                  ) : (
                    <span>차이점 없음</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* 원본 이미지 위에 차이점 마킹 */}
          <div style={styles.imageContainer}>
            <img
              src={URL.createObjectURL(originalImage)}
              alt="Original"
              style={styles.image}
            />
            {coordinates.map((coord, index) => (
              <div
                key={index}
                style={{
                  ...styles.circle,
                  top: `${coord[1]}px`,
                  left: `${coord[0]}px`,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 스타일링을 위한 기본 CSS
const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  inputGroup: {
    marginBottom: "10px",
  },
  button: {
    backgroundColor: "#007BFF",
    color: "white",
    padding: "10px 15px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  errorContainer: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#f8d7da",
    borderRadius: "5px",
  },
  errorMessage: {
    color: "#721c24",
    fontWeight: "bold",
  },
  resultContainer: {
    marginTop: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  th: {
    borderBottom: "1px solid #ddd",
    padding: "8px",
  },
  td: {
    padding: "8px",
    borderBottom: "1px solid #ddd",
  },
  imageContainer: {
    position: "relative",
    display: "inline-block",
  },
  image: {
    maxWidth: "500px",
  },
  circle: {
    position: "absolute",
    width: "1px",
    height: "1px",
    borderRadius: "50%",
    border: "1px solid yellow",
    backgroundColor: "transparent",
    pointerEvents: "none",
  },
};
