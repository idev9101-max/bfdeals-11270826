import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const fromApp = join(here, 'app');
const toApp = join(out, 'app');
const fromShots = join(here, 'screenshots');
const toShots = join(out, 'screenshots');
const caps = { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 };

mkdirSync(out, { recursive: true });
cpSync(fromApp, toApp, { recursive: true });
mkdirSync(toShots, { recursive: true });
if (existsSync(fromShots)) cpSync(fromShots, toShots, { recursive: true });
writeFileSync(join(out, 'dossier.json'), buildDossier(out, caps));
