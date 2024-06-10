const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");


const UserProfileModel = sequelize.define(
  "UserProfile",
  {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique:true
    },
    name: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    imageurl: {
      type: DataTypes.STRING,
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    interest: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    active_collab: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    social_account: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    collab_count: {
      type: DataTypes.INTEGER,
    },
    user_description:{
      type:DataTypes.STRING
    },
    email:{
      type:DataTypes.STRING,
      allowNull: false
    },
    username:{
      type:DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: "users_profile",
    timestamps: false,
  }
);



  module.exports = UserProfileModel;