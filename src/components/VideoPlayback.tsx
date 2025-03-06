import { FC, RefObject } from 'react';
import { PlaybackControls } from './PlaybackControls';

type VideoPlaybackProps = {
  videoUrl: string | null;
  playbackRef: RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  onVideoEnded: () => void;
  onTogglePlayback: () => void;
  onDiscardRecording: () => void;
  onSaveRecording: () => void;
};

export const VideoPlayback: FC<VideoPlaybackProps> = ({
  videoUrl,
  playbackRef,
  isPlaying,
  onVideoEnded,
  onTogglePlayback,
  onDiscardRecording,
  onSaveRecording,
}) => {
  return (
    <>
      {videoUrl && (
        <video
          ref={playbackRef}
          src={videoUrl}
          onEnded={onVideoEnded}
          className="absolute inset-0 w-full h-full object-cover bg-black -scale-x-100"
        />
      )}

      <PlaybackControls
        isPlaying={isPlaying}
        onTogglePlayback={onTogglePlayback}
        onDiscardRecording={onDiscardRecording}
        onSaveRecording={onSaveRecording}
      />
    </>
  );
};
