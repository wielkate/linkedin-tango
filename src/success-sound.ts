const SUCCESS_SOUND_URL = new URL('./assets/success.wav', import.meta.url).href;

// Plays the celebration sound when a puzzle is solved.
export class SuccessSound {
  private readonly preloadedAudio = new Audio(SUCCESS_SOUND_URL);

  constructor() {
    this.preloadedAudio.preload = 'auto';
    this.preloadedAudio.load();
  }

  // Every play uses its own copy, so a sound that is still playing or has just ended
  // cannot block the next one.
  play(): void {
    const audioForThisPlay = this.preloadedAudio.cloneNode(true) as HTMLAudioElement;
    // Browsers may refuse playback; a missing sound must never break the game.
    audioForThisPlay.play().catch(() => undefined);
  }
}
