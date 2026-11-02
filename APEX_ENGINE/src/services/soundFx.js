class SoundEffectService {
  constructor() {
    this.ctx = null;
    let initialEnabled = true;
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('apex_sound_enabled');
        if (stored !== null) initialEnabled = JSON.parse(stored);
      }
    } catch {}
    this.enabled = initialEnabled;
  }

  playPowerUp() {
    this.playAuraBurst();
  }

  playLevelUp() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, i) => {
        const now = ctx.currentTime + i * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch (e) {}
  }

  playInstantTransmission() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.07);
      osc.frequency.exponentialRampToValueAtTime(4200, now + 0.15);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  playAuraBurst() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Deep rumble
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(85, now);
      osc1.frequency.linearRampToValueAtTime(160, now + 0.3);
      osc1.frequency.exponentialRampToValueAtTime(50, now + 0.8);
      gain1.gain.setValueAtTime(0.55, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      // High shimmering flare
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(650, now);
      osc2.frequency.exponentialRampToValueAtTime(1900, now + 0.25);
      osc2.frequency.exponentialRampToValueAtTime(400, now + 0.7);
      gain2.gain.setValueAtTime(0.28, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.8);
      osc2.start(now);
      osc2.stop(now + 0.7);
    } catch (e) {}
  }

  playDiceRoll() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      for (let i = 0; i < 5; i++) {
        const tapTime = now + i * 0.045 + Math.random() * 0.015;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350 + Math.random() * 320, tapTime);
        gain.gain.setValueAtTime(0.25, tapTime);
        gain.gain.exponentialRampToValueAtTime(0.01, tapTime + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(tapTime);
        osc.stop(tapTime + 0.035);
      }
    } catch (e) {}
  }

  playHeal() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const freqs = [440, 554.37, 659.25, 880, 1108.73];
      const now = ctx.currentTime;
      freqs.forEach((f, i) => {
        const t = now + i * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch (e) {}
  }

  setEnabled(val) {
    this.enabled = !!val;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('apex_sound_enabled', JSON.stringify(this.enabled));
      }
    } catch {}
  }

  initContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  playImpactBoom() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {}
  }

  playEnergyBeam() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.5);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  playCriticalHit() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      // Sub-bass thump
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(90, now);
      sub.frequency.exponentialRampToValueAtTime(20, now + 0.7);
      subGain.gain.setValueAtTime(0.8, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.7);

      // High impact crack
      const noise = ctx.createOscillator();
      const noiseGain = ctx.createGain();
      noise.type = 'square';
      noise.frequency.setValueAtTime(800, now);
      noise.frequency.exponentialRampToValueAtTime(80, now + 0.2);
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.2);
    } catch (e) {}
  }

  playSwordClash() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playBetWin() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const now = ctx.currentTime + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch (e) {}
  }

  /**
   * Clásico y auténtico sonido de Scouter / Rastreador de Dragon Ball Z
   * Genera la ráfaga electrónica de frecuencias chirp cuadradas con modulación ascendente
   */
  playScouterBeep(beeps = 9) {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      
      const freqs = [2200, 2600, 2400, 2900, 2700, 3200, 3000, 3500, 3300, 3800];
      const startBase = ctx.currentTime + 0.01;

      for (let i = 0; i < beeps; i++) {
        const chirpStart = startBase + i * 0.05;
        const chirpDuration = 0.038;
        const f = freqs[i % freqs.length];

        // Oscilador 1: Onda Cuadrada brillante (chirp principal)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(f, chirpStart);
        osc1.frequency.exponentialRampToValueAtTime(f + 250, chirpStart + chirpDuration);

        gain1.gain.setValueAtTime(0.35, chirpStart);
        gain1.gain.exponentialRampToValueAtTime(0.01, chirpStart + chirpDuration);

        // Oscilador 2: Armónico agudo complementario
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(f * 0.75, chirpStart);
        osc2.frequency.exponentialRampToValueAtTime((f * 0.75) + 180, chirpStart + chirpDuration);

        gain2.gain.setValueAtTime(0.2, chirpStart);
        gain2.gain.exponentialRampToValueAtTime(0.01, chirpStart + chirpDuration);

        // Conectar a la salida
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(chirpStart);
        osc1.stop(chirpStart + chirpDuration);
        osc2.start(chirpStart);
        osc2.stop(chirpStart + chirpDuration);
      }

      // Beep de Bloqueo Final (Lock-on confirmatorio)
      const lockStart = startBase + (beeps * 0.05) + 0.02;
      const lockOsc = ctx.createOscillator();
      const lockGain = ctx.createGain();
      lockOsc.type = 'square';
      lockOsc.frequency.setValueAtTime(3200, lockStart);
      lockOsc.frequency.exponentialRampToValueAtTime(3600, lockStart + 0.08);

      lockGain.gain.setValueAtTime(0.4, lockStart);
      lockGain.gain.exponentialRampToValueAtTime(0.01, lockStart + 0.08);

      lockOsc.connect(lockGain);
      lockGain.connect(ctx.destination);
      lockOsc.start(lockStart);
      lockOsc.stop(lockStart + 0.08);
    } catch (e) {
      console.warn('Scouter beep sound error:', e);
    }
  }

  /**
   * Sobrecarga y Explosión del Scouter cuando el Ki supera la escala
   */
  playScouterExplosion() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const startBase = ctx.currentTime + 0.01;

      // 1. Ráfaga ultra-acelerada de beeps crecientes
      for (let i = 0; i < 10; i++) {
        const chirpStart = startBase + i * 0.022;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2600 + i * 220, chirpStart);

        gain.gain.setValueAtTime(0.35, chirpStart);
        gain.gain.exponentialRampToValueAtTime(0.01, chirpStart + 0.02);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chirpStart);
        osc.stop(chirpStart + 0.02);
      }

      // 2. Estallido eléctrico y rotura de lente
      const burstTime = startBase + 0.24;
      const noise = ctx.createOscillator();
      const noiseGain = ctx.createGain();
      noise.type = 'sawtooth';
      noise.frequency.setValueAtTime(4200, burstTime);
      noise.frequency.exponentialRampToValueAtTime(60, burstTime + 0.5);

      noiseGain.gain.setValueAtTime(0.8, burstTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.5);

      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(burstTime);
      noise.stop(burstTime + 0.5);
    } catch (e) {
      console.warn('Scouter explosion sound error:', e);
    }
  }
}

export const SoundFX = new SoundEffectService();
