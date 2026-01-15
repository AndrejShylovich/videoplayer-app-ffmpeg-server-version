# 🎬 Video Editor Application

A full‑stack **Next.js video editor** that allows users to:

* Upload a video
* Preview and play it with custom controls
* Generate timeline thumbnails
* Trim a selected range
* Download the trimmed result

The app uses **FFmpeg on the server** and **React hooks on the client** for a clean, modular architecture.

---

## ✨ Features

### Client‑side

* Drag‑and‑drop video upload
* Instant local video preview
* Custom video player (play/pause, seek, skip, volume)
* Timeline thumbnails with click‑to‑seek
* Visual trim range selection
* Adjustable video quality (CRF)
* Toast‑based error feedback

### Server‑side

* Secure video uploads
* Frame extraction for thumbnails
* Video trimming with FFmpeg
* Abortable FFmpeg jobs
* Path validation to prevent directory traversal

---

## 🧱 Tech Stack

* **Framework:** Next.js (App Router)
* **Frontend:** React, Tailwind CSS
* **Backend:** Node.js, FFmpeg (via `fluent-ffmpeg`)
* **Video Processing:** FFmpeg
* **Notifications:** react-toastify

---

## 📁 Project Structure

```txt
app/
├── api/
│   ├── upload-video/        # Upload MP4 files
│   ├── frames-preview/      # Generate preview frames
│   ├── trim-video/          # Trim video segments
│   └── uploads/[...path]/   # Serve stored files
│
├── data/
│   ├── video/               # Uploaded videos
│   ├── frames/              # Generated thumbnails
│   └── trimmed/             # Trimmed output videos
│
├── features/
│   ├── videoPlayer/
│   ├── videoUpload/
│   └── videoTrimmer/
│
├── components/ui/           # Reusable UI components
├── hooks/                   # Shared hooks (error handling)
├── utils/                   # Utility functions
└── pages/MainPage.jsx
```

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

* Node.js **18+**
* FFmpeg installed and available in PATH

Check FFmpeg:

```bash
ffmpeg -version
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Run Development Server

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

## 🔌 API Endpoints

### `POST /api/upload-video`

Uploads a video file.

**Request** (multipart/form-data):

* `videoFile`: MP4 file

**Response**:

```json
{ "success": true, "filePath": "/absolute/path/to/file.mp4" }
```

---

### `POST /api/frames-preview`

Generates thumbnail frames.

**Body**:

```json
{
  "filePath": "...",
  "fps": 3,
  "frameWidth": 120
}
```

**Response**:

```json
{ "success": true, "frames": ["/api/uploads/frames/...jpg"] }
```

---

### `POST /api/trim-video`

Trims a video segment.

**Body**:

```json
{
  "filePath": "...",
  "start": 5,
  "end": 15,
  "crf": 18
}
```

**Response**:

```json
{ "success": true, "url": "/api/uploads/trimmed/output.mp4" }
```

---

### `GET /api/uploads/[...path]`

Serves stored videos and images.

---

## 🛡️ Security

* All video paths are validated to stay inside `app/data`
* Only `.mp4` files are accepted for processing
* FFmpeg jobs are aborted on request cancellation

---

## 🧠 Architecture Notes

* Heavy logic is encapsulated in **custom React hooks**
* Server FFmpeg tasks are fully abortable
* UI components are memoized where appropriate
* Errors are centralized and surfaced via toasts

---

## 📦 Output Files

* **Uploaded videos:** `app/data/video/`
* **Thumbnails:** `app/data/frames/<videoId>/`
* **Trimmed videos:** `app/data/trimmed/`

---

## 🧪 Known Limitations

* Single‑user local storage (no database)
* MP4 only
* No authentication

---

## 📌 Future Improvements

* Timeline zooming
* Multiple trim segments
* Audio waveform display
* Cloud storage (S3, GCS)
* Authentication & user sessions

---


