"use client";

import CustomButton from "../components/ui/CustomButton";
import VideoPlayer from "../features/videoPlayer/VideoPlayer";
import VideoUpload from "../features/videoUpload/VideoUpload";
import { useVideoUpload } from "../features/videoUpload/hooks/useVideoUpload";

/**
 * Main page of the video editor app.
 * Handles video upload, playback, and reset functionality.
 */
const MainPage = () => {
  // Custom hook for handling video upload state and actions
  const {
    videoUrl,       // URL of the uploaded video for preview
    serverFilePath, // Path to the video stored on the server
    isLoading,      // Upload in progress indicator
    error,          // Error message if upload fails
    uploadFile,     // Function to upload a new file
    reset,          // Function to reset the current video state
  } = useVideoUpload();

  return (
    <div className="video-editor p-4 max-w-3xl mx-auto space-y-4">
      {/* Show upload component if no video is selected */}
      {!videoUrl || !serverFilePath ? (
        <VideoUpload isLoading={isLoading} onFile={uploadFile} />
      ) : (
        <>
          {/* Button to reset and select another video */}
          <CustomButton onClick={reset} className="text-blue-600 self-start">
            Select another file
          </CustomButton>

          {/* Video preview player */}
          <VideoPlayer
            key={videoUrl} // force re-render when video changes
            videoUrl={videoUrl}
            serverFilePath={serverFilePath}
          />
        </>
      )}

      {/* Display error message if upload fails */}
      {error && (
        <div className="p-2 bg-red-100 text-red-800 rounded">
          {typeof error === "string" ? error : error.message}
        </div>
      )}
    </div>
  );
};

export default MainPage;
