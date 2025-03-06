import { FC, useState } from 'react';

export type VideoFormat = 'webm' | 'mp4' | 'avi' | 'mov';

type FormatSelectorProps = {
  onSelect: (format: VideoFormat) => void;
  selectedFormat: VideoFormat;
}

export const FormatSelector: FC<FormatSelectorProps> = ({ onSelect, selectedFormat }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formats: VideoFormat[] = ['webm', 'mp4', 'avi', 'mov'];

  const formatLabels: Record<VideoFormat, string> = {
    webm: 'WebM',
    mp4: 'MP4',
    avi: 'AVI',
    mov: 'QuickTime (MOV)',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-md text-white flex items-center justify-between w-full hover:bg-white/10 transition-colors"
      >
        <span>Format: {formatLabels[selectedFormat]}</span>
        <span className="text-xs opacity-60">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-black/80 backdrop-blur-lg rounded-md shadow-lg border border-white/10 overflow-y-auto max-h-[50vh] z-10">
          {formats.map(format => (
            <button
              key={format}
              onClick={() => {
                onSelect(format);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors ${
                format === selectedFormat ? 'bg-white/20' : ''
              }`}
            >
              {formatLabels[format]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
