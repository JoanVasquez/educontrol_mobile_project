import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env');
const outputPath = resolve(process.cwd(), 'src/environments/environment.generated.ts');

const requiredKeys = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_MEASUREMENT_ID',
];

const fileEnv = parseEnvFile(envPath);
const env = { ...fileEnv, ...process.env };
const missingKeys = requiredKeys.filter((key) => !env[key]);

if (missingKeys.length > 0) {
  throw new Error(`Missing environment variables: ${missingKeys.join(', ')}`);
}

const content = `import type { FirebaseConfig } from '../app/core/firebase/firebase-config.model';

export const firebaseConfig: FirebaseConfig = {
  apiKey: ${JSON.stringify(env.FIREBASE_API_KEY)},
  authDomain: ${JSON.stringify(env.FIREBASE_AUTH_DOMAIN)},
  projectId: ${JSON.stringify(env.FIREBASE_PROJECT_ID)},
  storageBucket: ${JSON.stringify(env.FIREBASE_STORAGE_BUCKET)},
  messagingSenderId: ${JSON.stringify(env.FIREBASE_MESSAGING_SENDER_ID)},
  appId: ${JSON.stringify(env.FIREBASE_APP_ID)},
  measurementId: ${JSON.stringify(env.FIREBASE_MEASUREMENT_ID)},
};
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, content);

function parseEnvFile(path) {
  let raw;

  try {
    raw = readFileSync(path, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {};
    }

    throw error;
  }

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce((values, line) => {
      const separatorIndex = line.indexOf('=');

      if (separatorIndex === -1) {
        return values;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

      values[key] = value;
      return values;
    }, {});
}
