'use client';

import { useState, useEffect, useRef } from "react";
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react";

const MAX_DURATION_MS = 10_000;
const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return null;
  for (const candidate of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported?.(candidate)) return candidate;
  }
  return "";
}

// In-browser pronunciation recorder: record (max 10s) → preview → re-record.
// Calls onAudioReady({ base64, mimeType, durationMs }) once a recording is
// captured, and onClear() when the user discards it.
export default function AudioRecorder({ onAudioReady, onClear }) {
  const [supported, setSupported] = useState(true);
  const [permissionError, setPermissionError] = useState(null);
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const audioElRef = useRef(null);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === "undefined") {
      setSupported(false);
    }
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
    const mimeType = pickMimeType();
    if (mimeType === null) { setSupported(false); return; }

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
    setIsPlaying(false);
    onClear?.();
    startRecording();
  }

  function togglePlay() {
    if (!audioElRef.current) return;
    if (isPlaying) {
      audioElRef.current.pause();
    } else {
      audioElRef.current.play().catch(() => {});
    }
  }

  if (!supported) {
    return (
      <div style={{ padding: "12px 14px", borderRadius: 10, background: "#FEF3E2", color: "#8B6020", fontSize: 13 }}>
        Recording isn't supported in this browser. Try a recent version of Chrome, Firefox, or Safari.
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {permissionError && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FDEDEC", color: "#C0392B", fontSize: 12, marginBottom: 10 }}>
          {permissionError}
        </div>
      )}

      {!previewUrl && !recording && (
        <button type="button" onClick={startRecording}
          style={{ width: "100%", padding: "14px", borderRadius: 10, background: "#C0392B", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Mic size={16} /> Start Recording
        </button>
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
            <button type="button" onClick={reRecord}
              style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#F5F0EA", color: "#6B5B45", border: "1px solid #E8DDD0", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <RotateCcw size={14} /> Re-record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
