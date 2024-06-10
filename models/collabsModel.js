const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Collab = sequelize.define('Collab', {
  collab_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  collab_mode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bookmark_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'collabs',
  timestamps: false,
});


sequelize.sync({ alter: true }).then(() => {
  console.log('Database & tables created!');
});


module.exports = Collab;
