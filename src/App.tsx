import 'virtual:uno.css';
import './toast-animations.css';
import { CameraView } from './components/CameraView';
import { VideoPlayback } from './components/VideoPlayback';
import { Toast } from './components/Toast';
import { RecordingSettings } from './components/RecordingSettings';
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
  } = useCamera({ showToast });

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      <RecordingSettings
        selectedFormat={selectedFormat}
        selectedResolution={selectedResolution}
        onFormatChange={handleFormatChange}
        onResolutionChange={handleResolutionChange}
      />

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
          selectedFormat={selectedFormat}
          onVideoEnded={handleVideoEnded}
          onTogglePlayback={togglePlayback}
          onDiscardRecording={discardRecording}
          onSaveRecording={saveRecording}
          onFormatChange={handleFormatChange}
        />
      )}

      {toast && <Toast {...toast} />}
    </div>
  );
}
