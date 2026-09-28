// Web Audio API procedural sound engine for truck engine, horn, rev, and clicks
class TruckSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineLoopGain: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.engineLoopGain && this.ctx) {
      this.engineLoopGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play button click / light switch
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Play truck horn (dual tone deep air horn)
  public playHorn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Dual horn pitches: 350Hz & 440Hz standard truck horn interval
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(345, t);
    osc2.frequency.setValueAtTime(435, t);

    // Filter to soften the harshness of sawtooth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
    gain.gain.setValueAtTime(0.18, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.65);
    osc2.stop(t + 0.65);
  }

  // Play starter ignition and powerful engine rev up when authenticating and driving away
  public playEngineDeparture() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Starter click-click-crank
    for (let i = 0; i < 3; i++) {
      const clickTime = t + i * 0.08;
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(120, clickTime);
      clickGain.gain.setValueAtTime(0.15, clickTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.04);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(clickTime);
      clickOsc.stop(clickTime + 0.04);
    }

    // 2. Engine roar / acceleration rev
    const revStartTime = t + 0.28;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noiseNode = this.createNoiseBuffer(revStartTime, 1.8);
    const revGain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Start at low idle frequency (65Hz), rev up to high gear (220Hz), then fade
    osc1.frequency.setValueAtTime(65, revStartTime);
    osc1.frequency.exponentialRampToValueAtTime(260, revStartTime + 1.2);
    osc1.frequency.exponentialRampToValueAtTime(320, revStartTime + 1.8);

    osc2.frequency.setValueAtTime(130, revStartTime);
    osc2.frequency.exponentialRampToValueAtTime(520, revStartTime + 1.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, revStartTime);
    filter.frequency.exponentialRampToValueAtTime(2200, revStartTime + 1.2);

    revGain.gain.setValueAtTime(0.01, revStartTime);
    revGain.gain.linearRampToValueAtTime(0.25, revStartTime + 0.2);
    revGain.gain.setValueAtTime(0.22, revStartTime + 1.0);
    revGain.gain.exponentialRampToValueAtTime(0.001, revStartTime + 2.0);

    osc1.connect(filter);
    osc2.connect(filter);
    if (noiseNode) noiseNode.connect(filter);
    filter.connect(revGain);
    revGain.connect(this.ctx.destination);

    osc1.start(revStartTime);
    osc2.start(revStartTime);
    osc1.stop(revStartTime + 2.0);
    osc2.stop(revStartTime + 2.0);

    // 3. Air brake release hiss ("Pshhh!")
    this.playAirBrake(t + 0.35);
  }

  // Air brake release hiss
  public playAirBrake(time?: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = time ?? this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, t);
    filter.Q.setValueAtTime(2.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.35);
  }

  // Success chime
  public playSuccessChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C major arpeggio
    chords.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.12, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.45);
    });
  }

  // Error shake buzz
  public playErrorBuzz() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.setValueAtTime(95, t + 0.1);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  private createNoiseBuffer(startTime: number, duration: number) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.start(startTime);
    source.stop(startTime + duration);
    return source;
  }
}

export const soundEngine = new TruckSoundEngine();
