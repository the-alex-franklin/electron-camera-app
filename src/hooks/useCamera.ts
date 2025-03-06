import { useState, useRef, useEffect } from 'react';
import { ToastType } from '../components/Toast';

type UseCameraProps = {
  showToast: (message: string, type: ToastType) => void;
};

export const useCamera = ({ showToast }: UseCameraProps) => {
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

  const handleVideoEnded = () => {
    setIsPlaying(false);
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
      videoRef.current.play();

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

  return {
    recording,
    videoBlob,
    showPlayback,
    isPlaying,
    videoUrl,
    cameraActive,
    videoRef,
    playbackRef,
    startRecording,
    stopRecording,
    togglePlayback,
    handleVideoEnded,
    discardRecording,
    saveRecording,
  };
};
