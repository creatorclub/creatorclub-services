const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const UsersDetails = require("../usersInfo/usersDetailsModel");

const Collab = sequelize.define('Collab', {
  collab_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: UsersDetails,
      key: 'user_id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.STRING,
    defaultValue:""
  },
  longitude: {
    type: DataTypes.STRING,
    defaultValue:""
  },
  city: {
    type: DataTypes.STRING,
    defaultValue:""
  },
  country: {
    type: DataTypes.STRING,
    defaultValue:""
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
    defaultValue:0
  },
  collabImageUrl:{
    type:DataTypes.STRING,
    allowNull:false
  }

}, {
  tableName: 'collabs',
  timestamps: false,
});



module.exports = Collab;
