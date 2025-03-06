import { FC } from 'react';

type PlaybackControlsProps = {
  isPlaying: boolean;
  onTogglePlayback: () => void;
  onDiscardRecording: () => void;
  onSaveRecording: () => void;
};

export const PlaybackControls: FC<PlaybackControlsProps> = ({
  isPlaying,
  onTogglePlayback,
  onDiscardRecording,
  onSaveRecording,
}) => {
  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
      <div className="bg-black/60 backdrop-blur-lg px-8 py-6 rounded-lg flex items-center gap-5">
        <button
          onClick={onTogglePlayback}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center cursor-pointer text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 border-2 border-blue-300/30"
        >
          <div className="flex items-center justify-center w-full h-full text-4xl">{isPlaying ? "⏸" : "▶️"}</div>
        </button>
        <button
          onClick={onDiscardRecording}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center cursor-pointer text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50 border-2 border-red-300/30"
        >
          <div className="flex items-center justify-center w-full h-full text-2xl">
            <span className="grayscale brightness-200">🗑️</span>
          </div>
        </button>
        <button
          onClick={onSaveRecording}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center cursor-pointer text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/50 border-2 border-green-300/30"
        >
          <div className="flex items-center justify-center w-full h-full text-2xl">
            <span className="grayscale brightness-200">💾</span>
          </div>
        </button>
      </div>
    </div>
  );
};
