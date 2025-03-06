import { FC } from 'react';

type RecordButtonProps = {
  recording: boolean;
  cameraActive: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
};

export const RecordButton: FC<RecordButtonProps> = ({
  recording,
  cameraActive,
  onStartRecording,
  onStopRecording,
}) => {
  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
      <div className="bg-black/60 backdrop-blur-lg p-3 rounded-full shadow-xl border border-white/10">
        <button
          onClick={recording ? onStopRecording : onStartRecording}
          className={`${ recording ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 'bg-gradient-to-br from-red-400 to-red-600' } text-white rounded-full flex-center w-14 h-14 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl border-2 ${recording ? 'border-gray-300/30' : 'border-red-300/30'}`}
          disabled={!cameraActive}
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className={`w-5 h-5 ${recording ? 'rounded' : 'rounded-full'} bg-white shadow-inner`}></div>
          </div>
        </button>
      </div>
    </div>
  );
};
