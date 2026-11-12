import React from 'react';

interface ACVLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export const ACVLogo: React.FC<ACVLogoProps> = ({
  size = 40,
  className = '',
  showText = false,
  textClassName = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* ACV Geometric Triangle Badge */}
      <svg
        width={size}
        height={size * 0.9}
        viewBox="0 0 200 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-md select-none transition-transform hover:scale-105 duration-200"
      >
        <defs>
          {/* Badge Background Gradient */}
          <linearGradient id="acvBgGrad" x1="100" y1="8" x2="100" y2="172" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          {/* Border Stroke Gradient */}
          <linearGradient id="acvBorderGrad" x1="20" y1="20" x2="180" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* Letter Gradient: Crisp White to Ice Blue */}
          <linearGradient id="acvLetterGrad" x1="100" y1="30" x2="100" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>

          {/* Verification Accent Gradient for V checkmark */}
          <linearGradient id="acvCheckGrad" x1="120" y1="100" x2="170" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* 1. Base Rounded Triangle Silhouette */}
        {/* Triangle vertices: (100, 12), (184, 162), (16, 162) with rounded corners */}
        <path
          d="M 91.5 21.5
             C 95.5 14.5, 104.5 14.5, 108.5 21.5
             L 182.5 149.5
             C 186.5 156.5, 182.0 165.0, 174.0 165.0
             L 26.0 165.0
             C 18.0 165.0, 13.5 156.5, 17.5 149.5
             Z"
          fill="url(#acvBgGrad)"
          stroke="url(#acvBorderGrad)"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* 2. Inner Viewfinder Calibration Guides (Ad Creative Inspection motif) */}
        <g stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.4" strokeLinecap="round">
          {/* Top Corner Viewfinder Crop Marks */}
          <path d="M 92 38 L 100 38 L 100 46" />
          <path d="M 108 38 L 100 38" />
          {/* Bottom Left Viewfinder Crop Mark */}
          <path d="M 32 144 L 32 152 L 40 152" />
          {/* Bottom Right Viewfinder Crop Mark */}
          <path d="M 168 144 L 168 152 L 160 152" />
        </g>

        {/* 3. The Letter 'A' (Ad / Accuracy) - Apex of Triangle */}
        <g id="letter-A">
          {/* Outer shape of A */}
          <path
            d="M 100 44
               L 122 93
               L 108 93
               L 103.5 82
               L 96.5 82
               L 92 93
               L 78 93
               Z
               M 100 58
               L 98 73
               L 102 73
               Z"
            fill="url(#acvLetterGrad)"
          />
          {/* Crossbar styled as an ad measurement ruler / calibration beam */}
          <line
            x1="93"
            y1="78"
            x2="107"
            y2="78"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* 4. The Letter 'C' (Creative / Framing Viewfinder) - Bottom Left */}
        <g id="letter-C">
          <path
            d="M 88 108
               C 85 106, 80 105, 74 105
               C 56 105, 45 117, 45 131
               C 45 145, 56 157, 74 157
               C 81 157, 86 155, 89 153
               L 85 141
               C 82 143, 78 144.5, 73.5 144.5
               C 63.5 144.5, 58.5 138, 58.5 131
               C 58.5 124, 63.5 117.5, 73.5 117.5
               C 78 117.5, 81.5 119, 84.5 121
               Z"
            fill="url(#acvLetterGrad)"
          />
          {/* Ad Bounding Box Corner accent on C */}
          <path
            d="M 41 123 L 41 113 L 51 113"
            stroke="#60a5fa"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* 5. The Letter 'V' (Validator / Verification Checkmark) - Bottom Right */}
        <g id="letter-V">
          {/* Modified V whose right arm flourishes into a verified checkmark (✔) */}
          <path
            d="M 112 106
               L 128 143
               C 129.5 146.5, 133 148, 136.5 146
               L 165 106
               L 151 106
               L 133.5 133
               L 124 106
               Z"
            fill="url(#acvCheckGrad)"
          />

          {/* Verification Sparkle / Badge Dot on V apex */}
          <circle cx="165" cy="106" r="3.5" fill="#10b981" />
        </g>
      </svg>

      {/* Optional Brand Typography */}
      {showText && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-wider text-white font-mono">
              ACV
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              SYSTEM
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 tracking-tight mt-1">
            Ad Creative Validator
          </span>
        </div>
      )}
    </div>
  );
};
