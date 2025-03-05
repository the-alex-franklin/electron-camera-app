import { useState, useRef, useEffect } from 'react';
import 'virtual:uno.css';

declare global {
  interface Window {
    ipcRenderer: {
      on: (channel: string, listener: (...args: any[]) => void) => void;
      off: (channel: string, listener: (...args: any[]) => void) => void;
      send: (channel: string, ...args: any[]) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}

export function App() {
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [showPlayback, setShowPlayback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    startCamera();

    return () => stopAllMediaTracks();
  }, []);

  useEffect(() => {
    if (!cameraActive) {
      startCamera();
    }
  }, [cameraActive, showPlayback]);

  useEffect(() => {
    if (!videoBlob) return;

    const url = URL.createObjectURL(videoBlob);
    setVideoUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [videoBlob]);

  const stopAllMediaTracks = () => {
    if (!streamRef.current) return;

    streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  const togglePlayback = () => {
    if (!playbackRef.current) return;

    const isPaused = playbackRef.current.paused;
    isPaused ? playbackRef.current.play() : playbackRef.current.pause();
    setIsPlaying(isPaused);
  };

  const startCamera = async () => {
    if (cameraActive && streamRef.current) return;

    try {
      if (!videoRef.current) return;

      stopAllMediaTracks();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error("Error playing video:", err));

      streamRef.current = stream;
      setCameraActive(true);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        setShowPlayback(true);
      };
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraActive(false);
    }
  };

  const startRecording = () => {
    chunksRef.current = [];
    mediaRecorderRef.current?.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const discardRecording = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    setShowPlayback(false);
    setIsPlaying(false);
    chunksRef.current = [];
  };

  const saveRecording = async () => {
    if (!videoBlob) return;

    try {
      const arrayBuffer = await videoBlob.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const result = await window.ipcRenderer.invoke('save-recording', Array.from(buffer));

      if (!result.success) {
        result.canceled
          ? console.log('Save operation was canceled')
          : console.error('Failed to save recording:', result.error);
        return;
      }

      console.log('Recording saved to:', result.filePath);
      discardRecording();
    } catch (error) {
      console.error('Error saving recording:', error);
    }
  };

  const renderPlaybackView = () => (
    <>
      {videoUrl && (
        <video
          ref={playbackRef}
          src={videoUrl}
          onEnded={() => setIsPlaying(false)}
          className="absolute inset-0 w-full h-full object-cover bg-black -scale-x-100"
        />
      )}

      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="bg-black/60 backdrop-blur-lg px-8 py-6 rounded-lg flex items-center gap-5">
          <button
            onClick={togglePlayback}
            className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer text-4xl leading-8 text-white transition-all duration-300 hover:scale-110"
          >
            <span>{isPlaying ? "⏸" : "▶️"}</span>
          </button>
          <button
            onClick={discardRecording}
            className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center cursor-pointer text-4xl leading-8 text-white transition-all duration-300 hover:scale-110"
          >
            <span className="grayscale brightness-200">🗑️</span>
          </button>
          <button
            onClick={saveRecording}
            className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center cursor-pointer text-4xl leading-8 text-white transition-all duration-300 hover:scale-110"
          >
            <span className="grayscale brightness-200">💾</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      <div className={showPlayback ? 'hidden' : ''}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />
      </div>

      {showPlayback ? renderPlaybackView() : (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="bg-black/60 backdrop-blur-lg p-3 rounded-full shadow-xl border border-white/10">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`${recording ? 'bg-gray-500' : 'bg-red-500'} text-white rounded-full flex-center w-14 h-14 shadow-lg transition-all duration-300 hover:scale-110`}
              disabled={!cameraActive}
            >
              <div className={`w-5 h-5 ${recording ? 'rounded' : 'rounded-full'} bg-white shadow-inner`}></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}