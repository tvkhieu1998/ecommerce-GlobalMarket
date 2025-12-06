import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';

// 1. Tự định nghĩa __dirname và __filename trong ESM
import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

import databaseConfig from '../config/config.cjs'; 
const config = databaseConfig[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const modelFiles = fs
  .readdirSync(__dirname, { withFileTypes: true })
  .filter(dirent => dirent.isFile())
  .map(dirent => dirent.name)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  });

try {
  await Promise.all(modelFiles.map(async (file) => {
    const fileUrl = pathToFileURL(path.join(__dirname, file)).href;
    const imported = await import(fileUrl);
    const modelDefinition = imported.default ?? imported; // support default or named export
    if (typeof modelDefinition !== 'function') {
      throw new TypeError(`${file} does not export a function (sequelize, DataTypes) => Model`);
    }
    const model = modelDefinition(sequelize, Sequelize.DataTypes);
    if (!model || !model.name) {
      throw new Error(`Model initialization failed for file: ${file}`);
    }
    db[model.name] = model;
  }));

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  // Optional: validate connection early
  // await sequelize.authenticate();

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
} catch (err) {
  // make startup failures visible
  console.error('Failed to initialize models:', err);
  throw err;
}
export default db;
