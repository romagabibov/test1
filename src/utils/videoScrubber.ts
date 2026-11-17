import { clamp } from './videoGeometry';

type VideoPort = Pick<HTMLVideoElement, 'currentTime' | 'duration' | 'readyState' | 'seeking' | 'addEventListener' | 'removeEventListener'>;
export interface SeekClock {
  now(): number;
  later(callback: () => void, delay: number): number;
  cancel(id: number): void;
}

/** One in-flight seek and one replaceable destination. Never queue intermediate wheel frames. */
export class VideoScrubber {
  private target: number | null = null;
  private timer: number | undefined;
  private lastDispatch = -Infinity;
  private disposed = false;
  private clock: SeekClock;

  constructor(private video: VideoPort, clock?: SeekClock) {
    this.clock = clock ?? {
      now: () => performance.now(),
      later: (fn, delay) => window.setTimeout(fn, delay),
      cancel: id => window.clearTimeout(id),
    };
    video.addEventListener('seeked', this.wake);
    video.addEventListener('loadeddata', this.wake);
    video.addEventListener('error', this.cancel);
  }

  seek(time: number) {
    if (!Number.isFinite(time) || this.disposed) return;
    this.target = Math.max(0, time);
    this.pump();
  }

  cancel = () => {
    this.target = null;
    if (this.timer !== undefined) this.clock.cancel(this.timer);
    this.timer = undefined;
  };

  private wake = () => this.pump();
  private pump = () => {
    if (this.disposed || this.target === null) return;
    if (this.timer !== undefined) this.clock.cancel(this.timer);
    this.timer = undefined;
    const video = this.video;
    if (video.readyState < 2 || !Number.isFinite(video.duration) || video.duration <= 0) return;
    if (video.seeking) return this.schedule(80);
    const remaining = 50 - (this.clock.now() - this.lastDispatch);
    if (remaining > 0) return this.schedule(remaining);
    const next = clamp(this.target, 0, Math.max(0, video.duration - 0.035));
    this.target = null;
    if (Math.abs(video.currentTime - next) < 0.012) return;
    try {
      this.lastDispatch = this.clock.now();
      video.currentTime = next;
    } catch { /* Media errors are reported by the video element. */ }
  };

  private schedule(delay: number) { this.timer = this.clock.later(this.pump, delay); }

  dispose() {
    this.cancel();
    this.disposed = true;
    this.video.removeEventListener('seeked', this.wake);
    this.video.removeEventListener('loadeddata', this.wake);
    this.video.removeEventListener('error', this.cancel);
  }
}

export function wheelPixels(delta: number, mode: number, pageHeight: number): number {
  return delta * (mode === 1 ? 16 : mode === 2 ? pageHeight : 1);
}
