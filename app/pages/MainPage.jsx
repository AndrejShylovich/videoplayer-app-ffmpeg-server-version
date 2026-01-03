"use client";

import React, { useCallback, useRef, useState } from "react";
import VideoPlayer from "../features/videoPlayer/VideoPlayer";
import { FFmpeg } from "@ffmpeg/ffmpeg";

const MainPage = () => {
  const [videoUrl, setVideoUrl] = useState();
  const [serverFilePath, setServerFilePath] = useState();
  const [isLoading, setIsLoading] = useState(false); // <--- новое состояние

  const ffmpegRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    setIsLoading(true); // <--- старт загрузки

    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }

    try {
      const formData = new FormData();
      formData.append("videoFile", file);

      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Uploaded video path:", data.filePath);
      setServerFilePath(data.filePath);
    } catch (err) {
      console.error("Upload failed:", err);
      setVideoUrl(null); // сбросить URL при ошибке
    } finally {
      setIsLoading(false); // <--- загрузка завершена
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setVideoUrl(null);
    };
  }, []);

  const handleUpload = useCallback(
    (e) => {
      setServerFilePath(null);
      const file = e.target.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  return (
    <div className="video-editor p-4 max-w-3xl mx-auto">
      {!videoUrl || !serverFilePath ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-md h-64 cursor-pointer transition-all duration-300 ${
            dragActive
              ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:scale-105"
          }`}
        >
          {isLoading ? ( // <--- показываем Loading... вместо Drag&Drop
            <p className="text-gray-500 text-lg font-medium">Loading...</p>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-blue-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h11a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
                />
              </svg>
              <p className="text-gray-500 text-center px-4">
                Перетащите видео сюда или нажмите, чтобы выбрать файл
              </p>
            </>
          )}

          <input
            type="file"
            accept="video/*"
            onChange={handleUpload}
            className="absolute w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      ) : (
        <>
          <label className="mt-4 flex items-center cursor-pointer text-blue-600 hover:text-blue-800">
            <input
              type="file"
              accept="video/*"
              onChange={handleUpload}
              className="hidden"
            />
            <span className="mr-2 underline">
              Нажмите, чтобы выбрать новый файл
            </span>
          </label>
          <VideoPlayer
            key={videoUrl}
            serverFilePath={serverFilePath}
            videoUrl={videoUrl}
            ffmpeg={ffmpegRef.current}
          />
        </>
      )}
    </div>
  );
};

export default MainPage;
