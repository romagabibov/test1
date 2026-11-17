import { zip, unzipSync, strFromU8, strToU8, Zippable } from 'fflate';
import { VideoShowcase } from '../types';
import { getSavedShowcases, normalizeCatalog, saveShowcases } from './showcaseStore';
import { readMediaBlob, saveVideoToDb, deleteVideoFromDb } from './videoDb';

const MAX_ARCHIVE = 400 * 1024 * 1024;
const safePath = (path: string) => /^[a-zA-Z0-9_./-]+$/.test(path) && !path.split('/').includes('..') && !path.startsWith('/');
function extension(blob: Blob) {
  return blob.type.includes('png') ? 'png' : blob.type.includes('image') ? 'jpg' : blob.type.includes('webm') ? 'webm' : blob.type.includes('quicktime') ? 'mov' : 'mp4';
}
function compress(files: Zippable) {
  return new Promise<Uint8Array>((resolve, reject) => zip(files, { level: 0 }, (error, result) => error ? reject(error) : resolve(result)));
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; document.body.append(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function exportCatalog(completeSite: boolean): Promise<void> {
  const files: Zippable = {};
  const entries = structuredClone(getSavedShowcases());
  let bytes = 0;
  const add = (path: string, data: Uint8Array) => {
    bytes += data.byteLength;
    if (bytes > MAX_ARCHIVE) throw new Error('В каталоге слишком много файлов для ZIP в браузере (лимит 400 МБ). Используйте внешние ссылки для больших видео.');
    files[path] = data;
  };
  const prefix = completeSite ? 'site/' : '';
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    for (const kind of ['video', 'poster'] as const) {
      const id = kind === 'video' ? entry.blobStorageId : entry.posterStorageId;
      const source = kind === 'video' ? entry.videoUrl : entry.posterUrl;
      let blob: Blob | null = null;
      if (id) {
        blob = await readMediaBlob(id);
        if (!blob) throw new Error(`Файл экспоната «${entry.title}» отсутствует. Загрузите его заново перед экспортом.`);
      } else if (source?.startsWith('/media/')) {
        const response = await fetch(source).catch(() => { throw new Error('Не удалось прочитать видео. Проверьте, что сайт запущен, и повторите экспорт.'); });
        if (!response.ok) throw new Error(`Не удалось прочитать файл экспоната «${entry.title}».`);
        blob = await response.blob();
      }
      if (blob) {
        const path = `media/${i + 1}-${kind}.${extension(blob)}`;
        add(prefix + path, new Uint8Array(await blob.arrayBuffer()));
        if (kind === 'video') entry.videoUrl = '/' + path;
        else entry.posterUrl = '/' + path;
      }
    }
    delete entry.blobStorageId; delete entry.posterStorageId;
  }
  add(prefix + 'catalog.json', strToU8(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), showcases: normalizeCatalog(entries) }, null, 2)));
  if (completeSite) {
    const response = await fetch('/build-manifest.json', { cache: 'no-cache' }).catch(() => { throw new Error('Не удалось получить файлы сайта. Проверьте соединение и повторите экспорт.'); });
    if (!response.ok || !response.headers.get('content-type')?.includes('json')) throw new Error('Экспорт сайта доступен в собранной версии. Выполните npm run build и npm run preview. Сейчас можно скачать резервную копию каталога.');
    const manifest = await response.json();
    if (!Array.isArray(manifest.files) || !manifest.files.includes('index.html')) throw new Error('Не найден манифест сборки сайта. Соберите проект заново.');
    const exportedFiles: string[] = ['catalog.json'];
    for (const path of manifest.files) {
      if (!safePath(path) || path === 'catalog.json' || path === 'build-manifest.json' || path.startsWith('media/')) continue;
      const asset = await fetch('/' + path);
      if (!asset.ok) throw new Error(`Не удалось скачать ресурс ${path}. Обновите страницу и повторите экспорт.`);
      add('site/' + path, new Uint8Array(await asset.arrayBuffer()));
      exportedFiles.push(path);
    }
    add('site/build-manifest.json', strToU8(JSON.stringify({ files: [...exportedFiles, 'build-manifest.json'] })));
    add('package.json', strToU8(JSON.stringify({ name: 'azheritage-published', private: true, version: '1.0.0', type: 'module', scripts: { build: 'node build.mjs' } }, null, 2)));
    add('build.mjs', strToU8("import { cpSync, rmSync } from 'node:fs';\nrmSync('dist', {recursive:true,force:true});\ncpSync('site','dist',{recursive:true});\n"));
    add('vercel.json', strToU8(JSON.stringify({ buildCommand: 'npm run build', outputDirectory: 'dist', framework: null }, null, 2)));
    add('README.md', strToU8('# azheritage — опубликованная коллекция\n\nРаспакуйте архив. Загрузите все файлы в корень GitHub-репозитория и подключите его к Vercel. Build Command: npm run build. Output Directory: dist. Framework: Other.\n\nМожно также загрузить содержимое папки site на статический хостинг.\n\nВидео и метки включены в архив; внешние ссылки продолжают загружаться с исходных серверов. В студии изменения сохраняются только в текущем браузере. Для обновления публичной версии снова скачайте сайт и выполните деплой. Серверной авторизации и общей базы данных в этой статической версии нет.\n'));
  } else {
    add('README.txt', strToU8('Это резервная копия каталога azheritage, включая загруженные видео. Для восстановления: Студия → Импорт каталога. Для публикации в исходном проекте скопируйте catalog.json и папку media в public и выполните новую сборку.'));
  }
  const archive = await compress(files);
  downloadBlob(new Blob([archive as BlobPart], { type: 'application/zip' }), completeSite ? 'AZHERITAGE_website.zip' : 'AZHERITAGE_catalog_backup.zip');
}

