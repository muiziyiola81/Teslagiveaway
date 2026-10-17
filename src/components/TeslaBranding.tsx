import React from 'react';

export interface LogoProps {
  className?: string;
  variant?: 'full' | 'stacked' | 'horizontal' | 'compact' | 'emblem' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Official Tesla "T" Crest Emblem SVG in Tesla Red (#E82127)
 * Proportions and curves matched 1:1 to official Tesla brand assets.
 */
export const TeslaEmblemSVG: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 279 254"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-label="Tesla Emblem"
  >
    <g fill="#E82127">
      <path
        transform="translate(-33.796,-64.797)"
        d="m173.146 317.299 35.476-199.519c33.815 0 44.481 3.708 46.021 18.843 0 0 22.684-8.458 34.125-25.636-44.646-20.688-89.505-21.621-89.505-21.621l-26.176 31.882 0.059-4e-3 -26.176-31.883s-44.86 0.934-89.5 21.622c11.431 17.178 34.124 25.636 34.124 25.636 1.549-15.136 12.202-18.844 45.79-18.868l35.762 199.548"
      />
      <path
        transform="translate(-33.796,-64.797)"
        d="m173.132 80.157c36.09-0.276 77.399 5.583 119.687 24.014 5.652-10.173 7.105-14.669 7.105-14.669-46.227-18.289-89.518-24.548-126.797-24.705-37.277 0.157-80.566 6.417-126.787 24.705 0 0 2.062 5.538 7.1 14.669 42.28-18.431 83.596-24.29 119.687-24.014h5e-3"
      />
    </g>
  </svg>
);

/**
 * Official Tesla Wordmark SVG in Tesla Red (#E82127)
 */
export const TeslaWordmarkSVG: React.FC<{ className?: string }> = ({ className = 'h-4 w-auto' }) => (
  <svg
    viewBox="0 323 279 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-label="Tesla"
  >
    <g fill="#E82127">
      <path transform="translate(-28.524,-64.797)" d="m28.524 388.986c0.812 3.167 3.554 6.404 7.316 7.215h11.37l0.58 0.229v28.691h7.1v-28.691l0.645-0.229h11.38c3.804-0.98 6.487-4.048 7.285-7.215v-0.07h-45.676v0.07"/>
      <path transform="translate(-28.524,-64.797)" d="m98.795 425.202h27.011c3.758-0.747 6.551-4.058 7.334-7.263h-41.679c0.778 3.206 3.612 6.516 7.334 7.263"/>
      <path transform="translate(-28.524,-64.797)" d="m98.795 410.485h27.011c3.758-0.741 6.551-4.053 7.334-7.262h-41.679c0.778 3.21 3.612 6.521 7.334 7.262"/>
      <path transform="translate(-28.524,-64.797)" d="m98.795 396.163h27.011c3.758-0.749 6.551-4.058 7.334-7.265h-41.679c0.778 3.207 3.612 6.516 7.334 7.265"/>
      <path transform="translate(-28.524,-64.797)" d="m160.398 396.094h24.954c3.762-1.093 6.921-3.959 7.691-7.136h-39.64v21.415h32.444v7.515l-25.449 0.02c-3.988 1.112-7.37 3.79-9.057 7.327l2.062-0.038h39.415v-21.944h-32.42v-7.159"/>
      <path transform="translate(-28.524,-64.797)" d="m245.319 425.206c3.543-1.502 5.449-4.1 6.179-7.14h-31.517l0.02-29.118-7.065 0.02v36.238h32.383"/>
      <path transform="translate(-28.524,-64.797)" d="m272.845 396.192h27.02c3.753-0.746 6.544-4.058 7.331-7.262h-41.681c0.779 3.205 3.611 6.516 7.33 7.262"/>
      <path transform="translate(-28.524,-64.797)" d="m266.601 403.28v21.912h7.027v-14.589h25.575v14.589h7.022v-21.874l-39.624-0.038"/>
    </g>
  </svg>
);

/**
 * Official Red Tesla Stacked Lockup SVG (The exact provided asset: Emblem on top, Wordmark below in red #E82127)
 */
export const TeslaStackedLogoSVG: React.FC<{ className?: string }> = ({ className = 'w-24 h-auto' }) => (
  <svg
    viewBox="0 0 279 361"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-label="Tesla Red Logo"
  >
    <g fill="#E82127">
      {/* Emblem */}
      <path
        transform="translate(-33.796,-64.797)"
        d="m173.146 317.299 35.476-199.519c33.815 0 44.481 3.708 46.021 18.843 0 0 22.684-8.458 34.125-25.636-44.646-20.688-89.505-21.621-89.505-21.621l-26.176 31.882 0.059-4e-3 -26.176-31.883s-44.86 0.934-89.5 21.622c11.431 17.178 34.124 25.636 34.124 25.636 1.549-15.136 12.202-18.844 45.79-18.868l35.762 199.548"
      />
      <path
        transform="translate(-33.796,-64.797)"
        d="m173.132 80.157c36.09-0.276 77.399 5.583 119.687 24.014 5.652-10.173 7.105-14.669 7.105-14.669-46.227-18.289-89.518-24.548-126.797-24.705-37.277 0.157-80.566 6.417-126.787 24.705 0 0 2.062 5.538 7.1 14.669 42.28-18.431 83.596-24.29 119.687-24.014h5e-3"
      />
      {/* Wordmark */}
      <path transform="translate(-28.524,-64.797)" d="m28.524 388.986c0.812 3.167 3.554 6.404 7.316 7.215h11.37l0.58 0.229v28.691h7.1v-28.691l0.645-0.229h11.38c3.804-0.98 6.487-4.048 7.285-7.215v-0.07h-45.676v0.07"/>
      <path transform="translate(-28.524,-64.797)" d="m98.795 425.202h27.011c3.758-0.747 6.551-4.058 7.334-7.263h-41.679c0.778 3.206 3.612 6.516 7.334 7.263"/>
      <path transform="translate(-28.524,-64.797)" d="m98.795 410.485h27.011c3.758-0.741 6.551-4.053 7.334-7.262h-41.679c0.778 3.21 3.612 6.521 7.334 7.262"/>
      <path transform="translate(-28.524,-64.797)" d="m98.795 396.163h27.011c3.758-0.749 6.551-4.058 7.334-7.265h-41.679c0.778 3.207 3.612 6.516 7.334 7.265"/>
      <path transform="translate(-28.524,-64.797)" d="m160.398 396.094h24.954c3.762-1.093 6.921-3.959 7.691-7.136h-39.64v21.415h32.444v7.515l-25.449 0.02c-3.988 1.112-7.37 3.79-9.057 7.327l2.062-0.038h39.415v-21.944h-32.42v-7.159"/>
      <path transform="translate(-28.524,-64.797)" d="m245.319 425.206c3.543-1.502 5.449-4.1 6.179-7.14h-31.517l0.02-29.118-7.065 0.02v36.238h32.383"/>
      <path transform="translate(-28.524,-64.797)" d="m272.845 396.192h27.02c3.753-0.746 6.544-4.058 7.331-7.262h-41.681c0.779 3.205 3.611 6.516 7.33 7.262"/>
      <path transform="translate(-28.524,-64.797)" d="m266.601 403.28v21.912h7.027v-14.589h25.575v14.589h7.022v-21.874l-39.624-0.038"/>
    </g>
  </svg>
);

/**
 * Official Red Tesla Horizontal Lockup SVG (Emblem on left + Wordmark on right in red #E82127)
 * Perfect for responsive navbars and headers.
 */
export const TeslaHorizontalLogoSVG: React.FC<{ className?: string }> = ({ className = 'h-5 sm:h-6 w-auto' }) => (
  <svg
    viewBox="0 0 340 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-label="Tesla Red Logo"
  >
    <g fill="#E82127">
      <g transform="matrix(0.142 0 0 0.142 0 2)">
        <path
          transform="translate(-33.796,-64.797)"
          d="m173.146 317.299 35.476-199.519c33.815 0 44.481 3.708 46.021 18.843 0 0 22.684-8.458 34.125-25.636-44.646-20.688-89.505-21.621-89.505-21.621l-26.176 31.882 0.059-4e-3 -26.176-31.883s-44.86 0.934-89.5 21.622c11.431 17.178 34.124 25.636 34.124 25.636 1.549-15.136 12.202-18.844 45.79-18.868l35.762 199.548"
        />
        <path
          transform="translate(-33.796,-64.797)"
          d="m173.132 80.157c36.09-0.276 77.399 5.583 119.687 24.014 5.652-10.173 7.105-14.669 7.105-14.669-46.227-18.289-89.518-24.548-126.797-24.705-37.277 0.157-80.566 6.417-126.787 24.705 0 0 2.062 5.538 7.1 14.669 42.28-18.431 83.596-24.29 119.687-24.014h5e-3"
        />
      </g>
      <g transform="translate(54,-323)">
        <path transform="translate(-28.524,-64.797)" d="m28.524 388.986c0.812 3.167 3.554 6.404 7.316 7.215h11.37l0.58 0.229v28.691h7.1v-28.691l0.645-0.229h11.38c3.804-0.98 6.487-4.048 7.285-7.215v-0.07h-45.676v0.07"/>
        <path transform="translate(-28.524,-64.797)" d="m98.795 425.202h27.011c3.758-0.747 6.551-4.058 7.334-7.263h-41.679c0.778 3.206 3.612 6.516 7.334 7.263"/>
        <path transform="translate(-28.524,-64.797)" d="m98.795 410.485h27.011c3.758-0.741 6.551-4.053 7.334-7.262h-41.679c0.778 3.21 3.612 6.521 7.334 7.262"/>
        <path transform="translate(-28.524,-64.797)" d="m98.795 396.163h27.011c3.758-0.749 6.551-4.058 7.334-7.265h-41.679c0.778 3.207 3.612 6.516 7.334 7.265"/>
        <path transform="translate(-28.524,-64.797)" d="m160.398 396.094h24.954c3.762-1.093 6.921-3.959 7.691-7.136h-39.64v21.415h32.444v7.515l-25.449 0.02c-3.988 1.112-7.37 3.79-9.057 7.327l2.062-0.038h39.415v-21.944h-32.42v-7.159"/>
        <path transform="translate(-28.524,-64.797)" d="m245.319 425.206c3.543-1.502 5.449-4.1 6.179-7.14h-31.517l0.02-29.118-7.065 0.02v36.238h32.383"/>
        <path transform="translate(-28.524,-64.797)" d="m272.845 396.192h27.02c3.753-0.746 6.544-4.058 7.331-7.262h-41.681c0.779 3.205 3.611 6.516 7.33 7.262"/>
        <path transform="translate(-28.524,-64.797)" d="m266.601 403.28v21.912h7.027v-14.589h25.575v14.589h7.022v-21.874l-39.624-0.038"/>
      </g>
    </g>
  </svg>
);

/**
 * Universal Tesla Red Logo Component
 * Uses the user-provided red Tesla logo asset as the single source of truth.
 * Preserves strict brand proportions: never stretches, crops, or distorts.
 */
export const TeslaLogo: React.FC<LogoProps> = ({
  className,
  variant = 'horizontal'
}) => {
  if (variant === 'stacked') {
    return <TeslaStackedLogoSVG className={className} />;
  }

  if (variant === 'compact' || variant === 'emblem') {
    return <TeslaEmblemSVG className={className || 'w-7 h-7 sm:w-8 sm:h-8'} />;
  }

  if (variant === 'wordmark') {
    return <TeslaWordmarkSVG className={className} />;
  }

  // Default 'full' or 'horizontal'
  return <TeslaHorizontalLogoSVG className={className} />;
};

// Aliases for clear semantic usage
export const TeslaWordmark: React.FC<{ className?: string }> = ({ className = 'h-4 w-auto' }) => (
  <TeslaWordmarkSVG className={className} />
);

export const TeslaEmblem: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <TeslaEmblemSVG className={className} />
);

