import { FC, RefObject } from 'react';
import { RecordButton } from './RecordButton';

type CameraViewProps = {
  videoRef: RefObject<HTMLVideoElement>;
  recording: boolean;
  cameraActive: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
};

export const CameraView: FC<CameraViewProps> = ({
  videoRef,
  recording,
  cameraActive,
  onStartRecording,
  onStopRecording,
}) => {
  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
      />

      <RecordButton
        recording={recording}
        cameraActive={cameraActive}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
      />
    </>
  );
};
