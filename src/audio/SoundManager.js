import { Howl, Howler } from 'howler';

/**
 * SoundManager - Singleton for all game audio
 * Handles sound effects, music loops, muting, and volume control
 */
class SoundManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    // Load mute state from localStorage
    this.isMuted = localStorage.getItem('game_muted') === 'true';
    Howler.mute(this.isMuted);
  }

  /**
   * Load a sound effect
   * @param {string} key - Identifier for the sound
   * @param {string} path - Path to audio file (relative to public/)
   */
  loadSound(key, path) {
    this.sounds[key] = new Howl({
      src: [path],
      volume: 0.6,
    });
  }

  /**
   * Load background music (will loop)
   * @param {string} path - Path to audio file (relative to public/)
   */
  loadMusic(path) {
    // Stop and unload any existing music
    if (this.music) {
      this.music.unload();
    }
    this.music = new Howl({
      src: [path],
      loop: true,
      volume: 0.4,
    });
  }

  /**
   * Play a sound effect by key
   * @param {string} key - Sound identifier
   */
  play(key) {
    if (this.sounds[key] && !this.isMuted) {
      this.sounds[key].play();
    }
  }

  /**
   * Start playing background music
   */
  playMusic() {
    if (this.music && !this.isMuted) {
      this.music.play();
    }
  }

  /**
   * Stop background music
   */
  stopMusic() {
    if (this.music) {
      this.music.stop();
    }
  }

  /**
   * Pause background music (resume with playMusic)
   */
  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  /**
   * Resume paused background music
   */
  resumeMusic() {
    if (this.music) {
      this.music.play();
    }
  }

  /**
   * Toggle mute on/off (persists to localStorage)
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
    localStorage.setItem('game_muted', this.isMuted);
  }

  /**
   * Set global volume (0.0 to 1.0)
   * @param {number} volume - Volume level
   */
  setVolume(volume) {
    const v = Math.max(0, Math.min(1, volume));
    Howler.volume(v);
  }

  /**
   * Get current mute state
   * @returns {boolean} Whether audio is muted
   */
  getMuted() {
    return this.isMuted;
  }
}

// Export singleton instance
export default new SoundManager();
