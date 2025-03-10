import { useState, useRef, useEffect } from 'react';
import { ToastType } from '../components/Toast';
import { VideoFormat } from '../components/FormatSelector';
import { Resolution } from '../components/ResolutionSelector';

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
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat>('mp4');
  const [selectedResolution, setSelectedResolution] = useState<Resolution>('1080p');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const initCamera = async () => {
    try {
      await startCamera();
    } catch (err) {
      console.error('Camera initialization error:', err);
      showToast('Failed to initialize camera', 'error');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      initCamera();
    }, 1000);

    return () => {
      clearTimeout(timer);
      stopAllMediaTracks();
    };
  }, []);

  useEffect(() => {
    if (!cameraActive && !showPlayback) {
      // Small delay to avoid rapid camera reconnection attempts
      setTimeout(() => startCamera(), 500);
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

    try {
      streamRef.current.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });

      // Clean up video element references
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      streamRef.current = null;
    } catch (err) {
      console.error('Error stopping media tracks:', err);
    }
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

  const getResolutionConstraints = (resolution: Resolution) => {
    const constraints: MediaTrackConstraints = {};

    switch(resolution) {
      case '240p':
        constraints.width = { ideal: 426 };
        constraints.height = { ideal: 240 };
        break;
      case '360p':
        constraints.width = { ideal: 640 };
        constraints.height = { ideal: 360 };
        break;
      case '480p':
        constraints.width = { ideal: 854 };
        constraints.height = { ideal: 480 };
        break;
      case '540p':
        constraints.width = { ideal: 960 };
        constraints.height = { ideal: 540 };
        break;
      case '720p':
        constraints.width = { ideal: 1280 };
        constraints.height = { ideal: 720 };
        break;
      case '1080p':
        constraints.width = { ideal: 1920 };
        constraints.height = { ideal: 1080 };
        break;
      default:
        constraints.width = { ideal: 1280 };
        constraints.height = { ideal: 720 };
    }

    return constraints;
  };

  const startCamera = async () => {
    // If camera is already active and we have a valid stream, return
    if (cameraActive && streamRef.current) return;

    // Make sure to clean up any previous stream first
    stopAllMediaTracks();

    try {
      if (!videoRef.current) return;

      const videoConstraints = getResolutionConstraints(selectedResolution);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: true,
      });

      // Set the stream on the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Create stable reference to video element for async operations
      const videoElement = videoRef.current;

      // Wait for metadata to load before attempting to play
      const playVideo = async () => {
        if (!videoElement) return;

        try {
          // Add event listener to handle loadedmetadata before playing
          const playPromise = new Promise((resolve, reject) => {
            const handleCanPlay = () => {
              videoElement.removeEventListener('canplay', handleCanPlay);
              videoElement.play()
                .then(resolve)
                .catch(reject);
            };

            if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA or higher
              videoElement.play()
                .then(resolve)
                .catch(reject);
            } else {
              videoElement.addEventListener('canplay', handleCanPlay);
            }
          });

          await playPromise;
        } catch (err) {
          console.error('Play failed:', err);
          // If first attempt failed, try again with a delay
          setTimeout(() => {
            if (videoElement && videoElement.paused) {
              videoElement.play().catch(e => console.error('Final play attempt failed:', e));
            }
          }, 1000);
        }
      };

      // Delay play to ensure DOM is stable
      setTimeout(playVideo, 500);

      streamRef.current = stream;
      setCameraActive(true);

      const getMimeType = (): string => {
        const mimeTypes = {
          webm: 'video/webm;codecs=vp9,opus',
          mp4: 'video/mp4',
          avi: 'video/avi',
          mov: 'video/mov',
        };

        const preferredType = mimeTypes[selectedFormat];

        if (MediaRecorder.isTypeSupported(preferredType)) {
          return preferredType;
        }

        for (const type of Object.values(mimeTypes)) {
          if (MediaRecorder.isTypeSupported(type)) {
            return type;
          }
        }

        return '';
      };

      const options = {
        mimeType: getMimeType(),
        videoBitsPerSecond: 2500000,
      };

      const mediaRecorder = new MediaRecorder(stream, options.mimeType ? options : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = selectedFormat === 'webm' ? 'video/webm' : 'video/mp4';
        const blob = new Blob(chunksRef.current, { type: mimeType });
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

    mediaRecorderRef.current?.start(1000);
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
      const result = await window.ipcRenderer.invoke('save-recording', {
        buffer: Array.from(buffer),
        format: selectedFormat,
      });

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

  const handleFormatChange = (format: VideoFormat) => {
    setSelectedFormat(format);
  };

  const handleResolutionChange = (resolution: Resolution) => {
    setSelectedResolution(resolution);

    if (cameraActive) {
      stopAllMediaTracks();
      setCameraActive(false);

      setTimeout(() => {
        startCamera();
      }, 500);
    }
  };

  return {
    recording,
    videoBlob,
    showPlayback,
    isPlaying,
    videoUrl,
    cameraActive,
    selectedFormat,
    selectedResolution,
    videoRef,
    playbackRef,
    startRecording,
    stopRecording,
    togglePlayback,
    handleVideoEnded,
    discardRecording,
    saveRecording,
    handleFormatChange,
    handleResolutionChange,
  };
};
