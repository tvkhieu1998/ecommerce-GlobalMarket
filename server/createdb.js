import models from './src/models/index.js';
//models.sequelize.sync().then(() => {
  //console.log('Database & tables created!');
//});
const resetDatabase = async () => {
  try {
    console.log("Connecting and Refesh DB");
    await models.sequelize.sync({force: true});
    console.log("New DataBase Created");
    process.exit(0);
  } catch(error){
    console.error("Create Tables Error", error);
    process.exit(1);
  }
};
resetDatabase(); 