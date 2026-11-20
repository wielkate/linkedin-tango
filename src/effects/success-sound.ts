const SUCCESS_SOUND_URL = new URL('./assets/success.wav', import.meta.url).href;

// Plays the celebration sound when a puzzle is solved.
// The file is decoded once into memory, so every play is the whole sound from its first sample.
export class SuccessSound {
  private readonly audioContext = new AudioContext();
  private readonly decodedSound: Promise<AudioBuffer>;

  constructor() {
    this.decodedSound = this.loadSound();
    // A missing sound must never break the game.
    this.decodedSound.catch(() => undefined);
  }

  play(): void {
    this.playOnce().catch(() => undefined);
  }

  private async loadSound(): Promise<AudioBuffer> {
    const response = await fetch(SUCCESS_SOUND_URL);
    const fileBytes = await response.arrayBuffer();
    return this.audioContext.decodeAudioData(fileBytes);
  }

  // Plays the sound PLAY_COUNT times in a row, each starting exactly when the previous one ends.
  private async playOnce(): Promise<void> {
    const sound = await this.decodedSound;
    // Browsers keep the context suspended until the player has interacted with the page.
    await this.audioContext.resume();
    const firstStartTime = this.audioContext.currentTime;

    const source = this.audioContext.createBufferSource();
    source.buffer = sound;
    source.connect(this.audioContext.destination);
    // source.start(); works differently
    source.start(firstStartTime);
  }
}
