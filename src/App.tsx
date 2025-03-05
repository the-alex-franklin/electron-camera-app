import { useState, useRef, useEffect } from 'react';
import 'virtual:uno.css';

export function App() {
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [showPlayback, setShowPlayback] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      streamRef.current = stream;

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
    setShowPlayback(false);
    chunksRef.current = [];
  };

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      {!showPlayback ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-gradient-to-t from-black-70 to-transparent">
            {!recording ? (
              <button
                onClick={startRecording}
                className="bg-red-5 hover:bg-red-6 text-white rounded-full flex-center w-16 h-16 shadow-lg"
              >
                <div className="w-6 h-6 rounded-full bg-white"></div>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-gray-5 hover:bg-gray-6 text-white rounded-full flex-center w-16 h-16 shadow-lg"
              >
                <div className="w-6 h-6 bg-white"></div>
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {videoBlob && (
            <video
              src={URL.createObjectURL(videoBlob)}
              controls
              className="absolute inset-0 w-full h-full object-contain bg-black"
              autoPlay
            />
          )}

          <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-gradient-to-t from-black-70 to-transparent">
            <button
              onClick={discardRecording}
              className="bg-red-5 hover:bg-red-6 text-white px-6 py-2 rounded-lg mr-3 shadow-lg"
            >
              Discard
            </button>
          </div>
        </>
      )}
    </div>
  );
}
