import { describe, expect, it, vi } from "vitest";
import { createSoundPlayer, type AudioLike } from "@/lib/sound";

function fakeAudio() {
  const audio = {
    currentTime: 5,
    volume: 1,
    preload: "none",
    load: vi.fn(),
    play: vi.fn(() => Promise.resolve()),
  };
  return audio satisfies AudioLike & { load: ReturnType<typeof vi.fn> };
}

describe("createSoundPlayer", () => {
  it("does not build the element until it is used", () => {
    const createAudio = vi.fn(fakeAudio);
    createSoundPlayer("/x.wav", { createAudio });

    expect(createAudio).not.toHaveBeenCalled();
  });

  it("reuses one element across plays", () => {
    const createAudio = vi.fn(fakeAudio);
    const player = createSoundPlayer("/x.wav", { createAudio });

    player.play();
    player.play();
    player.preload();

    expect(createAudio).toHaveBeenCalledTimes(1);
    expect(createAudio).toHaveBeenCalledWith("/x.wav");
  });

  it("applies the volume and eager preload on creation", () => {
    const audio = fakeAudio();
    const player = createSoundPlayer("/x.wav", {
      volume: 0.2,
      createAudio: () => audio,
    });

    player.preload();

    expect(audio.volume).toBe(0.2);
    expect(audio.preload).toBe("auto");
    expect(audio.load).toHaveBeenCalledTimes(1);
  });

  it("loads once however often it is preloaded", () => {
    const audio = fakeAudio();
    const player = createSoundPlayer("/x.wav", { createAudio: () => audio });

    player.preload();
    player.preload();
    player.preload();

    // load() resets readyState to HAVE_NOTHING, so a repeat throws away what
    // has already arrived and the next play() has to fetch again.
    expect(audio.load).toHaveBeenCalledTimes(1);
  });

  it("does not load after playing, which would cut the sound off", () => {
    const audio = fakeAudio();
    const player = createSoundPlayer("/x.wav", { createAudio: () => audio });

    player.play();
    player.preload();

    expect(audio.load).not.toHaveBeenCalled();
  });

  it("rewinds before playing so a rapid second toggle sounds again", () => {
    const audio = fakeAudio();
    const player = createSoundPlayer("/x.wav", { createAudio: () => audio });

    player.play();

    expect(audio.currentTime).toBe(0);
    expect(audio.play).toHaveBeenCalledTimes(1);
  });

  it("swallows a rejected play, as when no gesture preceded it", async () => {
    const audio = fakeAudio();
    audio.play = vi.fn(() => Promise.reject(new Error("NotAllowedError")));
    const player = createSoundPlayer("/x.wav", { createAudio: () => audio });

    expect(() => player.play()).not.toThrow();
    await Promise.resolve();
  });

  it("stays silent instead of throwing when there is no Audio, as on the server", () => {
    const player = createSoundPlayer("/x.wav", { createAudio: () => null });

    expect(() => player.preload()).not.toThrow();
    expect(() => player.play()).not.toThrow();
  });

  it("does not retry construction after it failed once", () => {
    const createAudio = vi.fn(() => null);
    const player = createSoundPlayer("/x.wav", { createAudio });

    player.play();
    player.play();

    expect(createAudio).toHaveBeenCalledTimes(1);
  });
});