export async function importCatalog(file: File): Promise<VideoShowcase[]> {
  if (file.size > MAX_ARCHIVE) throw new Error('Размер архива превышает 400 МБ.');
  let entries: VideoShowcase[];
  const uploads: string[] = [];
  try {
    if (file.name.toLowerCase().endsWith('.json')) {
      const data = JSON.parse(await file.text());
      entries = normalizeCatalog(Array.isArray(data) ? data : data.showcases);
      if (entries.some(s => s.blobStorageId || s.posterStorageId)) throw new Error('Этот JSON ссылается на файлы другого браузера. Импортируйте ZIP с видео.');
    } else {
      let inflated = 0;
      const unpacked = unzipSync(new Uint8Array(await file.arrayBuffer()), { filter: entry => {
        if (!safePath(entry.name)) throw new Error('Архив содержит недопустимый путь.');
        inflated += entry.originalSize;
        if (inflated > MAX_ARCHIVE || entry.originalSize > MAX_ARCHIVE) throw new Error('Распакованный архив превышает 400 МБ.');
        return entry.name.endsWith('catalog.json') || /^(site\/|public\/)?media\//.test(entry.name);
      } });
      const catalogPath = ['catalog.json', 'site/catalog.json', 'public/catalog.json'].find(path => unpacked[path]);
      if (!catalogPath) throw new Error('В архиве не найден catalog.json.');
      const data = JSON.parse(strFromU8(unpacked[catalogPath]));
      entries = normalizeCatalog(data.showcases);
      for (const entry of entries) {
        delete entry.blobStorageId; delete entry.posterStorageId;
        for (const kind of ['video', 'poster'] as const) {
          const source = kind === 'video' ? entry.videoUrl : entry.posterUrl;
          if (!source?.startsWith('/media/')) continue;
          const relative = source.slice(1);
          const path = [relative, 'site/' + relative, 'public/' + relative].find(p => unpacked[p]);
          if (!path) throw new Error(`В архиве отсутствует файл ${relative}.`);
          const ext = relative.split('.').pop()?.toLowerCase();
          const type = ext === 'webm' ? 'video/webm' : ext === 'png' ? 'image/png' : /jpe?g/.test(ext ?? '') ? 'image/jpeg' : 'video/mp4';
          const id = `import_${crypto.randomUUID()}`;
          await saveVideoToDb(id, new Blob([unpacked[path] as BlobPart], { type }));
          uploads.push(id);
          if (kind === 'video') { entry.blobStorageId = id; delete entry.videoUrl; }
          else { entry.posterStorageId = id; delete entry.posterUrl; }
        }
      }
    }
    saveShowcases(entries);
    return entries;
  } catch (error) {
    await Promise.allSettled(uploads.map(deleteVideoFromDb));
    throw error;
  }
}
