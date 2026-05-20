interface PlaybackIconProps {
  isPlaying?: boolean;
}

export default function PlaybackIcon({ isPlaying = false }: PlaybackIconProps) {
  return isPlaying ? (
    <svg
      className="playback-icon playback-icon--stop"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="7" y="7" width="10" height="10" rx="2.4" fill="currentColor" />
    </svg>
  ) : (
    <svg
      className="playback-icon playback-icon--play"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8.2 6.9C8.2 6.1 9 5.6 9.7 6L17.2 10.5C17.9 10.9 17.9 11.9 17.2 12.3L9.7 16.8C9 17.2 8.2 16.7 8.2 15.9V6.9Z"
        fill="currentColor"
      />
    </svg>
  );
}
