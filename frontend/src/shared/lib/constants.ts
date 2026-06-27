export const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:5000/api/v1';

export const PLYR_DEFAULT_OPTIONS: Partial<Plyr.Options> = {
  controls: [
    'play-large',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    'settings',
    'fullscreen',
  ],
  settings: ['speed'],
  speed: {
    selected: 1,
    options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  },
  seekTime: 10,
  clickToPlay: true,
  hideControls: true,
  resetOnEnd: false,
  keyboard: { focused: true, global: false },
  tooltips: { controls: false, seek: true },
  invertTime: true,
  toggleInvert: true,
  displayDuration: true,
  youtube: {},
};
