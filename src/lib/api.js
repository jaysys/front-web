// src/lib/api.js
import axios from "axios";

// 배치 작업 시작 요청
export const startBatchJob = async () => {
  try {
    const response = await axios.post("/api/batchjob");
    return response.data;
  } catch (error) {
    console.error("Failed to start batch job", error);
    throw error;
  }
};

// 배치 작업 중단 요청
export const stopBatchJob = async () => {
  try {
    const response = await axios.delete("/api/batchjob");
    return response.data;
  } catch (error) {
    console.error("Failed to stop batch job", error);
    throw error;
  }
};
