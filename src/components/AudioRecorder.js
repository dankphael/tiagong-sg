'use client';

import { useState, useEffect, useRef } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Upload } from "lucide-react";

const MAX_DURATION_MS = 10_000;
const MAX_BASE64_CHARS = 1_400_000; // keep in sync with server's MAX_AUDIO_BASE64_CHARS
const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
const EXTENSION_MIME_TYPES = {
  mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac",
  wav: "audio/wav", flac: "audio/flac", ogg: "audio/ogg", webm: "audio/webm",
};

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return null;
  for (const candidate of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported?.(candidate)) return candidate;
  }
  return "";
}

function detectRecordSupport() {
  return !!(navigator.mediaDevices?.getUserMedia && typeof window.MediaRecorder !== "undefined");
}

function guessMimeType(file) {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return EXTENSION_MIME_TYPES[ext] || "audio/mpeg";
}

// Reads a file/blob's playback duration via a detached <audio> element.
// Some containers never report a finite duration — callers should treat a
// null result as "unknown" rather than a validation failure.
function readAudioDuration(url) {
  return new Promise(resolve => {
    const probe = document.createElement("audio");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => resolve(Number.isFinite(probe.duration) ? probe.duration * 1000 : null);
    probe.onerror = () => resolve(null);
    probe.src = url;
  });
}

// In-browser pronunciation contributor: record (max 10s) or upload an audio
// file, then preview → re-record/choose another. Calls
// onAudioReady({ base64, mimeType, durationMs }) once a clip is ready, and
// onClear() when the user discards it. Recording needs getUserMedia +
// MediaRecorder; uploading works on every device, so it's always offered.
export default function AudioRecorder({ onAudioReady, onClear }) {
  // Starts false to match server-rendered markup (recording needs browser
  // APIs unavailable during SSR), then flips after mount once we can check.
  const [recordSupported, setRecordSupported] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [audioSource, setAudioSource] = useState(null); // 'record' | 'upload'
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const audioElRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setRecordSupported(detectRecordSupport());
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  async function startRecording() {
    setPermissionError(null);
    setUploadError(null);
    const mimeType = pickMimeType();
    if (mimeType === null) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setAudioSource("record");
        stopStream();

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = String(reader.result).split(",")[1] || "";
          onAudioReady({ base64, mimeType: blob.type, durationMs: Date.now() - startTimeRef.current });
        };
        reader.readAsDataURL(blob);
      };

      startTimeRef.current = Date.now();
      recorder.start();
      setRecording(true);
      setElapsedMs(0);
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setElapsedMs(elapsed);
        if (elapsed >= MAX_DURATION_MS) stopRecording();
      }, 100);
    } catch (e) {
      console.error("Microphone access failed:", e);
      setPermissionError("Microphone access was denied. Check your browser's site permissions and try again.");
    }
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  function reRecord() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAudioSource(null);
    setIsPlaying(false);
    onClear?.();
    startRecording();
  }

  function chooseAnotherFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAudioSource(null);
    setIsPlaying(false);
    onClear?.();
    fileInputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    setPermissionError(null);
    setUploadError(null);

    const url = URL.createObjectURL(file);
    const durationMs = await readAudioDuration(url);
    if (durationMs != null && durationMs > MAX_DURATION_MS) {
      URL.revokeObjectURL(url);
      setUploadError(`This clip is ${(durationMs / 1000).toFixed(1)}s — please choose one under ${MAX_DURATION_MS / 1000}s.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = String(reader.result).split(",")[1] || "";
      if (base64.length > MAX_BASE64_CHARS) {
        URL.revokeObjectURL(url);
        setUploadError("This file is too large — please choose a shorter or more compressed clip.");
        return;
      }
      setPreviewUrl(url);
      setAudioSource("upload");
      onAudioReady({ base64, mimeType: guessMimeType(file), durationMs });
    };
    reader.onerror = () => {
      URL.revokeObjectURL(url);
      setUploadError("Couldn't read that file — please try another.");
    };
    reader.readAsDataURL(file);
  }

  function togglePlay() {
    if (!audioElRef.current) return;
    if (isPlaying) {
      audioElRef.current.pause();
    } else {
      audioElRef.current.play().catch(() => {});
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} style={{ display: "none" }} />

      {permissionError && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FDEDEC", color: "#C0392B", fontSize: 12, marginBottom: 10 }}>
          {permissionError}
        </div>
      )}
      {uploadError && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FDEDEC", color: "#C0392B", fontSize: 12, marginBottom: 10 }}>
          {uploadError}
        </div>
      )}

      {!previewUrl && !recording && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recordSupported && (
            <button type="button" onClick={startRecording}
              style={{ width: "100%", padding: "14px", borderRadius: 10, background: "#C0392B", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Mic size={16} /> Start Recording
            </button>
          )}
          {!recordSupported && (
            <div style={{ fontSize: 12, color: "#8B7355" }}>
              Recording isn't available in this browser — you can still upload a clip.
            </div>
          )}
          <button type="button" onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%", padding: "14px", borderRadius: 10,
              background: recordSupported ? "#F5F0EA" : "#C0392B",
              color: recordSupported ? "#6B5B45" : "white",
              border: recordSupported ? "1px solid #E8DDD0" : "none",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            <Upload size={16} /> Upload an audio file
          </button>
        </div>
      )}

      {recording && (
        <button type="button" onClick={stopRecording}
          style={{ width: "100%", padding: "14px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Square size={14} fill="currentColor" /> Recording… {(elapsedMs / 1000).toFixed(1)}s / 10s
        </button>
      )}

      {previewUrl && !recording && (
        <div>
          <audio ref={audioElRef} src={previewUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={togglePlay}
              style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#EAFAF1", color: "#1A6B3C", border: "1px solid #1A6B3C40", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />} {isPlaying ? "Playing" : "Preview"}
            </button>
            {audioSource === "upload" ? (
              <button type="button" onClick={chooseAnotherFile}
                style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#F5F0EA", color: "#6B5B45", border: "1px solid #E8DDD0", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Upload size={14} /> Choose a different file
              </button>
            ) : (
              <button type="button" onClick={reRecord}
                style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#F5F0EA", color: "#6B5B45", border: "1px solid #E8DDD0", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <RotateCcw size={14} /> Re-record
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
