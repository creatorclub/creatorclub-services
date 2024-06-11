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
      defaultValue:""
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
    bio: {
      type: DataTypes.TEXT,
      defaultValue:""
    },
    imageurl: {
      type: DataTypes.STRING,
      defaultValue:""
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue:[]
    },
    interest: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue:[]
    },
    active_collab: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue:[]
    },
    social_account: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue:[]
    },
    collab_count: {
      type: DataTypes.INTEGER,
      defaultValue:0
    },
    user_description:{
      type:DataTypes.STRING,
      defaultValue:""
    },
    email:{
      type:DataTypes.STRING,
      allowNull: false
    },
    username:{
      type:DataTypes.STRING,
      defaultValue:""
    }
  },
  {
    tableName: "users_profile",
    timestamps: false,
  }
);



  module.exports = UserProfileModel;