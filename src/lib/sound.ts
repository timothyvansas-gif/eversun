/**
 * One-shot UI sounds.
 *
 * A single HTMLAudioElement per source, created on first use rather than at
 * import time: the module is pulled into the bundle during SSR, where there is
 * no Audio constructor, and building the element eagerly would also start a
 * fetch for a sound most visitors never trigger.
 *
 * The element is deliberately shared. Four zonnebank cards each hold their own
 * video hook, and one element per card would mean four copies of the same file
 * in memory for a sound that never plays on two cards at once.
 */

const DEFAULT_VOLUME = 0.45;

/** The slice of HTMLAudioElement this module touches, so tests can stand in. */
export type AudioLike = {
  currentTime: number;
  volume: number;
  preload: string;
  load: () => void;
  play: () => Promise<void> | void;
};

export type SoundPlayer = {
  /** Pull the file down ahead of the gesture that will play it. */
  preload: () => void;
  /** Play from the start, restarting if it is already sounding. */
  play: () => void;
};

function defaultCreateAudio(src: string): AudioLike | null {
  if (typeof window === "undefined" || typeof window.Audio !== "function") {
    return null;
  }
  return new window.Audio(src);
}

export function createSoundPlayer(
  src: string,
  {
    volume = DEFAULT_VOLUME,
    createAudio = defaultCreateAudio,
  }: {
    volume?: number;
    createAudio?: (src: string) => AudioLike | null;
  } = {},
): SoundPlayer {
  let audio: AudioLike | null = null;
  let resolved = false;

  const ensureAudio = () => {
    if (resolved) return audio;
    resolved = true;
    audio = createAudio(src);
    if (audio) {
      audio.preload = "auto";
      audio.volume = volume;
    }
    return audio;
  };

  return {
    preload() {
      ensureAudio()?.load();
    },
    play() {
      const element = ensureAudio();
      if (!element) return;

      // Rewind first: without this a second toggle inside the sound's own
      // length is a no-op, because the element is already playing.
      element.currentTime = 0;

      const result = element.play();
      // Browsers reject play() when no user gesture preceded it. A UI sound is
      // not worth an unhandled rejection, so the failure is swallowed.
      if (result && typeof result.then === "function") {
        void result.then(undefined, () => {});
      }
    },
  };
}

/** Foley tick behind the light/dark toggle on the zonnebank cards. */
export const toggleSound = createSoundPlayer("/sounds/foley-tick.wav");

/**
 * Foley whoosh behind the product detail reveal, on touch only.
 *
 * Softer than the toggle: the panel slides open under the reader's own thumb
 * and the sound only has to accompany the movement, where the toggle has to
 * stand in for a switch being thrown.
 */
export const revealSound = createSoundPlayer("/sounds/foley-whoosh.wav", {
  volume: 0.3,
});
