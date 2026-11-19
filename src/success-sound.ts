const SOUND_DELAY_MILLISECONDS = 1000;
const SUCCESS_SOUND_URL = new URL('./assets/success.wav', import.meta.url).href;

// Plays the celebration sound when a puzzle is solved.
// The file is decoded once into memory, so every play is the whole sound from its first sample.
export class SuccessSound {
  private readonly audioContext = new AudioContext();
  private decodedSound: Promise<AudioBuffer>;

  constructor() {
    this.decodedSound = this.loadSound();
    // A missing sound must never break the game.
    this.decodedSound.catch(() => undefined);
  }

  // The sound starts one second after the call, so it follows the confetti.
  play(): void {
    window.setTimeout(() => {
      this.playNow().catch(() => undefined);
    }, SOUND_DELAY_MILLISECONDS);
  }

  private async loadSound(): Promise<AudioBuffer> {
    const response = await fetch(SUCCESS_SOUND_URL);
    const fileBytes = await response.arrayBuffer();
    return this.audioContext.decodeAudioData(fileBytes);
  }

  private async playNow(): Promise<void> {
    const sound = await this.decodedSound;
    // Browsers keep the context suspended until the player has interacted with the page.
    await this.audioContext.resume();
    const source = this.audioContext.createBufferSource();
    source.buffer = sound;
    source.connect(this.audioContext.destination);
    source.start();
  }
}
