const SUCCESS_SOUND_URL = new URL('./assets/success.wav', import.meta.url).href;

// Plays the celebration sound when a puzzle is solved.
export class SuccessSound {
  private readonly audio = new Audio(SUCCESS_SOUND_URL);

  play(): void {
    this.audio.currentTime = 0;
    // Browsers may refuse playback; a missing sound must never break the game.
    this.audio.play().catch(() => undefined);
  }
}
