
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createMatchPath } from 'tsconfig-paths';
import { readFileSync } from 'fs';

// Read and parse the tsconfig.json file
const tsconfig = JSON.parse(
  readFileSync(new URL('./tsconfig.json', import.meta.url), 'utf-8')
);

const matchPath = createMatchPath(
  resolve(dirname(fileURLToPath(import.meta.url)), tsconfig.compilerOptions.baseUrl || '.'),
  tsconfig.compilerOptions.paths || {}
);

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('@/')) {
    const matchedPath = matchPath(specifier);
    if (matchedPath) {
      const resolved = pathToFileURL(resolve(matchedPath)).href;
      return defaultResolve(resolved, context, defaultResolve);
    }
  }
  return defaultResolve(specifier, context, defaultResolve);
}