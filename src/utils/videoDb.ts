// Keep the original database name so existing uploaded videos remain available.
const DB_NAME = 'Azermiras_Video_DB_v1';
const STORE_NAME = 'showcase_videos';

async function withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('Браузер не поддерживает хранение видео. Откройте сайт в обычном режиме браузера.'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onerror = () => reject(new Error('Не удалось открыть хранилище видео.'));
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, mode);
      const operation = action(tx.objectStore(STORE_NAME));
      // Quota failures may abort after request success: wait for the transaction.
      tx.oncomplete = () => { db.close(); resolve(operation.result); };
      tx.onabort = tx.onerror = () => {
        db.close();
        reject(new Error('Не удалось сохранить файл. Проверьте свободное место и разрешения браузера.'));
      };
    };
  });
}

export async function readMediaBlob(key: string): Promise<Blob | null> {
  const result = await withStore<Blob | undefined>('readonly', store => store.get(key));
  return result instanceof Blob ? result : null;
}

export async function saveVideoToDb(key: string, blob: Blob): Promise<void> {
  await withStore('readwrite', store => store.put(blob, key));
}

export async function loadVideoFromDb(key: string): Promise<string | null> {
  const blob = await readMediaBlob(key);
  return blob ? URL.createObjectURL(blob) : null;
}

export async function deleteVideoFromDb(key: string): Promise<void> {
  await withStore('readwrite', store => store.delete(key));
}

export interface MediaDetails { duration: number; width: number; height: number; poster: Blob | null }

export async function inspectVideo(src: string): Promise<MediaDetails> {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timeout);
      video.removeAttribute('src');
      video.load();
    };
    const fail = () => { cleanup(); reject(new Error('Видео не открылось. Используйте прямую ссылку на MP4/WebM или файл MP4 (H.264).')); };
    const timeout = window.setTimeout(fail, 20000);
    video.onerror = fail;
    video.onloadeddata = async () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return fail();
      let poster: Blob | null = null;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(640, video.videoWidth);
        canvas.height = canvas.width * video.videoHeight / video.videoWidth;
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        poster = await new Promise<Blob | null>(done => canvas.toBlob(done, 'image/jpeg', 0.8));
      } catch { /* Remote playback can work without canvas/CORS permission. */ }
      const result = { duration: video.duration, width: video.videoWidth, height: video.videoHeight, poster };
      cleanup();
      resolve(result);
    };
    video.src = src;
  });
}
