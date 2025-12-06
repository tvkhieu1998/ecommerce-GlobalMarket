import models from './src/models/index.js';
models.sequelize.sync().then(() => {
  console.log('Database & tables created!');
});