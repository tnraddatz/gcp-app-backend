const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const basename = path.basename(__filename);

// Read all files in the current directory
fs.readdirSync(__dirname)
  .filter(file => {
    // Filter out this index file, non-JS files, and common test/spec files
    return (
      file.indexOf('.') !== 0 && // Exclude hidden files
      file !== basename && // Exclude this index file
      path.extname(file) === '.js' && // Only include .js files
      !file.endsWith('.test.js') && // Exclude test files
      !file.endsWith('.spec.js') // Exclude spec files
    );
  })
  .forEach(file => {
    try {
      // Use a more robust way to get the route name (e.g., 'user.v1' from 'user.v1.js')
      const routeName = path.parse(file).name;
      const route = require(path.join(__dirname, file));

      // Best practice: ensure the required module is actually a router
      if (route && typeof route.use === 'function') {
        router.use(`/${routeName}`, route);
        console.log(`✓ Mounted /api/${routeName} route from ${file}`);
      } else {
        console.warn(`✗ WARNING: File at ${file} does not export a valid Express router. Skipping.`);
      }
    } catch (error) {
      console.error(`✗ ERROR: Failed to load route ${file}.`, error);
      process.exit(1); // Exit with an error code
    }
  });

module.exports = router;