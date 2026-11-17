import test from 'node:test';
import assert from 'node:assert/strict';
import { getContainedMediaRect } from '../src/utils/videoGeometry';
import { VideoScrubber, wheelPixels, SeekClock } from '../src/utils/videoScrubber';
import { DEFAULT_CATALOG, getInterpolatedHotspotCoord, normalizeCatalog, saveShowcases, getSavedShowcases, validMediaUrl } from '../src/utils/showcaseStore';
import type { VideoHotspot } from '../src/types';

class FakeClock implements SeekClock {
  time = 0; next = 1; tasks = new Map<number, { at: number; callback(): void }>();
  now = () => this.time;
  later = (callback: () => void, delay: number) => { const id = this.next++; this.tasks.set(id, { at: this.time + delay, callback }); return id; };
  cancel = (id: number) => { this.tasks.delete(id); };
  advance(ms: number) {
    const end = this.time + ms;
    while (true) {
      const first = [...this.tasks].sort((a,b) => a[1].at - b[1].at)[0];
      if (!first || first[1].at > end) break;
      this.time = first[1].at; this.tasks.delete(first[0]); first[1].callback();
    }
    this.time = end;
  }
}
class FakeVideo extends EventTarget {
  duration = 10; readyState = 2; seeking = false; position = 0; dispatched: number[] = [];
  get currentTime() { return this.position; }
  set currentTime(time: number) { assert.equal(this.seeking, false, 'never overlap decoder seeks'); this.position = time; this.seeking = true; this.dispatched.push(time); }
  finish(dispatch = true) { this.seeking = false; if (dispatch) this.dispatchEvent(new Event('seeked')); }
}
function controller() { const video = new FakeVideo(); const clock = new FakeClock(); return { video, clock, queue: new VideoScrubber(video as unknown as HTMLVideoElement, clock) }; }

test('portrait media and annotations share an exact contain rectangle', () => {
  const rect = getContainedMediaRect(1200, 600, 720, 1080);
  assert.deepEqual(rect, { left: 400, top: 0, width: 400, height: 600 });
  assert.equal(rect.left + rect.width * 0.5, 600);
});
test('landscape footage is letterboxed instead of cropped on a phone', () => {
  assert.deepEqual(getContainedMediaRect(360, 640, 1280, 720), { left: 0, top: 218.75, width: 360, height: 202.5 });
  assert.deepEqual(getContainedMediaRect(0, 600, 1280, 720), { left: 0, top: 0, width: 0, height: 0 });
});
test('wheel units are normalized for mouse, Firefox lines and pages', () => {
  assert.equal(wheelPixels(3, 1, 600), 48); assert.equal(wheelPixels(2, 2, 600), 1200); assert.equal(wheelPixels(10, 0, 600), 10);
});
test('rapid scrolling coalesces to the most recent target', () => {
  const { video, clock, queue } = controller();
  queue.seek(1); for (let i = 2; i <= 9; i++) queue.seek(i);
  assert.deepEqual(video.dispatched, [1]); video.finish(); clock.advance(50);
  assert.deepEqual(video.dispatched, [1,9]); queue.dispose();
});
test('the last seek is delivered after throttling even if scrolling stops', () => {
  const { video, clock, queue } = controller();
  queue.seek(1); video.finish(); clock.advance(10); queue.seek(4);
  assert.deepEqual(video.dispatched,[1]); clock.advance(40);
  assert.deepEqual(video.dispatched,[1,4]); queue.dispose();
});
test('a missing seeked event cannot leave the queue locked', () => {
  const { video, clock, queue } = controller();
  queue.seek(1); queue.seek(5); video.finish(false); clock.advance(80);
  assert.deepEqual(video.dispatched,[1,5]); queue.dispose();
});
test('requested time is clamped to the playable last frame', () => {
  const { video, queue } = controller(); queue.seek(50);
  assert.equal(video.currentTime, 9.965); queue.dispose();
});
test('a source that is still loading accepts a pending destination', () => {
  const { video, queue } = controller(); video.readyState = 0;
  queue.seek(4); assert.equal(video.dispatched.length, 0);
  video.readyState = 2; video.dispatchEvent(new Event('loadeddata'));
  assert.deepEqual(video.dispatched,[4]); queue.dispose();
});
test('disposing or canceling removes pending work and listeners', () => {
  const { video, clock, queue } = controller(); queue.seek(1); queue.seek(8); queue.dispose();
  video.finish(); clock.advance(200); assert.deepEqual(video.dispatched,[1]); assert.equal(clock.tasks.size, 0);
});
const point: VideoHotspot = { id: 'a', title: 'Кялагаи', partName: 'Головной убор', description: 'Текст', timeSec: 1, visibleDurationSec: 4, xPercent: 20, yPercent: 30, trajectory: [{ timeSec: 1, xPercent: 20, yPercent: 30 },{ timeSec: 5, xPercent: 80, yPercent: 70 }] };
test('moving annotations interpolate by actual video time', () => {
  assert.deepEqual(getInterpolatedHotspotCoord(point,3), { x: 50, y: 50 });
  assert.deepEqual(getInterpolatedHotspotCoord(point,0), { x: 20, y: 30 });
  assert.deepEqual(getInterpolatedHotspotCoord(point,7), { x: 80, y: 70 });
});
test('legacy costume IDs, unsorted trajectories and duplicate keyframes are migrated', () => {
  const item = { ...DEFAULT_CATALOG[0], costumeId:'costume_karabakh_banoo', hotspots:[{...point, trajectory:[{timeSec:5,xPercent:80,yPercent:70},{timeSec:1,xPercent:10,yPercent:10},{timeSec:1,xPercent:20,yPercent:30}]}] };
  const result = normalizeCatalog([item])[0];
  assert.equal(result.costumeId, 'karabakh_banoo');
  assert.deepEqual(result.hotspots[0].trajectory?.map(k => k.timeSec), [1,5]);
  assert.equal(result.hotspots[0].trajectory?.[0].xPercent,20);
});
test('empty catalogs remain empty, duplicate IDs are rejected', () => {
  assert.deepEqual(normalizeCatalog([]),[]);
  assert.throws(() => normalizeCatalog([DEFAULT_CATALOG[0],DEFAULT_CATALOG[0]]), /уникальный ID/);
});
test('ephemeral blob URLs are not persisted, stable media references survive', () => {
  const item = normalizeCatalog([{...DEFAULT_CATALOG[0],videoUrl:'blob:temporary',blobStorageId:'saved-file'}])[0];
  assert.equal(item.videoUrl,undefined); assert.equal(item.blobStorageId,'saved-file');
});
test('unsafe media schemes and protocol-relative URLs are rejected', () => {
  for (const url of ['javascript:alert(1)','file:///video.mp4','//evil.test/movie.mp4','data:text/html,hi']) assert.throws(() => validMediaUrl(url));
  assert.equal(validMediaUrl('/media/video.mp4'),'/media/video.mp4');
});
test('failed persistence cannot update the in-memory catalog', () => {
  const before = getSavedShowcases();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{setItem(){throw new Error('quota');}}});
  assert.throws(() => saveShowcases([]),/quota/); assert.equal(getSavedShowcases(),before);
  delete (globalThis as any).localStorage;
});
