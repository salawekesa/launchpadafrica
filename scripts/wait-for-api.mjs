import { config } from 'dotenv';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const port = process.env.PORT || 3000;
const url = `http://localhost:${port}/api/health`;
execSync(`npx wait-on -t 30000 ${url}`, { stdio: 'inherit' });
