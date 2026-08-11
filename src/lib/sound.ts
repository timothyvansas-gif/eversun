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
  let preloaded = false;

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
      // Eén keer, en niet bij elke aanraking. load() zet readyState terug naar
      // HAVE_NOTHING en start de resource-selectie opnieuw, dus een tweede
      // aanroep gooit weg wat er al binnen was. Op touch hangt dit aan
      // pointerdown — die vuurt ook bij het slepen van de carrousel — en dan
      // moest de play() erna opnieuw ophalen en decoderen. Het geluid kwam
      // daardoor pas als het paneel al openstond.
      if (preloaded) return;
      preloaded = true;
      ensureAudio()?.load();
    },
    play() {
      const element = ensureAudio();
      if (!element) return;

      // Spelen haalt het bestand net zo goed binnen. Zonder dit zou een
      // pointerdown daarna alsnog load() aanroepen en het geluid afkappen.
      preloaded = true;

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

/** Foley cue when a contact-form submission cannot be completed. */
export const formErrorSound = createSoundPlayer("/sounds/foley-error.wav");

/** Foley cue when the contact-form success confirmation is shown. */
export const formSuccessSound = createSoundPlayer("/sounds/foley-complete.wav");
