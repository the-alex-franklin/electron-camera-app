import 'virtual:uno.css';
import './animations.css';
import { CameraView } from './components/CameraView';
import { VideoPlayback } from './components/VideoPlayback';
import { Toast } from './components/Toast';
import { useToast } from './hooks/useToast';
import { useCamera } from './hooks/useCamera';

export function App() {
  const { toast, showToast } = useToast();
  
  const {
    recording,
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
    saveRecording
  } = useCamera({ showToast });

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      <div className={showPlayback ? 'hidden' : ''}>
        <CameraView
          videoRef={videoRef}
          recording={recording}
          cameraActive={cameraActive}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
        />
      </div>

      {showPlayback && videoUrl && (
        <VideoPlayback
          videoUrl={videoUrl}
          playbackRef={playbackRef}
          isPlaying={isPlaying}
          onVideoEnded={() => handleVideoEnded()}
          onTogglePlayback={togglePlayback}
          onDiscardRecording={discardRecording}
          onSaveRecording={saveRecording}
        />
      )}

      {toast && <Toast {...toast} />}
    </div>
  );
}