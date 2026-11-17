import { writeFileSync } from 'node:fs';
import { DEFAULT_CATALOG, normalizeCatalog } from '../src/utils/showcaseStore';
writeFileSync('public/catalog.json', JSON.stringify({ version: 1, showcases: normalizeCatalog(DEFAULT_CATALOG) }, null, 2));
