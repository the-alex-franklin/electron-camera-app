import { FC, useState } from 'react';

export type Resolution =
  | '240p'
  | '360p'
  | '480p'
  | '540p'
  | '720p'
  | '1080p'

interface ResolutionSelectorProps {
  onSelect: (resolution: Resolution) => void;
  selectedResolution: Resolution;
}

export const ResolutionSelector: FC<ResolutionSelectorProps> = ({
  onSelect,
  selectedResolution,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const resolutions: Resolution[] = [
    '240p',
    '360p',
    '480p',
    '540p',
    '720p',
    '1080p',
  ];

  const resolutionLabels: Record<Resolution, string> = {
    '240p': '240p (426×240)',
    '360p': '360p (640×360)',
    '480p': '480p (854×480)',
    '540p': '540p (960×540)',
    '720p': '720p (1280×720)',
    '1080p': '1080p (1920×1080)',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-md text-white flex items-center justify-between w-full hover:bg-white/10 transition-colors"
      >
        <span>Resolution: {selectedResolution}</span>
        <span className="text-xs opacity-60">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-black/80 backdrop-blur-lg rounded-md shadow-lg border border-white/10 overflow-y-auto max-h-[50vh] z-10">
          {resolutions.map(resolution => (
            <button
              key={resolution}
              onClick={() => {
                onSelect(resolution);
                setIsOpen(false);
              }}
              className={`w-full text-left whitespace-nowrap px-4 py-2 text-white hover:bg-white/10 transition-colors ${resolution === selectedResolution ? 'bg-white/20' : ''}`}
            >
              {resolutionLabels[resolution]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
