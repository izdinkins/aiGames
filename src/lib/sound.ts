let audioCtx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    audioCtx = new Ctor()
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume()
  return audioCtx
}

interface BeepOptions {
  freq: number
  duration: number
  type?: OscillatorType
  gain?: number
  slideTo?: number
  delay?: number
}

function beep({ freq, duration, type = 'square', gain = 0.05, slideTo, delay = 0 }: BeepOptions) {
  const ctx = getContext()
  if (!ctx) return

  const start = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration)

  gainNode.gain.setValueAtTime(gain, start)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  osc.connect(gainNode)
  gainNode.connect(ctx.destination)

  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export const sound = {
  coin: () => beep({ freq: 880, slideTo: 1760, duration: 0.15, gain: 0.07 }),
  click: () => beep({ freq: 240, duration: 0.045, gain: 0.045 }),
  select: () => beep({ freq: 440, slideTo: 660, duration: 0.12, gain: 0.06 }),
  deny: () => beep({ freq: 160, duration: 0.2, gain: 0.06, type: 'sawtooth' }),
  start: () => {
    beep({ freq: 523.25, duration: 0.09, gain: 0.06 })
    beep({ freq: 659.25, duration: 0.09, gain: 0.06, delay: 0.09 })
    beep({ freq: 783.99, duration: 0.16, gain: 0.06, delay: 0.18 })
  },
}
