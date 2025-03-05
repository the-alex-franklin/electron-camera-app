import { useState, useRef, useEffect } from 'react';
import 'virtual:uno.css';
import './animations.css';

type ToastType = 'info' | 'error' | 'success';

type Toast = {
  message: string;
  type: ToastType;
  visible: boolean;
};

export function App() {
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [showPlayback, setShowPlayback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    if (!toast) return;
    
    const hideTimer = setTimeout(() => {
      setToast(current => current ? { ...current, visible: false } : null);
    }, 2700);
    
    const removeTimer = setTimeout(() => {
      setToast(null);
    }, 3000);
    
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [toast]);

  useEffect(() => {
    startCamera();
    return () => stopAllMediaTracks();
  }, []);

  useEffect(() => {
    if (!cameraActive) startCamera();
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
      videoRef.current.play().catch(err => showToast(`Error playing video: ${err}`, 'error'));

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
      showToast(`Error accessing camera: ${err}`, 'error');
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
          ? showToast('Save operation was canceled', 'info')
          : showToast(`Failed to save recording: ${result.error}`, 'error');
        return;
      }

      showToast(`Recording saved to: ${result.filePath}`, 'success');
      discardRecording();
    } catch (error) {
      showToast(`Error saving recording: ${error}`, 'error');
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
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center cursor-pointer text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 border-2 border-blue-300/30"
          >
            <div className="flex items-center justify-center w-full h-full text-4xl">{isPlaying ? "⏸" : "▶️"}</div>
          </button>
          <button
            onClick={discardRecording}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center cursor-pointer text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50 border-2 border-red-300/30"
          >
            <div className="flex items-center justify-center w-full h-full text-2xl">
              <span className="grayscale brightness-200">🗑️</span>
            </div>
          </button>
          <button
            onClick={saveRecording}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center cursor-pointer text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/50 border-2 border-green-300/30"
          >
            <div className="flex items-center justify-center w-full h-full text-2xl">
              <span className="grayscale brightness-200">💾</span>
            </div>
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

      {(() => {
        if (showPlayback) return renderPlaybackView();

        return (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <div className="bg-black/60 backdrop-blur-lg p-3 rounded-full shadow-xl border border-white/10">
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className={`${ recording ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 'bg-gradient-to-br from-red-400 to-red-600' } text-white rounded-full flex-center w-14 h-14 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl border-2 ${recording ? 'border-gray-300/30' : 'border-red-300/30'}`}
                  disabled={!cameraActive}
                >
                  <div className="flex flex-col items-center w-full h-full">
                    <div className={`w-8 h-8  ${recording ? 'rounded' : 'rounded-full'} bg-white shadow-inner`}></div>
                  </div>
                </button>
              </div>
            </div>
          );
        
      })()}

      {/* Toast */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg max-w-xs backdrop-blur-lg pointer-events-none ${
            (() => {
              if (toast.type === 'error') return 'bg-red-500/80 text-white';
              if (toast.type === 'success') return 'bg-green-500/80 text-white';
              return 'bg-blue-500/80 text-white';
            })()
          }`}
          style={{
            animation: (() => {
              if (toast.visible) return 'toast-slide-in 0.3s ease-out forwards';
              return 'toast-slide-out 0.3s ease-out forwards';
            })()
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}