export const TeslaLogoLockup: React.FC<{ className?: string }> = ({ className = 'w-24 sm:w-28 h-auto' }) => (
  <TeslaStackedLogoSVG className={className} />
);

/**
 * Standard Header Screen Badge
 * Renders the official red Tesla emblem proportionally sized (28px mobile, 32px desktop: ~1.75-2x original size)
 * aligned neatly beside the screen/page name with balanced spacing.
 */
export const TeslaScreenHeaderBadge: React.FC<{
  title: string;
  badge?: string;
  className?: string;
}> = ({ title, badge, className = '' }) => (
  <div className={`flex items-center gap-3 sm:gap-3.5 ${className}`}>
    <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
    <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
      {title}
    </span>
    {badge && (
      <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
        {badge}
      </span>
    )}
  </div>
);

/**
 * Promotion Authorization Banner / Badge
 * Features the official red Tesla emblem asset and authorized promotion badge styling.
 */
export const TeslaAuthorizedBadge: React.FC<{ variant?: 'hero' | 'pill' | 'card' }> = ({
  variant = 'hero'
}) => {
  if (variant === 'pill') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/90 border border-zinc-800 text-xs text-zinc-300 backdrop-blur-md">
        <TeslaEmblemSVG className="w-3.5 h-3.5" />
        <span className="font-semibold tracking-wider uppercase text-[11px] text-white">
          Authorized Tesla Promotion
        </span>
        <span className="text-[11px] text-zinc-400 pl-1 border-l border-zinc-800">
          Official Terms Apply
        </span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-white">
        <TeslaEmblemSVG className="w-4 h-4" />
        <span className="text-zinc-200">Authorized Tesla Promotion</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-md">
      <div className="w-10 h-10 rounded-lg bg-black border border-zinc-800 flex items-center justify-center shrink-0 p-2 shadow-inner">
        <TeslaEmblemSVG className="w-full h-full" />
      </div>
      <div>
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
          AUTHORIZED TESLA PROMOTION
        </h4>
        <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
          Vehicle allocation program operated under authorized promotion terms.
        </p>
      </div>
    </div>
  );
};

export const TeslaVerifiedBadge = TeslaAuthorizedBadge;
