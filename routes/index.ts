import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// In a CommonJS module, __dirname and __filename are available globally.
const basename = path.basename(__filename);

try {
  fs.readdirSync(__dirname)
    .filter(file => {
      const isHidden = file.indexOf('.') === 0;
      const isThisFile = file === basename;
      const hasValidExtension = (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts');
      const isTestFile = file.includes('.test.') || file.includes('.spec.');

      return !isHidden && !isThisFile && hasValidExtension && !isTestFile;
    })
    .forEach(file => {
      const routeModule = require(path.join(__dirname, file));
      const route = routeModule.default || routeModule;
      const routeName = path.parse(file).name;

      if (route && typeof route.use === 'function') {
        router.use(`/${routeName}`, route);
        console.log(`✅ Mounted /${routeName} route from ${file}`);
      } else {
        console.warn(`⚠️  WARNING: File at ${file} does not export a valid Express router. Skipping.`);
      }
    });
} catch (error: any) {
  console.error(`❌ ERROR: Failed to load routes.`, error);
  process.exit(1); 
}

export default router;