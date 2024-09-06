// src/app/batchjob/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { startBatchJob, stopBatchJob } from "@/lib/api";
import styles from "@/styles/BatchJob.module.css";

export default function BatchJob() {
  const [isJobRunning, setIsJobRunning] = useState(false); // 배치 작업이 실행 중인지 여부
  const [jobStartTime, setJobStartTime] = useState(null); // 배치 작업 시작 시간
  const [executionCount, setExecutionCount] = useState(0); // 배치 작업 수행 횟수
  const intervalRef = useRef(null);

  // 배치 작업 시작
  const handleStart = async () => {
    await startBatchJob(); // Start batch job on the server
    setIsJobRunning(true);
    setJobStartTime(new Date());
    setExecutionCount(0);

    intervalRef.current = setInterval(async () => {
      try {
        await startBatchJob();
        setExecutionCount((prev) => prev + 1); // 수행 횟수 증가
      } catch (error) {
        console.error("Batch job failed:", error);
      }
    }, 5000); // 5초 (1,000ms) 간격
  };

  // 배치 작업 중단
  const handleStop = async () => {
    await stopBatchJob(); // Stop batch job on the server
    setIsJobRunning(false);
    clearInterval(intervalRef.current);
  };

  // 페이지가 종료되거나 리렌더링될 때 배치 작업 중지
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className={styles.container}>
      <h1>Batch Job</h1>
      {isJobRunning ? (
        <>
          <p>
            배치 작업이 {jobStartTime && jobStartTime.toLocaleString()}에
            시작되었습니다.
          </p>
          <p>현재까지 {executionCount}번 작업이 수행되었습니다.</p>
          <button onClick={handleStop} className={styles.stopButton}>
            Batch Job 종료
          </button>
        </>
      ) : (
        <button onClick={handleStart} className={styles.startButton}>
          Batch Job 시작
        </button>
      )}
    </div>
  );
}
