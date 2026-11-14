// Moteur Audio MotoGP - Synthèse procédurale Web Audio API sans aucun fichier externe

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterGain = null;

    // Player engine nodes
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.subOsc = null;
    this.engineFilter = null;
    this.engineGain = null;

    // Wind sound
    this.windNode = null;
    this.windFilter = null;
    this.windGain = null;

    // Tire squeal
    this.squealNode = null;
    this.squealFilter = null;
    this.squealGain = null;

    // Curb rumble
    this.curbOsc = null;
    this.curbGain = null;

    // Gravel
    this.gravelNode = null;
    this.gravelGain = null;

    this.isMuted = false;
    this.isInitialized = false;
    this.lastGear = 1;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupPlayerEngine();
      this.setupWind();
      this.setupSqueal();
      this.setupCurb();
      this.setupGravel();

      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setupPlayerEngine() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Engine filter to simulate exhaust tone & throttle opening
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(800, now);
    this.engineFilter.Q.setValueAtTime(3.5, now);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.001, now);
    this.engineGain.connect(this.masterGain);
    this.engineFilter.connect(this.engineGain);

    // Primary V4 engine harmonic oscillator (Sawtooth for sharp exhaust bite)
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc1.frequency.setValueAtTime(65, now);
    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc1.start();

    // Secondary oscillator (Square for throaty crossplane / 90-degree V4 pulse)
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.setValueAtTime(130, now);
    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.6, now);
    this.engineOsc2.connect(osc2Gain);
    osc2Gain.connect(this.engineFilter);
    this.engineOsc2.start();

    // Sub-bass rumble
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(32.5, now);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.4, now);
    this.subOsc.connect(subGain);
    subGain.connect(this.engineFilter);
    this.subOsc.start();
  }

  setupWind() {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.windNode = this.ctx.createBufferSource();
    this.windNode.buffer = noiseBuffer;
    this.windNode.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(300, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.windNode.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    this.windNode.start();
  }

  setupSqueal() {
    if (!this.ctx) return;
    const bufferSize = 1 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.squealNode = this.ctx.createBufferSource();
    this.squealNode.buffer = noiseBuffer;
    this.squealNode.loop = true;

    this.squealFilter = this.ctx.createBiquadFilter();
    this.squealFilter.type = 'bandpass';
    this.squealFilter.frequency.setValueAtTime(2400, this.ctx.currentTime);
    this.squealFilter.Q.setValueAtTime(7.0, this.ctx.currentTime);

    this.squealGain = this.ctx.createGain();
    this.squealGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.squealNode.connect(this.squealFilter);
    this.squealFilter.connect(this.squealGain);
    this.squealGain.connect(this.masterGain);
    this.squealNode.start();
  }

  setupCurb() {
    if (!this.ctx) return;
    this.curbOsc = this.ctx.createOscillator();
    this.curbOsc.type = 'square';
    this.curbOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

    const curbFilter = this.ctx.createBiquadFilter();
    curbFilter.type = 'lowpass';
    curbFilter.frequency.setValueAtTime(180, this.ctx.currentTime);

    this.curbGain = this.ctx.createGain();
    this.curbGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.curbOsc.connect(curbFilter);
    curbFilter.connect(this.curbGain);
    this.curbGain.connect(this.masterGain);
    this.curbOsc.start();
  }

  setupGravel() {
    if (!this.ctx) return;
    const bufferSize = 1 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() > 0.85 ? 1 : -1) * Math.random();
    }

    this.gravelNode = this.ctx.createBufferSource();
    this.gravelNode.buffer = noiseBuffer;
    this.gravelNode.loop = true;

    this.gravelGain = this.ctx.createGain();
    this.gravelGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    const gravelFilter = this.ctx.createBiquadFilter();
    gravelFilter.type = 'highpass';
    gravelFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.gravelNode.connect(gravelFilter);
    gravelFilter.connect(this.gravelGain);
    this.gravelGain.connect(this.masterGain);
    this.gravelNode.start();
  }

  updatePlayer(rpm, gear, throttle, speedKmh, onCurb, inGravel, tireSlide) {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Quickshifter backfire pop on upshift
    if (gear !== this.lastGear) {
      this.playShiftPop();
      this.lastGear = gear;
    }

    // Engine frequency: 3500 RPM -> ~65 Hz, 18000 RPM -> ~340 Hz
    const normalizedRpm = Math.max(0, Math.min(1, (rpm - 3500) / (18000 - 3500)));
    const freq = 65 + normalizedRpm * 275;

    this.engineOsc1.frequency.setTargetAtTime(freq, now, 0.04);
    this.engineOsc2.frequency.setTargetAtTime(freq * 1.5, now, 0.04);
    this.subOsc.frequency.setTargetAtTime(freq * 0.5, now, 0.04);

    // Filter opens with throttle and RPM (open throttle roar)
    const filterFreq = 800 + normalizedRpm * 4000 + throttle * 6000;
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);

    // Volume depends on throttle and RPM
    const vol = 0.15 + throttle * 0.35 + normalizedRpm * 0.25;
    this.engineGain.gain.setTargetAtTime(vol, now, 0.04);

    // Wind sound (rises above 100 km/h)
    const windIntensity = Math.max(0, Math.min(1, (speedKmh - 60) / 280));
    this.windGain.gain.setTargetAtTime(windIntensity * 0.4, now, 0.1);
    this.windFilter.frequency.setTargetAtTime(250 + windIntensity * 900, now, 0.1);

    // Tire squeal
    const squealVol = Math.max(0, Math.min(1, tireSlide)) * 0.35;
    this.squealGain.gain.setTargetAtTime(squealVol, now, 0.05);

    // Curb vibration
    const curbVol = onCurb ? Math.min(0.35, 0.1 + (speedKmh / 350) * 0.25) : 0.0;
    this.curbGain.gain.setTargetAtTime(curbVol, now, 0.03);
    if (onCurb) {
      const curbFreq = 30 + (speedKmh / 350) * 60;
      this.curbOsc.frequency.setTargetAtTime(curbFreq, now, 0.05);
    }

    // Gravel sound
    const gravelVol = inGravel ? Math.min(0.4, (speedKmh / 200) * 0.4) : 0.0;
    this.gravelGain.gain.setTargetAtTime(gravelVol, now, 0.05);
  }

  playShiftPop() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    try {
      // Create quick noise burst for exhaust backfire / quickshifter pop
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const popFilter = this.ctx.createBiquadFilter();
      popFilter.type = 'lowpass';
      popFilter.frequency.setValueAtTime(1400, now);

      const popGain = this.ctx.createGain();
      popGain.gain.setValueAtTime(0.45, now);

      source.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(this.masterGain);
      source.start(now);
    } catch (e) {}
  }

  playStartBeep(isGo = false) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isGo ? 880 : 440, now);

      const duration = isGo ? 0.6 : 0.18;
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  playCheckeredFlag() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 fanfare
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.28, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.55);
    });
  }

  playButtonClick() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx ? this.ctx.currentTime : 0);
    }
    return this.isMuted;
  }
}
