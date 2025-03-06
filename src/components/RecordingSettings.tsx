import { FC } from 'react';
import { FormatSelector, VideoFormat } from './FormatSelector';
import { ResolutionSelector, Resolution } from './ResolutionSelector';

type RecordingSettingsProps = {
  selectedFormat: VideoFormat;
  selectedResolution: Resolution;
  onFormatChange: (format: VideoFormat) => void;
  onResolutionChange: (resolution: Resolution) => void;
};

export const RecordingSettings: FC<RecordingSettingsProps> = ({
  selectedFormat,
  selectedResolution,
  onFormatChange,
  onResolutionChange,
}) => {
  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-black/60 backdrop-blur-lg p-3 rounded-md border border-white/10 flex flex-col gap-2 min-w-[180px]">
        <div className="text-xs uppercase text-white/70 font-semibold tracking-wider border-b border-white/10 pb-1 mb-1">Settings</div>
        <ResolutionSelector
          selectedResolution={selectedResolution}
          onSelect={onResolutionChange}
        />
        <FormatSelector
          selectedFormat={selectedFormat}
          onSelect={onFormatChange}
        />
      </div>
    </div>
  );
};
