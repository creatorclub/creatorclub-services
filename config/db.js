const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(
  "dev-cc",
  "postgres",
  "welcomeOOPS",
  {
    host: 'localhost',
    dialect: process.env.DB_DIALECT,
  }
);
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
testConnection();
module.exports = sequelize;